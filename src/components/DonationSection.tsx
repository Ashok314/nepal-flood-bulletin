import type { Lang, Messages } from "@/lib/i18n";
import { DONATION } from "@/lib/config";

export default function DonationSection({
  lang,
  m,
}: {
  lang: Lang;
  m: Messages;
}) {
  const d = DONATION;
  const fundName = lang === "ne" ? d.fundName_ne : d.fundName_en;
  const detailsReady = d.verified && d.accountNumber.trim() !== "";

  return (
    <section id="donate" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-900">{m.donationTitle}</h2>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
          {m.informationalBadge}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">{fundName}</h3>

        {/* Primary CTA -> official government portal */}
        {d.portalUrl && (
          <a
            href={d.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {m.donatePortal} ↗
          </a>
        )}

        {/* Optional verified bank details (secondary) */}
        {detailsReady && (
          <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {d.bankName && <Row label={m.donationBank} value={d.bankName} />}
            {d.accountName && (
              <Row label={m.donationAccountName} value={d.accountName} />
            )}
            {d.accountNumber && (
              <Row label={m.donationAccountNumber} value={d.accountNumber} />
            )}
          </dl>
        )}

        <p className="mt-4 text-xs text-slate-500">{m.donateInfoNote}</p>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-4 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
