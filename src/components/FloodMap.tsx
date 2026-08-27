"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Station } from "@/lib/rivers";
import type { Lang, Messages } from "@/lib/i18n";
import {
  gaugeCoords,
  CORRIDOR_CONFIRMED,
  CORRIDOR_ESTIMATED,
  ENTRY_POINT,
  KATHMANDU,
} from "@/lib/geo";

function riskColor(risk: Station["risk"]): string {
  return risk === "danger"
    ? "#dc2626"
    : risk === "warning"
      ? "#f59e0b"
      : risk === "normal"
        ? "#059669"
        : "#64748b";
}

export default function FloodMap({
  stations,
  m,
  lang,
}: {
  stations: Station[];
  m: Messages;
  lang: Lang;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = (mod as any).default ?? mod;
      if (cancelled || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      // Corridor polylines
      L.polyline(CORRIDOR_CONFIRMED, {
        color: "#b91c1c",
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      L.polyline(CORRIDOR_ESTIMATED, {
        color: "#f59e0b",
        weight: 4,
        opacity: 0.9,
        dashArray: "6 10",
      }).addTo(map);

      // Entry point
      L.circleMarker(ENTRY_POINT.latlng, {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: "#b45309",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(`<b>${m.mapEntry}</b><br>${ENTRY_POINT.label}`);

      // Kathmandu (orientation)
      L.circleMarker(KATHMANDU, {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#334155",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup("Kathmandu");

      // Live DHM gauges
      const gaugePoints: [number, number][] = [];
      for (const s of stations) {
        const c = gaugeCoords(s.name || s.nameNp);
        if (!c) continue;
        gaugePoints.push(c);
        const title = lang === "ne" ? s.nameNp : s.name;
        const riskLabel =
          s.risk === "danger"
            ? m.riverDanger
            : s.risk === "warning"
              ? m.riverWarn
              : m.riverNormal;
        const popup = `
          <div style="min-width:170px">
            <b>${title}</b>
            <div style="margin-top:4px;font-weight:600;color:${riskColor(s.risk)}">${riskLabel}</div>
            <div>${m.riverLevel}: <b>${s.levelM != null ? s.levelM.toFixed(2) + " m" : "—"}</b></div>
            <div style="color:#64748b;font-size:12px">${m.riverWarn}: ${s.warningM ?? "—"} m &middot; ${m.riverDanger}: ${s.dangerM ?? "—"} m</div>
            ${s.source ? `<a href="${s.source}" target="_blank" rel="noopener" style="color:#b91c1c;font-size:12px">${m.riverSourceDhm} &#8599;</a>` : ""}
          </div>`;
        L.circleMarker(c, {
          radius: 9,
          color: "#ffffff",
          weight: 2,
          fillColor: riskColor(s.risk),
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup(popup);
      }

      const bounds = L.latLngBounds([
        ...CORRIDOR_CONFIRMED,
        ...CORRIDOR_ESTIMATED,
        ...gaugePoints,
      ]);
      map.fitBounds(bounds, { padding: [30, 30] });
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stations, lang, m]);

  return (
    <div
      ref={elRef}
      className="isolate h-[440px] w-full rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
      aria-label="Flood map"
    />
  );
}
