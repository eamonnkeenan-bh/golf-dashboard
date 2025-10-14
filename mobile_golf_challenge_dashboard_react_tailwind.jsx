import React, { useMemo, useState } from "react";

const BH_BRAND = { green: "#24765d", navy: "#0b1d30" } as const;
const BH_LOGO_SRC = "/mnt/data/BH Wordmark_Light BG.png";

const ENTRY_FEE = 50;
const PAYOUTS: Record<number, number> = { 1: 5000, 2: 1000, 3: 250 };

type AttemptType = "closest" | "putt" | "drive";
interface Attempt {
  id: string;
  name: string;
  course: string;
  date: string;
  distance: number;
  type: AttemptType;
}

const sampleData: Attempt[] = [
  { id: "1", name: "Alex Kim", course: "Pebble Beach", date: "2025-10-11", distance: 2.1, type: "closest" },
  { id: "2", name: "Riley Chen", course: "Pebble Beach", date: "2025-10-11", distance: 5.4, type: "putt" },
  { id: "3", name: "Jordan West", course: "St. Andrews", date: "2025-10-12", distance: 0.9, type: "closest" },
  { id: "4", name: "Sam Patel", course: "Augusta National", date: "2025-10-10", distance: 37.0, type: "putt" },
  { id: "5", name: "Jamie Lee", course: "St. Andrews", date: "2025-10-12", distance: 1.7, type: "closest" },
  { id: "6", name: "Chris Diaz", course: "Pebble Beach", date: "2025-10-13", distance: 48.2, type: "putt" },
  { id: "7", name: "Alex Kim", course: "Augusta National", date: "2025-10-09", distance: 3.0, type: "closest" },
  { id: "8", name: "Riley Chen", course: "St. Andrews", date: "2025-10-12", distance: 22.6, type: "putt" },
  { id: "9", name: "Morgan Silva", course: "Pebble Beach", date: "2025-10-14", distance: 0.6, type: "closest" },
  { id: "10", name: "Taylor Brooks", course: "Augusta National", date: "2025-10-12", distance: 55.0, type: "putt" },
  { id: "11", name: "Alex Kim", course: "Pebble Beach", date: "2025-10-11", distance: 310, type: "drive" },
  { id: "12", name: "Jamie Lee", course: "St. Andrews", date: "2025-10-12", distance: 327, type: "drive" },
  { id: "13", name: "Morgan Silva", course: "Pebble Beach", date: "2025-10-14", distance: 301, type: "drive" },
  { id: "14", name: "Chris Diaz", course: "Pebble Beach", date: "2025-10-13", distance: 342, type: "drive" },
];

function withinDateRange(dateStr: string, from?: string, to?: string) {
  if (!from && !to) return true;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to) {
    const t = new Date(to);
    t.setDate(t.getDate() + 1);
    if (d > t) return false;
  }
  return true;
}

function entriesFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (h % 3) + 1;
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function abbrevName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0][0]?.toUpperCase() || "";
  const last = parts.slice(1).join(" ");
  return `${first}. ${last}`;
}

