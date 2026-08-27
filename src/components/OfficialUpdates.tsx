import type { Messages } from "@/lib/i18n";

export type PublicPost = {
  id: string;
  type: string;
  url: string;
  title: string;
  source: string;
  verified: boolean;
  pinned: boolean;
};

export default function OfficialUpdates({
  m,
  posts,
}: {
  m: Messages;
  posts: PublicPost[];
}) {
  return (
    <section id="updates" className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-900">{m.updatesTitle}</h2>
      <p className="mt-1 text-sm text-slate-500">{m.updatesIntro}</p>

      {posts.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
          {m.updatesEmpty}
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow"
            >
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {p.pinned && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                    {m.pinned}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    p.verified
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.verified ? m.verified : m.unverified}
                </span>
                {p.source && (
                  <span className="text-[11px] font-medium text-slate-500">
                    {p.source}
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-900 group-hover:text-brand">
                {p.title}
              </p>
              <span className="mt-2 text-xs font-semibold text-brand">
                {m.viewPost} →
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
