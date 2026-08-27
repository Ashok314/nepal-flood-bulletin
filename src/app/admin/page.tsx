import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { getFeedConfig, getAllEntriesRaw } from "@/lib/feed";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const prisma = getPrisma();
  const [posts, cfg, entries, flags] = await Promise.all([
    prisma
      ? prisma.curatedPost
          .findMany({
            orderBy: [
              { pinned: "desc" },
              { order: "asc" },
              { createdAt: "desc" },
            ],
          })
          .catch(() => [])
      : Promise.resolve([]),
    getFeedConfig(),
    getAllEntriesRaw(),
    prisma ? prisma.moderationFlag.findMany().catch(() => []) : Promise.resolve([]),
  ]);

  const configSafe = {
    feedUrl: cfg.feedUrl,
    backupFeedUrl: cfg.backupFeedUrl,
    refreshInterval: cfg.refreshInterval,
    lastFetchedAt: cfg.lastFetchedAt ? cfg.lastFetchedAt.toISOString() : null,
    lastStatus: cfg.lastStatus,
    lastError: cfg.lastError,
    hasSnapshot: cfg.lastGoodPayload !== "",
  };

  return (
    <AdminDashboard
      admin={String(session.sub ?? "admin")}
      initialPosts={JSON.parse(JSON.stringify(posts))}
      initialConfig={configSafe}
      entries={entries}
      initialFlags={JSON.parse(JSON.stringify(flags))}
    />
  );
}