export default function GolfChallengeDashboard() {
  const [rows] = useState<Attempt[]>(sampleData);
  const [golfer, setGolfer] = useState("");
  const [course, setCourse] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const golferOptions = useMemo(() => Array.from(new Set(rows.map(r => r.name))).sort(), [rows]);
  const courseOptions = useMemo(() => Array.from(new Set(rows.map(r => r.course))).sort(), [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const byGolfer = golfer ? r.name === golfer : true;
      const byCourse = course ? r.course === course : true;
      const byDate = withinDateRange(r.date, fromDate, toDate);
      return byGolfer && byCourse && byDate;
    });
  }, [rows, golfer, course, fromDate, toDate]);

  const closest = useMemo(() => filtered.filter(r => r.type === "closest").sort((a, b) => a.distance - b.distance), [filtered]);
  const putts = useMemo(() => filtered.filter(r => r.type === "putt").sort((a, b) => b.distance - a.distance), [filtered]);
  const drives = useMemo(() => filtered.filter(r => r.type === "drive").sort((a, b) => b.distance - a.distance), [filtered]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      const inc = entriesFor(r.name);
      map.set(r.name, (map.get(r.name) || 0) + inc);
    }
    return Array.from(map.entries())
      .map(([name, entries]) => ({ name, entries }))
      .sort((a, b) => b.entries - a.entries);
  }, [filtered]);

  const clearFilters = () => {
    setGolfer("");
    setCourse("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <img src={BH_LOGO_SRC} className="h-12 w-auto object-contain" />
          <h1 className="text-xl font-semibold tracking-tight">Golf Challenge Dashboard</h1>
          <button
            onClick={() => setShowFilters(s => !s)}
            className="ml-auto h-9 rounded-lg px-3 text-xs font-medium text-white"
            style={{ backgroundColor: BH_BRAND.green }}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div id="filters-panel" className="mx-auto max-w-5xl px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-slate-600 mb-1">Golfer</label>
              <select className="h-10 rounded-xl border border-slate-300 px-3 text-xs focus:ring-2" style={{ outlineColor: BH_BRAND.green }} value={golfer} onChange={e => setGolfer(e.target.value)}>
                <option value="">All golfers</option>
                {golferOptions.map(g => (
                  <option key={g} value={g}>{abbrevName(g)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-slate-600 mb-1">Course</label>
              <select className="h-10 rounded-xl border border-slate-300 px-3 text-xs focus:ring-2" style={{ outlineColor: BH_BRAND.green }} value={course} onChange={e => setCourse(e.target.value)}>
                <option value="">All courses</option>
                {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-600 mb-1">From</label>
                <input type="date" className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:ring-2" style={{ outlineColor: BH_BRAND.green }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-600 mb-1">To</label>
                <input type="date" className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:ring-2" style={{ outlineColor: BH_BRAND.green }} value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="w-full h-10 rounded-xl text-white text-xs font-medium" style={{ backgroundColor: BH_BRAND.green }}>Clear filters</button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 space-y-8">
        <Leaderboard title="Closest to the Hole" subtitle={`Entry Fee: ${formatMoney(ENTRY_FEE)} | Payouts: 1st ${formatMoney(PAYOUTS[1])}, 2nd ${formatMoney(PAYOUTS[2])}, 3rd ${formatMoney(PAYOUTS[3])}`} rows={closest} />
        <Leaderboard title="Longest Putt Challenge" subtitle={`Entry Fee: ${formatMoney(ENTRY_FEE)} | Payouts: 1st ${formatMoney(PAYOUTS[1])}, 2nd ${formatMoney(PAYOUTS[2])}, 3rd ${formatMoney(PAYOUTS[3])}`} rows={putts} />
        <Leaderboard title="Longest Drive Challenge" subtitle={`Entry Fee: ${formatMoney(ENTRY_FEE)} | Payouts: 1st ${formatMoney(PAYOUTS[1])}, 2nd ${formatMoney(PAYOUTS[2])}, 3rd ${formatMoney(PAYOUTS[3])}`} rows={drives} />
        <TotalsTable title="Entries by Golfer (All Events)" rows={totals} />
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-500">
        <img src={BH_LOGO_SRC} className="h-6 w-auto mx-auto mb-2" />
        <p>© {new Date().getFullYear()} Betting Hero</p>
      </footer>
    </div>
  );
}

function Leaderboard({ title, subtitle, rows }: { title: string; subtitle: string; rows: Attempt[] }) {
  return (
    <section>
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-600">
            <tr>
              <th className="px-3 py-2">#</th>
              <th>Name</th>
              <th>Course</th>
              <th>Date</th>
              <th className="text-right pr-3">Distance (ft)</th>
              <th className="text-right pr-3">Entries</th>
              <th className="text-right pr-3">Payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-3 text-slate-500">No entries found.</td></tr>
            ) : (
              rows.map((r, i) => {
                const entries = entriesFor(r.name);
                const payout = PAYOUTS[i + 1] || 0;
                const isLeader = i === 0;
                return (
                  <tr key={r.id} className={isLeader ? "bg-emerald-50" : i % 2 ? "bg-slate-50/60" : "bg-white"}>
                    <td className="px-3 py-2 font-medium">{i + 1}</td>
                    <td>{abbrevName(r.name)}</td>
                    <td>{r.course}</td>
                    <td>{r.date}</td>
                    <td className="text-right pr-3 font-semibold">{r.distance.toFixed(1)}</td>
                    <td className="text-right pr-3">{entries}</td>
                    <td className="text-right pr-3 font-medium">{payout ? formatMoney(payout) : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TotalsTable({ title, rows }: { title: string; rows: { name: string; entries: number }[] }) {
  return (
    <section>
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-[11px] text-slate-500">Sums entries across filtered events (no payouts).</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-600"><tr><th className="px-3 py-2">Rank</th><th>Golfer</th><th className="text-right pr-3">Total Entries</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-3 text-slate-500">No entries found.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.name} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                  <td className="px-3 py-2 font-medium">{i + 1}</td>
                  <td>{abbrevName(r.name)}</td>
                  <td className="text-right pr-3 font-semibold">{r.entries}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
