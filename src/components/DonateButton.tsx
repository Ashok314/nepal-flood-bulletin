"use client";

import { track } from "@vercel/analytics";

/**
 * Donation CTA. Fires a Vercel Analytics custom event ("pm_fund_click") so we
 * can see how many people head to the official PM Relief Fund portal, then
 * opens the official government portal in a new tab.
 */
export default function DonateButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("pm_fund_click")}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
    >
      {label} ↗
    </a>
  );
}
