"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  type: string;
  url: string;
  title: string;
  source: string;
  verified: boolean;
  pinned: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type Config = {
  feedUrl: string;
  backupFeedUrl: string;
  refreshInterval: number;
  lastFetchedAt: string | null;
  lastStatus: string;
  lastError: string;
  hasSnapshot: boolean;
};

type Entry = {
  id: string;
  name: string;
  status: "missing" | "found";
  place?: string;
  phone?: string;
  when?: string;
};

type Flag = {
  id: string;
  entryId: string;
  action: string;
  reason: string;
  createdAt: string;
};

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function AdminDashboard({
  admin,
  initialPosts,
  initialConfig,
  entries,
  initialFlags,
}: {
  admin: string;
  initialPosts: Post[];
  initialConfig: Config;
  entries: Entry[];
  initialFlags: Flag[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"posts" | "feed">("posts");

  async function logout() {
    await api("/api/admin/logout", "POST").catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <h1 className="font-bold text-slate-900">Admin</h1>
          <nav className="ml-4 flex gap-1">
            <TabBtn active={tab === "posts"} onClick={() => setTab("posts")}>
              Curated posts
            </TabBtn>
            <TabBtn active={tab === "feed"} onClick={() => setTab("feed")}>
              Feed & moderation
            </TabBtn>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-brand"
            >
              View site ↗
            </a>
            <span className="text-slate-400">{admin}</span>
            <button
              onClick={logout}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {tab === "posts" ? (
          <PostsPanel initialPosts={initialPosts} />
        ) : (
          <FeedPanel
            initialConfig={initialConfig}
            entries={entries}
            initialFlags={initialFlags}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Curated posts ---------------- */

function PostsPanel({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    type: "tweet",
    url: "",
    title: "",
    source: "",
    verified: false,
    pinned: false,
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const created = (await api("/api/admin/posts", "POST", form)) as Post;
      setPosts((p) => [created, ...p]);
      setForm({
        type: "tweet",
        url: "",
        title: "",
        source: "",
        verified: false,
        pinned: false,
      });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to add");
    }
  }

  async function patch(id: string, data: Partial<Post>) {
    try {
      const updated = (await api(
        `/api/admin/posts/${id}`,
        "PUT",
        data,
      )) as Post;
      setPosts((p) => p.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await api(`/api/admin/posts/${id}`, "DELETE");
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
      {/* Add form */}
      <form
        onSubmit={add}
        className="h-fit rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-900">Add official post</h2>
        <p className="mt-1 text-xs text-slate-500">
          Paste a link to a verified post from an official handle or agency.
          Nothing here is auto-published from Twitter/X.
        </p>

        <Labeled label="Type">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="tweet">Tweet / X post</option>
            <option value="link">Link</option>
            <option value="notice">Official notice</option>
          </select>
        </Labeled>

        <Labeled label="URL">
          <input
            type="url"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://x.com/…"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </Labeled>

        <Labeled label="Title / summary">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </Labeled>

        <Labeled label="Source (e.g. @NepalPolice, NDRRMA)">
          <input
            type="text"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </Labeled>

        <div className="mt-3 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) =>
                setForm({ ...form, verified: e.target.checked })
              }
            />
            Verified
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
            />
            Pinned
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Add post
        </button>
        {msg && <p className="mt-2 text-sm text-rose-600">{msg}</p>}
      </form>

      {/* List */}
      <div>
        <h2 className="mb-3 font-semibold text-slate-900">
          Posts ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No posts yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {p.title}
                    </p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-brand hover:underline"
                    >
                      {p.url}
                    </a>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {p.type}
                      {p.source ? ` · ${p.source}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    className="shrink-0 text-xs font-medium text-rose-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Toggle
                    on={p.verified}
                    onLabel="Verified"
                    offLabel="Unverified"
                    onClick={() => patch(p.id, { verified: !p.verified })}
                  />
                  <Toggle
                    on={p.pinned}
                    onLabel="Pinned"
                    offLabel="Not pinned"
                    onClick={() => patch(p.id, { pinned: !p.pinned })}
                  />
                  <Toggle
                    on={p.published}
                    onLabel="Published"
                    offLabel="Hidden"
                    onClick={() => patch(p.id, { published: !p.published })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Feed config + moderation ---------------- */

function FeedPanel({
  initialConfig,
  entries,
  initialFlags,
}: {
  initialConfig: Config;
  entries: Entry[];
  initialFlags: Flag[];
}) {
  const router = useRouter();
  const [feedUrl, setFeedUrl] = useState(initialConfig.feedUrl);
  const [backupFeedUrl, setBackupFeedUrl] = useState(
    initialConfig.backupFeedUrl,
  );
  const [refreshInterval, setRefreshInterval] = useState(
    initialConfig.refreshInterval,
  );
  const [status, setStatus] = useState(initialConfig);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  const [flags, setFlags] = useState<Record<string, string>>(
    Object.fromEntries(initialFlags.map((f) => [f.entryId, f.action])),
  );

  async function saveConfig() {
    setMsg("");
    try {
      const updated = (await api("/api/admin/feed-config", "PUT", {
        feedUrl,
        backupFeedUrl,
        refreshInterval,
      })) as Config;
      setStatus((s) => ({ ...s, ...updated }));
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function refreshNow() {
    setMsg("Refreshing…");
    try {
      await api("/api/admin/refresh", "POST");
      setMsg("Feed refreshed. Reloading entries…");
      router.refresh();
    } catch (err) {
      setMsg(
        "Refresh failed: " + (err instanceof Error ? err.message : "error"),
      );
    }
  }

  async function setFlag(entryId: string, action: "hide" | "flag") {
    try {
      await api("/api/admin/moderation", "POST", { entryId, action });
      setFlags((f) => ({ ...f, [entryId]: action }));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  async function clearFlag(entryId: string) {
    try {
      await api(
        `/api/admin/moderation?entryId=${encodeURIComponent(entryId)}`,
        "DELETE",
      );
      setFlags((f) => {
        const next = { ...f };
        delete next[entryId];
        return next;
      });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return entries;
    return entries.filter((e) =>
      [e.name, e.place, e.phone].filter(Boolean).join(" ").toLowerCase().includes(s),
    );
  }, [q, entries]);

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Feed source</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Labeled label="Feed URL (JSON)">
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </Labeled>
          <Labeled label="Backup feed URL (optional)">
            <input
              type="url"
              value={backupFeedUrl}
              onChange={(e) => setBackupFeedUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </Labeled>
          <Labeled label="Refresh interval (seconds)">
            <input
              type="number"
              min={30}
              value={refreshInterval}
              onChange={(e) =>
                setRefreshInterval(Number(e.target.value) || 0)
              }
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </Labeled>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={saveConfig}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Save
          </button>
          <button
            onClick={refreshNow}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh now
          </button>
          <span className="text-sm text-slate-500">
            Last:{" "}
            <span
              className={
                status.lastStatus === "ok"
                  ? "text-emerald-600"
                  : status.lastStatus === "error"
                    ? "text-rose-600"
                    : "text-slate-500"
              }
            >
              {status.lastStatus}
            </span>
            {status.lastFetchedAt
              ? ` · ${new Date(status.lastFetchedAt).toLocaleString()}`
              : ""}
          </span>
          {msg && <span className="text-sm text-slate-600">{msg}</span>}
        </div>
        {status.lastError && status.lastStatus === "error" && (
          <p className="mt-2 text-xs text-rose-600">{status.lastError}</p>
        )}
      </div>

      {/* Moderation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">
          Moderate feed entries ({entries.length})
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hidden entries are removed from the public page. The upstream source
          is never changed — clearing a flag restores the entry.
        </p>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search entries…"
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No entries loaded yet. Try “Refresh now”.
          </p>
        ) : (
          <ul className="mt-3 max-h-[28rem] divide-y divide-slate-100 overflow-auto">
            {filtered.map((e) => {
              const flag = flags[e.id];
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      e.status === "found"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {e.status}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {e.name}
                      {flag && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          {flag}
                        </span>
                      )}
                    </p>
                    {e.place && (
                      <p className="truncate text-xs text-slate-400">
                        {e.place}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs font-medium">
                    <button
                      onClick={() => setFlag(e.id, "hide")}
                      className="text-rose-600 hover:underline"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => setFlag(e.id, "flag")}
                      className="text-amber-600 hover:underline"
                    >
                      Flag
                    </button>
                    {flag && (
                      <button
                        onClick={() => clearFlag(e.id)}
                        className="text-slate-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Small UI helpers ---------------- */

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
        active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 block text-sm font-medium text-slate-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  on,
  onLabel,
  offLabel,
  onClick,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-semibold ${
        on
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}
