export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-brand to-brand-dark text-white">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
      <p className="text-sm text-white/80">
        Loading rescue data… · उद्धार तथ्याङ्क लोड हुँदै…
      </p>
    </div>
  );
}
