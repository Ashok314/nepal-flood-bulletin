// Shown while the server fetches the data. It mirrors the hero layout so the
// page looks present with just the counts loading — not a full-screen spinner.
export default function Loading() {
  return (
    <div>
      <div className="h-9 bg-slate-900" />
      <div className="border-b border-brand-dark/40 bg-brand-dark/95">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <span className="text-sm font-bold uppercase tracking-wide text-white">
            Nepal Flood
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-b from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:py-12">
          <div className="h-6 w-72 max-w-full animate-pulse rounded-full bg-white/15" />
          <div className="mt-3 h-8 w-96 max-w-full animate-pulse rounded bg-white/20 sm:h-12" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />

          {/* search bar shape */}
          <div className="mt-4 max-w-4xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-xl">
              <div className="h-11 flex-1 rounded-xl bg-slate-100" />
              <div className="h-11 w-24 rounded-xl bg-brand/80" />
            </div>
          </div>

          {/* counts area — a small spinner where the numbers will land */}
          <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Loading rescue data… · उद्धार तथ्याङ्क लोड हुँदै…</span>
          </div>
        </div>
      </div>
    </div>
  );
}
