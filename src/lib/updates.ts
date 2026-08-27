import { SITE } from "@/lib/config";

/**
 * Live "what just changed" feed, read from the source repo's commit history via
 * the public GitHub API. The maintainer's commit messages ARE the changelog
 * (e.g. "हराएको: नयाँ रिपोर्ट ६ (names…)" = "Missing: 6 new reports"). Cached in
 * memory to stay well under the unauthenticated GitHub rate limit.
 */

export type UpdateItem = {
  date: string; // ISO
  message: string; // first line of the commit message
  sha: string; // short sha
  url: string; // link to the commit
};

let cache: { items: UpdateItem[]; at: number } | null = null;
const TTL_MS = 3 * 60 * 1000;
const TIMEOUT_MS = 8_000;

export async function getRecentUpdates(): Promise<UpdateItem[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${SITE.repo}/commits?path=family.json&per_page=12`,
      {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "nepal-flood-bulletin",
        },
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const items: UpdateItem[] = (Array.isArray(data) ? data : []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => ({
        date: c?.commit?.author?.date ?? c?.commit?.committer?.date ?? "",
        message: String(c?.commit?.message ?? "").split("\n")[0],
        sha: String(c?.sha ?? "").slice(0, 7),
        url: c?.html_url ?? "",
      }),
    );
    cache = { items, at: Date.now() };
    return items;
  } catch {
    return cache?.items ?? [];
  } finally {
    clearTimeout(timer);
  }
}
