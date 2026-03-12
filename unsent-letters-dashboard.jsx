import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Brand Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f0e6f6",
  bgSoft: "#f7f1fb",
  card: "#ffffff",
  plum: "#3b2255",
  plumLight: "#6b5280",
  orange: "#d4572a",
  orangeLight: "#f0a07a",
  orangeFaint: "#fdf0ea",
  gray: "#9a8ea6",
  grayLight: "#d4ccde",
  grayFaint: "#ece6f2",
  white: "#ffffff",
  green: "#3d9e6f",
  greenFaint: "#e8f5ee",
  red: "#c94040",
  yellow: "#b8860b",
  yellowFaint: "#fef3e0",
  violet: "#6b5eb0",
  violetFaint: "#eae7f5",
};
const font = `"Inter", "Helvetica Neue", system-ui, sans-serif`;
const serif = `"Georgia", "Times New Roman", serif`;

// ─── Default Data (seeded from real Substack exports, Mar 12 2026) ────────────
const DEFAULT_SUBSCRIBER_DATA = [
  { month: "Jan", subs: 107, new: 107, churned: 0 },
  { month: "Feb", subs: 337, new: 230, churned: 0 },
  { month: "Mar", subs: 403, new: 66,  churned: 0 },
];

// Cumulative followers from Substack followers export (end-of-month snapshots)
const DEFAULT_FOLLOWER_DATA = [
  { month: "Jan", followers: 149 },
  { month: "Feb", followers: 432 },
  { month: "Mar", followers: 526 },
];

// Real post stats from Substack dashboard (views = Substack "Views", openRate = "Opened %")
const DEFAULT_POSTS = [
  { id:  1, title: "watering dead plants & other acts of loyalty", series: "unsent letter", date: "Mar 7",  opens: 350, openRate: 22, likes: 40, comments: 31, restacks: 8  },
  { id:  2, title: "not your skyscanner",                          series: "unsent letter", date: "Feb 28", opens: 344, openRate: 25, likes: 52, comments: 46, restacks: 11 },
  { id:  3, title: "on the thing that goes beyond",                series: "personal essay", date: "Feb 25", opens: 642, openRate: 27, likes: 70, comments: 59, restacks: 15 },
  { id:  4, title: "grumpy cat",                                   series: "unsent letter", date: "Feb 21", opens: 370, openRate: 27, likes: 43, comments: 29, restacks: 8  },
  { id:  5, title: "on presence",                                  series: "personal essay", date: "Feb 15", opens: 473, openRate: 25, likes: 51, comments: 44, restacks: 11 },
  { id:  6, title: "on the boundaries we can draw",                series: "personal essay", date: "Feb 7",  opens: 507, openRate: 39, likes: 65, comments: 39, restacks: 14 },
  { id:  7, title: "on goodbyes, or the lack thereof",             series: "personal essay", date: "Feb 4",  opens: 356, openRate: 31, likes: 52, comments: 41, restacks: 11 },
  { id:  8, title: "on loving and being loved",                    series: "personal essay", date: "Jan 30", opens: 535, openRate: 39, likes: 52, comments: 42, restacks: 12 },
  { id:  9, title: "on beauty",                                    series: "personal essay", date: "Jan 25", opens: 413, openRate: 53, likes: 51, comments: 52, restacks: 10 },
  { id: 10, title: "the guilt of living a good life on the internet", series: "personal essay", date: "Jan 25", opens: 387, openRate: 80, likes: 49, comments: 33, restacks: 8  },
  { id: 11, title: "on nature",                                    series: "personal essay", date: "Jan 23", opens: 86,  openRate: 50, likes: 9,  comments: 7,  restacks: 2  },
];

const DEFAULT_PIPELINE = [
  { id: 101, title: "on the weight of unspoken things", series: "unsent letter #008", targetDate: "Mar 14", topic: "vulnerability", status: "scheduled" },
  { id: 102, title: "the museum of unfinished people", series: "unsent letter #009", targetDate: "Mar 21", topic: "growth", status: "drafting" },
  { id: 103, title: "tokyo in black & white", series: "ramble", targetDate: "Mar 17", topic: "travel / reflection", status: "drafting" },
  { id: 104, title: "why we keep score", series: "unsent letter #010", targetDate: "Mar 28", topic: "relationships", status: "idea" },
  { id: 105, title: "on names we outgrow", series: "ramble", targetDate: "Apr 4", topic: "identity", status: "idea" },
  { id: 106, title: "the confession jar (readers edition)", series: "confession", targetDate: "Apr 1", topic: "community", status: "idea" },
];

const DEFAULT_QUEUE = [
  {
    id: 201, from: "anonymous", received: "Mar 8", status: "considering",
    subject: "a letter to the person who left without saying goodbye",
    content: "you left without saying goodbye. not even a text. not even a 'this isn't working.' one day you were there and the next you just... weren't.\n\ni keep replaying the last time i saw you, trying to find the clue i missed. was it the way you laughed too quickly? the way you checked your phone twice while i was mid-sentence? i've been over it so many times that the memory doesn't even feel real anymore. it feels like a story i'm telling myself.\n\nthe worst part isn't the leaving. the worst part is that you took the explanation with you.",
    notes: "really raw — something about the abruptness feels universal", linkedPost: "",
  },
  {
    id: 202, from: "anonymous", received: "Mar 5", status: "considering",
    subject: "to my younger self who thought she had to earn love",
    content: "i wish i could tell you that love isn't a performance review. that you don't have to be useful, or easy, or low-maintenance to deserve it.\n\nyou were so good at making yourself small. at apologising for needs you hadn't even expressed yet. at laughing it off, at being chill, at 'no really it's fine.'\n\nit wasn't fine. and you knew it wasn't fine. you just didn't think you were allowed to say so.",
    notes: "ties into the loyalty theme from #007", linkedPost: "",
  },
  {
    id: 203, from: "M.", received: "Feb 27", status: "new",
    subject: "to the city i moved away from",
    content: "i think about you more than i expected to. not with longing exactly — more like the specific ache of something that shaped you before you knew it was shaping you.\n\ni left because i needed to. and i'd leave again. but i think i left a version of myself in your streets that i'll never fully get back.",
    notes: "", linkedPost: "",
  },
  {
    id: 204, from: "anonymous", received: "Feb 20", status: "used",
    subject: "to the friend who stayed even when i pushed her away",
    content: "i don't know why you stayed. i was impossible that year. i cancelled plans, went silent for weeks, gave you the bare minimum and expected you to keep showing up. and you did.\n\ni never thanked you properly. i think i was afraid that if i acknowledged what you'd done, i'd have to acknowledge how bad things had been.",
    notes: "inspired the boundaries post", linkedPost: "unsent letter #003",
  },
  {
    id: 205, from: "R.", received: "Feb 18", status: "new",
    subject: "to the version of me that was always performing happiness",
    content: "you were exhausting, but i understand you now. you were just trying to take up less space. to be the easiest version of yourself. to not burden anyone with the real thing.\n\ni'm trying to let her rest.",
    notes: "", linkedPost: "",
  },
  {
    id: 206, from: "anonymous", received: "Feb 10", status: "archived",
    subject: "to the job i gave everything to",
    content: "i don't have anything poetic to say to you. i just want my evenings back.",
    notes: "too niche, maybe revisit later", linkedPost: "",
  },
];

// ─── CSV Parsing ──────────────────────────────────────────────────────────────
function parseSubscriberCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  // Find the date column — Substack uses "created_at" or "subscription_date"
  const dateCol = headers.findIndex(h => h.includes("created") || h.includes("date") || h.includes("joined"));
  if (dateCol === -1) return null;

  // Parse each subscriber row
  const entries = lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
    return { date: cols[dateCol] };
  }).filter(e => e.date);

  // Group by month
  const monthCounts = {};
  entries.forEach(({ date }) => {
    const d = new Date(date);
    if (isNaN(d)) return;
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });

  // Build sorted array with cumulative totals
  const sorted = Object.entries(monthCounts).sort((a, b) => new Date("1 " + a[0]) - new Date("1 " + b[0]));
  let cumulative = 0;
  return sorted.map(([month, count]) => {
    cumulative += count;
    return { month: month.split(" ")[0], subs: cumulative, new: count, churned: 0 };
  });
}

// Follower CSV from Substack: headerless, two-column format — "YYYY/MM/DD,cumulativeCount"
// Takes the last (highest) cumulative count per month as that month's follower total.
function parseFollowerCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (!lines.length) return null;

  // Detect headerless daily-cumulative format: first line starts with a date
  const firstLine = lines[0].trim();
  const isHeaderless = /^\d{4}[\/\-]\d{2}[\/\-]\d{2}/.test(firstLine);

  if (isHeaderless) {
    // Each line: "YYYY/MM/DD,count" — data is cumulative, so take last value per month
    const monthLast = {};
    const monthOrder = [];
    lines.forEach(line => {
      const parts = line.split(",");
      if (parts.length < 2) return;
      const dateStr = parts[0].trim().replace(/\//g, "-");
      const count = parseInt(parts[1].trim(), 10);
      const d = new Date(dateStr);
      if (isNaN(d) || isNaN(count)) return;
      const key = d.toLocaleString("en-US", { month: "short" });
      if (monthLast[key] === undefined) monthOrder.push(key);
      monthLast[key] = count; // overwrite each time → last entry wins
    });
    return monthOrder.map(month => ({ month, followers: monthLast[month] }));
  }

  // Fallback: header-based format (date column + one row per follower)
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const dateCol = headers.findIndex(h => h.includes("created") || h.includes("date") || h.includes("joined") || h.includes("followed"));
  if (dateCol === -1) return null;
  const monthCounts = {};
  const monthOrder = [];
  lines.slice(1).forEach(line => {
    const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
    const d = new Date(cols[dateCol]);
    if (isNaN(d)) return;
    const key = d.toLocaleString("en-US", { month: "short" });
    if (!monthCounts[key]) { monthCounts[key] = 0; monthOrder.push(key); }
    monthCounts[key]++;
  });
  let cum = 0;
  return monthOrder.map(month => { cum += monthCounts[month]; return { month, followers: cum }; });
}

function parsePostCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  const col = name => headers.findIndex(h => h.includes(name));
  const titleCol = col("title");
  const seriesCol = col("series");
  const dateCol = col("date");
  const opensCol = col("open");
  const rateCol = col("rate") !== -1 ? col("rate") : col("%");
  const likesCol = col("like");
  const commentsCol = col("comment");
  const restacksCol = col("restack");

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
    return {
      id: i + 1,
      title: cols[titleCol] || "untitled",
      series: cols[seriesCol] || "",
      date: cols[dateCol] || "",
      opens: parseInt(cols[opensCol]) || 0,
      openRate: parseInt(cols[rateCol]) || 0,
      likes: parseInt(cols[likesCol]) || 0,
      comments: parseInt(cols[commentsCol]) || 0,
      restacks: parseInt(cols[restacksCol]) || 0,
    };
  }).filter(p => p.title !== "untitled" || p.opens > 0);
}

// ─── Template CSV download ────────────────────────────────────────────────────
function downloadPostTemplate() {
  const csv = [
    "title,series,date,opens,openRate,likes,comments,restacks",
    "watering dead plants & other acts of loyalty,unsent letter #007,Mar 7,640,57,40,31,21",
    "not your skyscanner,unsent letter #006,Feb 28,580,54,55,42,30",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "unsent-letters-post-stats.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Small Utilities ──────────────────────────────────────────────────────────
function TrendBadge({ value }) {
  const up = value >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, fontFamily: font, color: up ? C.green : C.red, display: "inline-flex", alignItems: "center", gap: 2 }}>
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, color: C.plum, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{children}</h2>;
}

function StatusDot({ status }) {
  const colors = { published: C.green, scheduled: C.orange, drafting: C.orangeLight, idea: C.grayLight };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[status] || C.grayLight, marginRight: 6, flexShrink: 0 }} />;
}

function StatusBadge({ status }) {
  const cfg = {
    published: { bg: C.greenFaint, color: C.green },
    scheduled: { bg: C.orangeFaint, color: C.orange },
    drafting: { bg: C.yellowFaint, color: C.yellow },
    idea: { bg: C.grayFaint, color: C.plumLight },
  };
  const s = cfg[status] || cfg.idea;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 10, background: s.bg, color: s.color, fontFamily: font }}>
      <StatusDot status={status} />{status}
    </span>
  );
}

function TabBar({ tabs, active, onChange, size = "normal" }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: size === "small" ? "6px 14px" : "8px 18px",
          borderRadius: 20, border: "none", cursor: "pointer",
          fontFamily: font, fontSize: size === "small" ? 12 : 13, fontWeight: 500,
          background: active === t ? C.plum : "transparent",
          color: active === t ? C.white : C.plumLight,
          transition: "all 0.15s",
        }}>{t}</button>
      ))}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small = false }) {
  const styles = {
    primary: { bg: C.plum, color: C.white },
    orange: { bg: C.orange, color: C.white },
    ghost: { bg: "transparent", color: C.plumLight, border: `1px solid ${C.grayLight}` },
    danger: { bg: "transparent", color: C.red, border: `1px solid ${C.red}` },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} style={{
      padding: small ? "5px 12px" : "8px 16px",
      borderRadius: 8, border: s.border || "none", cursor: "pointer",
      fontFamily: font, fontSize: small ? 12 : 13, fontWeight: 500,
      background: s.bg, color: s.color, transition: "opacity 0.1s",
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

// ─── CSV Drop Zone ────────────────────────────────────────────────────────────
function DropZone({ label, accept, onFile, loaded, onClear }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loaded && ref.current?.click()}
      style={{
        border: `2px dashed ${dragging ? C.orange : loaded ? C.green : C.grayLight}`,
        borderRadius: 12, padding: "20px 24px", cursor: loaded ? "default" : "pointer",
        background: dragging ? C.orangeFaint : loaded ? C.greenFaint : C.bgSoft,
        transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14,
      }}>
      <input ref={ref} type="file" accept={accept} onChange={handleFile} style={{ display: "none" }} />
      <span style={{ fontSize: 22 }}>{loaded ? "✓" : "📂"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: loaded ? C.green : C.plum }}>{loaded ? "loaded ✓" : label}</div>
        <div style={{ fontFamily: font, fontSize: 11, color: C.gray, marginTop: 2 }}>
          {loaded ? "drop a new file to replace" : "drag & drop or click to browse"}
        </div>
      </div>
      {loaded && <Btn variant="ghost" small onClick={(e) => { e.stopPropagation(); onClear(); }}>clear</Btn>}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 12px rgba(59,34,85,0.12)", border: `1px solid ${C.grayFaint}`, fontFamily: font, fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: C.plum, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, trend, sub, accent }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: "22px 24px", flex: "1 1 0", minWidth: 160, boxShadow: "0 1px 3px rgba(59,34,85,0.06)", border: `1px solid ${C.grayFaint}` }}>
      <div style={{ fontSize: 11, fontFamily: font, color: C.gray, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 32, fontWeight: 700, fontFamily: font, color: accent || C.plum, lineHeight: 1 }}>{value}</span>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      {sub && <div style={{ fontSize: 11, fontFamily: font, color: C.gray, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Post Table ───────────────────────────────────────────────────────────────
function PostTable({ posts }) {
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState(-1);

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => ((a[sortKey] || 0) > (b[sortKey] || 0) ? 1 : -1) * sortDir);
  }, [posts, sortKey, sortDir]);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  const arrow = key => sortKey === key ? (sortDir > 0 ? " ↑" : " ↓") : "";
  const best = Math.max(...posts.map(p => p.likes + p.comments + p.restacks));

  const th = { fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 12px", textAlign: "left", cursor: "pointer", userSelect: "none", borderBottom: `1px solid ${C.grayFaint}`, whiteSpace: "nowrap" };
  const td = { padding: "12px", fontFamily: font, fontSize: 14, color: C.plum, borderBottom: `1px solid ${C.grayFaint}` };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th} onClick={() => handleSort("title")}>Post{arrow("title")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("date")}>Date{arrow("date")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("opens")}>Opens{arrow("opens")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("openRate")}>Open %{arrow("openRate")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("likes")}>♡{arrow("likes")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("comments")}>💬{arrow("comments")}</th>
            <th style={{ ...th, textAlign: "center" }} onClick={() => handleSort("restacks")}>↻{arrow("restacks")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            const total = p.likes + p.comments + p.restacks;
            const top = total === best;
            return (
              <tr key={p.id} style={{ background: top ? C.orangeFaint : "transparent" }}>
                <td style={td}>
                  <div style={{ fontFamily: serif, fontWeight: top ? 600 : 400, fontSize: 14 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{p.series}</div>
                </td>
                <td style={{ ...td, textAlign: "center", fontSize: 12, color: C.plumLight }}>{p.date}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 600 }}>{p.opens}</td>
                <td style={{ ...td, textAlign: "center" }}>{p.openRate}%</td>
                <td style={{ ...td, textAlign: "center" }}>{p.likes}</td>
                <td style={{ ...td, textAlign: "center" }}>{p.comments}</td>
                <td style={{ ...td, textAlign: "center" }}>{p.restacks}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Planning: Calendar ───────────────────────────────────────────────────────
function CalendarView({ pipeline }) {
  const days = useMemo(() => {
    const arr = [];
    const start = new Date(2026, 2, 1);
    for (let i = 0; i < start.getDay(); i++) arr.push(null);
    for (let d = 1; d <= 31; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, []);

  // Map pipeline items to days
  const dayMap = useMemo(() => {
    const m = {};
    pipeline.forEach(p => {
      if (!p.targetDate) return;
      const d = new Date(p.targetDate + " 2026");
      if (!isNaN(d)) m[d.getDate()] = p;
    });
    return m;
  }, [pipeline]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: serif, fontSize: 17, color: C.plum }}>March 2026</span>
        <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: font, color: C.gray }}>
          {["published", "scheduled", "drafting", "idea"].map(s => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center" }}><StatusDot status={s} />{s}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {dayNames.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontFamily: font, color: C.gray, padding: "6px 0", fontWeight: 600 }}>{d}</div>
        ))}
        {days.map((day, i) => {
          const post = day ? dayMap[day] : null;
          const isToday = day === 12;
          return (
            <div key={i} style={{ minHeight: 72, borderRadius: 10, padding: 6, background: day ? C.card : "transparent", border: isToday ? `2px solid ${C.orange}` : day ? `1px solid ${C.grayFaint}` : "none" }}>
              {day && (
                <>
                  <span style={{ fontSize: 12, fontFamily: font, color: isToday ? C.orange : C.plumLight, fontWeight: isToday ? 700 : 400 }}>{day}</span>
                  {post && (
                    <div style={{ marginTop: 3, fontSize: 10, fontFamily: font, lineHeight: 1.3, padding: "3px 6px", borderRadius: 6, background: post.status === "published" ? C.greenFaint : post.status === "scheduled" ? C.orangeFaint : C.grayFaint, color: C.plum }}>
                      <StatusDot status={post.status} />{post.title.length > 28 ? post.title.slice(0, 25) + "…" : post.title}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Planning: Kanban ─────────────────────────────────────────────────────────
function KanbanView({ pipeline, publishedPosts, onStatusChange }) {
  const columns = [
    { label: "Idea", status: "idea" },
    { label: "Drafting", status: "drafting" },
    { label: "Scheduled", status: "scheduled" },
    { label: "Published", status: "published" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {columns.map(col => {
        const items = col.status === "published"
          ? publishedPosts.slice(0, 3).map(p => ({ ...p, isPublished: true }))
          : pipeline.filter(p => p.status === col.status);
        return (
          <div key={col.status}>
            <div style={{ fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot status={col.status} />{col.label}
              <span style={{ fontWeight: 400, color: C.grayLight }}>({items.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: C.card, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.grayFaint}`, boxShadow: "0 1px 2px rgba(59,34,85,0.04)" }}>
                  <div style={{ fontFamily: serif, fontSize: 13, color: C.plum, lineHeight: 1.3, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: font, color: C.gray }}>{item.series}</span>
                    <span style={{ fontSize: 11, fontFamily: font, color: C.plumLight }}>{item.targetDate || item.date}</span>
                  </div>
                  {item.topic && <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontFamily: font, padding: "2px 8px", borderRadius: 10, background: C.grayFaint, color: C.plumLight }}>{item.topic}</span>}
                  {!item.isPublished && onStatusChange && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {["idea", "drafting", "scheduled"].filter(s => s !== col.status).map(s => (
                        <button key={s} onClick={() => onStatusChange(item.id, s)} style={{ fontSize: 10, fontFamily: font, padding: "2px 8px", borderRadius: 8, border: `1px solid ${C.grayLight}`, background: "transparent", color: C.plumLight, cursor: "pointer" }}>
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Edit Modal for a Pipeline Item ──────────────────────────────────────────
function EditModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({ ...item });
  const field = (key, label, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</label>
      {key === "status" ? (
        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: font, fontSize: 13, color: C.plum, background: C.white }}>
          {["idea", "drafting", "scheduled"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : key === "title" ? (
        <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: serif, fontSize: 14, color: C.plum, resize: "none", boxSizing: "border-box" }} />
      ) : (
        <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: font, fontSize: 13, color: C.plum, boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(59,34,85,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw", boxShadow: "0 16px 48px rgba(59,34,85,0.2)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 400, color: C.plum, margin: "0 0 20px" }}>{item.id ? "edit post" : "add new post"}</h3>
        {field("title", "Title")}
        {field("series", "Series")}
        {field("targetDate", "Target Date", "text")}
        {field("topic", "Topic / Tag")}
        {field("status", "Status")}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>cancel</Btn>
          <Btn variant="orange" onClick={() => onSave(form)}>save</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Queue Helpers ────────────────────────────────────────────────────────────
const QUEUE_STATUS = {
  new:         { label: "new",         bg: C.grayFaint,   color: C.plumLight, dot: C.plumLight },
  considering: { label: "considering", bg: C.orangeFaint,  color: C.orange,    dot: C.orange },
  used:        { label: "used in post",bg: C.greenFaint,   color: C.green,     dot: C.green },
  archived:    { label: "archived",    bg: C.grayFaint,    color: C.gray,      dot: C.grayLight },
};

function QueueBadge({ status }) {
  const s = QUEUE_STATUS[status] || QUEUE_STATUS.new;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 10, background: s.bg, color: s.color, fontFamily: font }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

// ─── Queue Edit Modal ─────────────────────────────────────────────────────────
function QueueModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({ ...item });

  const field = (key, label, multiline = false, placeholder = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</label>
      {multiline ? (
        <textarea
          value={form[key] || ""}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3}
          placeholder={placeholder}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: key === "subject" ? serif : font, fontSize: key === "subject" ? 14 : 13, color: C.plum, resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
        />
      ) : key === "status" ? (
        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: font, fontSize: 13, color: C.plum, background: C.white }}>
          {["new", "considering", "used", "archived"].map(s => <option key={s} value={s}>{QUEUE_STATUS[s].label}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={form[key] || ""}
          placeholder={placeholder}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: font, fontSize: 13, color: C.plum, boxSizing: "border-box" }}
        />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(59,34,85,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw", boxShadow: "0 16px 48px rgba(59,34,85,0.2)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 400, color: C.plum, margin: "0 0 6px", fontStyle: "italic" }}>
          {item.id ? "edit letter" : "add received letter"}
        </h3>
        <p style={{ fontFamily: font, fontSize: 12, color: C.gray, margin: "0 0 20px" }}>log a letter you've received and need to respond to</p>
        {field("from", "From", false, "anonymous")}
        {field("subject", "Subject / recipient", false, "a letter to…")}
        {field("received", "Date received", false, "e.g. Mar 8")}
        {field("status", "Status")}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            The letter
          </label>
          <textarea
            value={form.content || ""}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={8}
            placeholder="paste or type the letter here…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.grayLight}`, fontFamily: serif, fontSize: 13, color: C.plum, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, background: "#fdfbff" }}
          />
        </div>
        {field("notes", "Your notes (private)", true, "themes, feelings, what struck you…")}
        {field("linkedPost", "Used in post (if applicable)", false, "e.g. unsent letter #003")}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>cancel</Btn>
          <Btn variant="orange" onClick={() => onSave(form)}>save</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Letter Card (with expand/collapse) ──────────────────────────────────────
function LetterCard({ letter, editMode, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LEN = 160;
  const hasContent = letter.content && letter.content.trim().length > 0;
  const isLong = hasContent && letter.content.length > PREVIEW_LEN;
  const preview = isLong && !expanded
    ? letter.content.slice(0, PREVIEW_LEN).trim() + "…"
    : letter.content;

  return (
    <div style={{
      background: letter.status === "archived" ? C.bgSoft : C.card,
      borderRadius: 12, padding: "18px 20px",
      border: `1px solid ${letter.status === "considering" ? C.orangeLight : C.grayFaint}`,
      boxShadow: letter.status === "considering" ? `0 2px 8px rgba(212,87,42,0.1)` : "0 1px 3px rgba(59,34,85,0.05)",
      opacity: letter.status === "archived" ? 0.65 : 1,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>✉</span>
        <QueueBadge status={letter.status} />
      </div>

      {/* Subject */}
      <div style={{ fontFamily: serif, fontSize: 14, color: C.plum, lineHeight: 1.5, marginBottom: 8, fontStyle: "italic" }}>
        "{letter.subject}"
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: font, color: C.gray, marginBottom: hasContent ? 12 : 0 }}>
        <span>from: <strong style={{ color: C.plumLight }}>{letter.from || "anonymous"}</strong></span>
        {letter.received && <span>received: {letter.received}</span>}
      </div>

      {/* Letter body */}
      {hasContent && (
        <div style={{ borderTop: `1px solid ${C.grayFaint}`, paddingTop: 12, marginTop: 4 }}>
          <div style={{
            fontFamily: serif, fontSize: 13, color: C.plum, lineHeight: 1.8,
            whiteSpace: "pre-line",
            maxHeight: expanded ? "none" : undefined,
          }}>
            {preview}
          </div>
          {isLong && (
            <button onClick={() => setExpanded(e => !e)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: font, fontSize: 11, color: C.orange,
              padding: "6px 0 0", display: "block",
              textDecoration: "underline", textUnderlineOffset: 2,
            }}>
              {expanded ? "show less" : "read full letter"}
            </button>
          )}
        </div>
      )}

      {/* Private notes */}
      {letter.notes && (
        <div style={{ fontSize: 12, fontFamily: font, color: C.gray, lineHeight: 1.5, borderTop: `1px solid ${C.grayFaint}`, paddingTop: 8, marginTop: 10, fontStyle: "italic" }}>
          💭 {letter.notes}
        </div>
      )}

      {/* Linked post */}
      {letter.linkedPost && (
        <div style={{ marginTop: 8, fontSize: 11, fontFamily: font, padding: "3px 10px", borderRadius: 8, background: C.greenFaint, color: C.green, display: "inline-block" }}>
          ↳ used in: {letter.linkedPost}
        </div>
      )}

      {/* Edit mode actions */}
      {editMode && (
        <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end", borderTop: `1px solid ${C.grayFaint}`, paddingTop: 10, flexWrap: "wrap" }}>
          {letter.status !== "considering" && (
            <button onClick={() => onStatusChange(letter.id, "considering")} style={{ fontSize: 10, fontFamily: font, padding: "2px 8px", borderRadius: 8, border: `1px solid ${C.orangeLight}`, background: "transparent", color: C.orange, cursor: "pointer" }}>
              → consider
            </button>
          )}
          {letter.status !== "used" && (
            <button onClick={() => onStatusChange(letter.id, "used")} style={{ fontSize: 10, fontFamily: font, padding: "2px 8px", borderRadius: 8, border: `1px solid ${C.grayLight}`, background: "transparent", color: C.green, cursor: "pointer" }}>
              → used
            </button>
          )}
          {letter.status !== "archived" && (
            <button onClick={() => onStatusChange(letter.id, "archived")} style={{ fontSize: 10, fontFamily: font, padding: "2px 8px", borderRadius: 8, border: `1px solid ${C.grayLight}`, background: "transparent", color: C.gray, cursor: "pointer" }}>
              → archive
            </button>
          )}
          <Btn variant="ghost" small onClick={() => onEdit(letter)}>edit</Btn>
          <Btn variant="danger" small onClick={() => onDelete(letter.id)}>✕</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Letter Queue View ────────────────────────────────────────────────────────
function LetterQueueView({ queue, editMode, onEdit, onDelete, onStatusChange }) {
  const [filter, setFilter] = useState("all");
  const statuses = ["all", "new", "considering", "used", "archived"];

  const filtered = useMemo(() => {
    const order = { new: 0, considering: 1, used: 2, archived: 3 };
    return queue
      .filter(l => filter === "all" || l.status === filter)
      .sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
  }, [queue, filter]);

  const counts = useMemo(() => {
    const c = { all: queue.length };
    queue.forEach(l => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [queue]);

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontFamily: font, fontSize: 12, fontWeight: 500,
              background: filter === s ? C.plum : C.grayFaint,
              color: filter === s ? C.white : C.plumLight,
              transition: "all 0.15s",
            }}>
              {s === "all" ? "all" : QUEUE_STATUS[s].label}
              {" "}
              <span style={{ opacity: 0.7 }}>({counts[s] || 0})</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: font, color: C.gray }}>
          <span><strong style={{ color: C.orange }}>{counts.considering || 0}</strong> to consider</span>
          <span><strong style={{ color: C.green }}>{counts.used || 0}</strong> used</span>
          <span><strong style={{ color: C.plumLight }}>{counts.new || 0}</strong> unread</span>
        </div>
      </div>

      {/* Letter cards */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", fontFamily: serif, fontSize: 16, color: C.gray, fontStyle: "italic" }}>
          no letters here yet
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map(letter => (
          <LetterCard
            key={letter.id}
            letter={letter}
            editMode={editMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Planning: List ───────────────────────────────────────────────────────────
function ListView({ pipeline, editMode, onEdit, onDelete }) {
  const sorted = useMemo(() => {
    const order = { scheduled: 0, drafting: 1, idea: 2 };
    return [...pipeline].sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
  }, [pipeline]);

  const th = { fontSize: 11, fontFamily: font, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 12px", textAlign: "left", borderBottom: `1px solid ${C.grayFaint}` };
  const td = { padding: "12px", fontFamily: font, fontSize: 14, color: C.plum, borderBottom: `1px solid ${C.grayFaint}` };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Status</th>
          <th style={th}>Title</th>
          <th style={th}>Series</th>
          <th style={th}>Target Date</th>
          <th style={th}>Topic</th>
          {editMode && <th style={{ ...th, textAlign: "center" }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {sorted.map(item => (
          <tr key={item.id}>
            <td style={td}><StatusBadge status={item.status} /></td>
            <td style={{ ...td, fontFamily: serif }}>{item.title}</td>
            <td style={{ ...td, fontSize: 12, color: C.plumLight }}>{item.series}</td>
            <td style={{ ...td, fontSize: 13 }}>{item.targetDate}</td>
            <td style={td}><span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: C.grayFaint, color: C.plumLight }}>{item.topic}</span></td>
            {editMode && (
              <td style={{ ...td, textAlign: "center" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <Btn variant="ghost" small onClick={() => onEdit(item)}>edit</Btn>
                  <Btn variant="danger" small onClick={() => onDelete(item.id)}>✕</Btn>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Cadence Heatmap ──────────────────────────────────────────────────────────
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_IDX   = Object.fromEntries(MONTH_SHORT.map((m, i) => [m, i]));

function CadenceHeatmap({ posts }) {
  // Build a Set of ISO date strings "YYYY-MM-DD" for every published post
  const publishedDates = useMemo(() => {
    const set = new Set();
    posts.forEach(p => {
      if (!p.date) return;
      const parts = p.date.trim().split(" ");
      if (parts.length !== 2) return;
      const mi = MONTH_IDX[parts[0]];
      const d  = parseInt(parts[1], 10);
      if (mi === undefined || isNaN(d)) return;
      set.add(`2026-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    });
    return set;
  }, [posts]);

  // Grid starts on Mon Dec 29 2025 (the Monday before Jan 1 2026)
  // Jan 1 2026 is a Thursday → back 3 days = Dec 29
  const CELL = 11;
  const GAP  = 3;
  const STEP = CELL + GAP;

  const gridStart = new Date(2025, 11, 29); // Dec 29 2025
  const today     = new Date(2026, 2, 12);  // Mar 12 2026 (hardcoded current date)

  // 53 weeks × 7 days
  const weeks = useMemo(() => {
    const result = [];
    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(gridStart);
        dt.setDate(gridStart.getDate() + w * 7 + d);
        const y  = dt.getFullYear();
        const mo = dt.getMonth();
        const dy = dt.getDate();
        week.push({
          date:    dt,
          dateStr: `${y}-${String(mo + 1).padStart(2, "0")}-${String(dy).padStart(2, "0")}`,
          inYear:  y === 2026,
          month:   mo,
        });
      }
      result.push(week);
    }
    return result;
  }, []);

  // Month label: first week column where that month appears in 2026
  const monthLabels = useMemo(() => {
    const labels = {};
    weeks.forEach((week, wi) => {
      week.forEach(cell => {
        if (cell.inYear && labels[cell.month] === undefined) labels[cell.month] = wi;
      });
    });
    return labels;
  }, [weeks]);

  // Stats
  const totalPosts = posts.length;
  const launchDate = new Date(2026, 0, 18); // Jan 18 2026
  const weeksSinceLaunch = Math.max(1, Math.ceil((today - launchDate) / (7 * 24 * 3600 * 1000)));
  const avgPerWeek = (totalPosts / weeksSinceLaunch).toFixed(1);

  // Streak: consecutive complete weeks (before current week) with ≥1 post
  const mondayOfToday = new Date(today);
  mondayOfToday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  let streak = 0;
  for (let wk = 1; wk <= 30; wk++) {
    const wStart = new Date(mondayOfToday);
    wStart.setDate(mondayOfToday.getDate() - wk * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    let hasPost = false;
    for (const ds of publishedDates) {
      const [y, m, d] = ds.split("-").map(Number);
      const pd = new Date(y, m - 1, d);
      if (pd >= wStart && pd <= wEnd) { hasPost = true; break; }
    }
    if (hasPost) streak++;
    else break;
  }

  const todayStr = "2026-03-12";

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 24, marginBottom: 28, border: `1px solid ${C.grayFaint}` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <SectionTitle>publishing cadence · 2026</SectionTitle>
        <div style={{ display: "flex", gap: 20, fontFamily: font, fontSize: 12, color: C.gray, flexWrap: "wrap" }}>
          <span><strong style={{ color: C.plum }}>{totalPosts}</strong> posts published</span>
          <span><strong style={{ color: C.plum }}>{avgPerWeek}</strong>/week avg</span>
          <span><strong style={{ color: C.orange }}>{streak}-week</strong> streak</span>
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        {/* Month labels row */}
        <div style={{ position: "relative", height: 16, marginBottom: 4, paddingLeft: 22 }}>
          {Object.entries(monthLabels).map(([mo, col]) => (
            <span key={mo} style={{
              position: "absolute",
              left: 22 + col * STEP,
              fontSize: 10,
              fontFamily: font,
              color: C.gray,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}>
              {MONTH_SHORT[parseInt(mo, 10)]}
            </span>
          ))}
        </div>

        {/* Day labels + week grid */}
        <div style={{ display: "flex", gap: GAP, alignItems: "flex-start" }}>
          {/* Day-of-week labels (Mon / Wed / Fri only) */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP, width: 18, flexShrink: 0 }}>
            {["M", "", "W", "", "F", "", ""].map((lbl, i) => (
              <div key={i} style={{
                height: CELL, fontSize: 9, fontFamily: font, color: C.gray,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 3,
              }}>
                {lbl}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {week.map((cell, di) => {
                  const hasPost  = publishedDates.has(cell.dateStr);
                  const isFuture = cell.date > today;
                  const isToday  = cell.dateStr === todayStr;

                  let bg;
                  if (!cell.inYear)  bg = "transparent";
                  else if (hasPost)   bg = C.orange;
                  else if (isFuture)  bg = C.grayFaint;
                  else                bg = `${C.grayLight}55`;

                  return (
                    <div
                      key={di}
                      title={`${cell.dateStr}${hasPost ? " · published ✓" : ""}`}
                      style={{
                        width: CELL, height: CELL, borderRadius: 3,
                        background: bg,
                        outline: isToday ? `2px solid ${C.plum}` : "none",
                        outlineOffset: 1,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, fontSize: 11, fontFamily: font, color: C.gray }}>
        {[
          { bg: `${C.grayLight}55`, label: "no post" },
          { bg: C.orange,           label: "published" },
          { bg: C.grayFaint,        label: "upcoming" },
        ].map(({ bg, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: CELL, height: CELL, borderRadius: 3, background: bg, display: "inline-block", flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({
  subscriberData, followerData, posts,
  onSubscriberCSV, onFollowerCSV, onPostCSV,
  isRealSubData, isRealFollowerData, isRealPostData,
  onClearSubs, onClearFollowers, onClearPosts,
}) {
  const latestSubs = subscriberData[subscriberData.length - 1]?.subs || 0;
  const prevSubs = subscriberData[subscriberData.length - 2]?.subs || 0;
  const subGrowthPct = prevSubs ? Math.round(((latestSubs - prevSubs) / prevSubs) * 100) : 0;

  const latestFollowers = followerData[followerData.length - 1]?.followers || 0;
  const prevFollowers = followerData[followerData.length - 2]?.followers || 0;
  const followerGrowthPct = prevFollowers ? Math.round(((latestFollowers - prevFollowers) / prevFollowers) * 100) : 0;

  const avgOpen = posts.length ? Math.round(posts.reduce((a, p) => a + p.openRate, 0) / posts.length) : 0;
  const avgEngage = posts.length ? Math.round(posts.reduce((a, p) => a + p.likes + p.comments, 0) / posts.length) : 0;

  // Merge subscriber + follower data by month for the combined chart
  const combinedData = useMemo(() => {
    const followerMap = Object.fromEntries(followerData.map(d => [d.month, d.followers]));
    return subscriberData.map(d => ({ ...d, followers: followerMap[d.month] || null }));
  }, [subscriberData, followerData]);

  const handleCSVFile = useCallback((file, type) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      if (type === "subs") onSubscriberCSV(text);
      else if (type === "followers") onFollowerCSV(text);
      else onPostCSV(text);
    };
    reader.readAsText(file);
  }, [onSubscriberCSV, onFollowerCSV, onPostCSV]);

  const anyRealData = isRealSubData || isRealFollowerData || isRealPostData;

  return (
    <>
      {/* CSV Upload zone */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, marginBottom: 28, border: `1px solid ${C.grayFaint}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionTitle>import your data</SectionTitle>
          {anyRealData && (
            <span style={{ fontSize: 11, fontFamily: font, padding: "3px 10px", borderRadius: 10, background: C.greenFaint, color: C.green, fontWeight: 600 }}>✓ real data loaded</span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: font, fontWeight: 600, color: C.plum, marginBottom: 6 }}>Subscribers</div>
            <div style={{ fontSize: 11, fontFamily: font, color: C.gray, marginBottom: 8, lineHeight: 1.5 }}>
              <strong>Dashboard → Settings → Subscribers → Export</strong>
            </div>
            <DropZone label="subscribers CSV" accept=".csv" onFile={f => handleCSVFile(f, "subs")} loaded={isRealSubData} onClear={onClearSubs} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: font, fontWeight: 600, color: C.plum, marginBottom: 6 }}>Followers</div>
            <div style={{ fontSize: 11, fontFamily: font, color: C.gray, marginBottom: 8, lineHeight: 1.5 }}>
              <strong>Dashboard → Settings → Followers → Export</strong>
            </div>
            <DropZone label="followers CSV" accept=".csv" onFile={f => handleCSVFile(f, "followers")} loaded={isRealFollowerData} onClear={onClearFollowers} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: font, fontWeight: 600, color: C.plum, marginBottom: 6 }}>Post analytics</div>
            <div style={{ fontSize: 11, fontFamily: font, color: C.gray, marginBottom: 8, lineHeight: 1.5 }}>
              Substack doesn't export this.{" "}
              <button onClick={downloadPostTemplate} style={{ background: "none", border: "none", color: C.orange, cursor: "pointer", fontFamily: font, fontSize: 11, padding: 0, textDecoration: "underline" }}>
                Download template
              </button>{" "}→ fill in → upload.
            </div>
            <DropZone label="post stats CSV" accept=".csv" onFile={f => handleCSVFile(f, "posts")} loaded={isRealPostData} onClear={onClearPosts} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Subscribers" value={latestSubs.toLocaleString()} trend={subGrowthPct} sub={`+${subscriberData[subscriberData.length - 1]?.new || 0} this month`} />
        <KPICard label="Followers" value={latestFollowers.toLocaleString()} trend={followerGrowthPct} sub="total Substack followers" accent={C.violet} />
        <KPICard label="Avg Open Rate" value={`${avgOpen}%`} trend={4} sub="across recent posts" />
        <KPICard label="Total Posts" value={posts.length} sub="tracked in dashboard" />
        <KPICard label="Avg Engagement" value={avgEngage} trend={12} sub="likes + comments" />
      </div>

      {/* Subscribers vs Followers combined chart */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, marginBottom: 28, border: `1px solid ${C.grayFaint}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <SectionTitle>subscribers vs. followers</SectionTitle>
          <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: font, color: C.gray }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 3, background: C.orange, borderRadius: 2, display: "inline-block" }} /> subscribers
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 3, background: C.violet, borderRadius: 2, display: "inline-block" }} /> followers
            </span>
          </div>
        </div>
        <p style={{ fontSize: 11, fontFamily: font, color: C.gray, margin: "0 0 16px" }}>
          followers = people who follow you on Substack · subscribers = email list
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={combinedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.orange} stopOpacity={0.12} />
                <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.violet} stopOpacity={0.1} />
                <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.gray, fontFamily: font }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.gray, fontFamily: font }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="followers" stroke={C.violet} strokeWidth={2} fill="url(#fgGrad)" name="Followers" dot={{ fill: C.violet, r: 3 }} connectNulls />
            <Area type="monotone" dataKey="subs" stroke={C.orange} strokeWidth={2.5} fill="url(#sgGrad)" name="Subscribers" dot={{ fill: C.orange, r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* New vs churned */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, marginBottom: 28, border: `1px solid ${C.grayFaint}` }}>
        <SectionTitle>new vs. churned subscribers</SectionTitle>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={subscriberData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.gray, fontFamily: font }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.gray, fontFamily: font }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="new" fill={C.orange} name="New" radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" fill={C.grayLight} name="Churned" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cadence heatmap */}
      <CadenceHeatmap posts={posts} />

      {/* Post table */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, marginBottom: 28, border: `1px solid ${C.grayFaint}` }}>
        <SectionTitle>post performance</SectionTitle>
        <p style={{ fontSize: 12, fontFamily: font, color: C.gray, margin: "-8px 0 16px" }}>click column headers to sort · top performer highlighted</p>
        <PostTable posts={posts} />
      </div>
    </>
  );
}

// ─── Planning Tab ─────────────────────────────────────────────────────────────
function PlanningTab({ pipeline, setPipeline, queue, setQueue, publishedPosts }) {
  const [planTab, setPlanTab] = useState("Calendar");
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(null);     // { type: "pipeline"|"queue", item }

  // ── Pipeline handlers ──
  const handlePipelineSave = useCallback((form) => {
    setPipeline(prev => {
      const exists = prev.find(p => p.id === form.id);
      if (exists) return prev.map(p => p.id === form.id ? form : p);
      return [...prev, { ...form, id: Date.now() }];
    });
    setModal(null);
  }, [setPipeline]);

  const handlePipelineDelete = useCallback((id) => {
    setPipeline(prev => prev.filter(p => p.id !== id));
  }, [setPipeline]);

  const handlePipelineStatusChange = useCallback((id, status) => {
    setPipeline(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, [setPipeline]);

  // ── Queue handlers ──
  const handleQueueSave = useCallback((form) => {
    setQueue(prev => {
      const exists = prev.find(l => l.id === form.id);
      if (exists) return prev.map(l => l.id === form.id ? form : l);
      return [...prev, { ...form, id: Date.now() }];
    });
    setModal(null);
  }, [setQueue]);

  const handleQueueDelete = useCallback((id) => {
    setQueue(prev => prev.filter(l => l.id !== id));
  }, [setQueue]);

  const handleQueueStatusChange = useCallback((id, status) => {
    setQueue(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }, [setQueue]);

  const isQueue = planTab === "Queue";
  const newPipelineItem = { id: null, title: "", series: "", targetDate: "", topic: "", status: "idea" };
  const newQueueItem = { id: null, from: "", subject: "", received: "", status: "new", notes: "", linkedPost: "" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <TabBar tabs={["Calendar", "Kanban", "List", "Queue"]} active={planTab} onChange={(t) => { setPlanTab(t); setEditMode(false); }} size="small" />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {editMode && (
            <Btn variant="orange" small onClick={() => setModal({ type: isQueue ? "queue" : "pipeline", item: isQueue ? newQueueItem : newPipelineItem })}>
              {isQueue ? "+ add letter" : "+ add post"}
            </Btn>
          )}
          <Btn variant="ghost" small onClick={() => setEditMode(e => !e)}>
            {editMode ? "✓ done editing" : "✎ edit"}
          </Btn>
        </div>
      </div>

      <div style={{ background: planTab === "Queue" ? C.bgSoft : C.card, borderRadius: 14, padding: 24, border: `1px solid ${C.grayFaint}` }}>
        {planTab === "Calendar" && <CalendarView pipeline={pipeline} />}
        {planTab === "Kanban" && <KanbanView pipeline={pipeline} publishedPosts={publishedPosts} onStatusChange={editMode ? handlePipelineStatusChange : null} />}
        {planTab === "List" && <ListView pipeline={pipeline} editMode={editMode} onEdit={item => setModal({ type: "pipeline", item })} onDelete={handlePipelineDelete} />}
        {planTab === "Queue" && (
          <LetterQueueView
            queue={queue}
            editMode={editMode}
            onEdit={item => setModal({ type: "queue", item })}
            onDelete={handleQueueDelete}
            onStatusChange={handleQueueStatusChange}
          />
        )}
      </div>

      {editMode && planTab !== "Calendar" && planTab !== "Queue" && (
        <p style={{ fontFamily: font, fontSize: 12, color: C.gray, margin: "12px 0 0", textAlign: "center" }}>
          {planTab === "Kanban" ? "click → buttons on cards to move status · " : ""}use "edit" and "✕" buttons to modify or remove posts
        </p>
      )}

      {modal?.type === "pipeline" && <EditModal item={modal.item} onSave={handlePipelineSave} onClose={() => setModal(null)} />}
      {modal?.type === "queue" && <QueueModal item={modal.item} onSave={handleQueueSave} onClose={() => setModal(null)} />}
    </>
  );
}

// ─── Root Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [mainTab, setMainTab] = useState("Analytics");

  // Load pipeline from localStorage or default
  const [pipeline, setPipeline] = useState(() => {
    try {
      const saved = localStorage.getItem("ul_pipeline");
      return saved ? JSON.parse(saved) : DEFAULT_PIPELINE;
    } catch { return DEFAULT_PIPELINE; }
  });

  // Persist pipeline
  useEffect(() => {
    try { localStorage.setItem("ul_pipeline", JSON.stringify(pipeline)); } catch {}
  }, [pipeline]);

  // Load queue from localStorage or default
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("ul_queue");
      return saved ? JSON.parse(saved) : DEFAULT_QUEUE;
    } catch { return DEFAULT_QUEUE; }
  });

  // Persist queue
  useEffect(() => {
    try { localStorage.setItem("ul_queue", JSON.stringify(queue)); } catch {}
  }, [queue]);

  // Analytics data state
  const [subscriberData, setSubscriberData] = useState(DEFAULT_SUBSCRIBER_DATA);
  const [followerData, setFollowerData] = useState(DEFAULT_FOLLOWER_DATA);
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [isRealSubData, setIsRealSubData] = useState(false);
  const [isRealFollowerData, setIsRealFollowerData] = useState(false);
  const [isRealPostData, setIsRealPostData] = useState(false);

  const handleSubscriberCSV = useCallback((text) => {
    const parsed = parseSubscriberCSV(text);
    if (parsed && parsed.length > 0) { setSubscriberData(parsed); setIsRealSubData(true); }
    else alert("Couldn't parse this file. Make sure it's your Substack subscriber export CSV.");
  }, []);

  const handleFollowerCSV = useCallback((text) => {
    const parsed = parseFollowerCSV(text);
    if (parsed && parsed.length > 0) { setFollowerData(parsed); setIsRealFollowerData(true); }
    else alert("Couldn't parse this file. Make sure it's your Substack followers export CSV.");
  }, []);

  const handlePostCSV = useCallback((text) => {
    const parsed = parsePostCSV(text);
    if (parsed && parsed.length > 0) { setPosts(parsed); setIsRealPostData(true); }
    else alert("Couldn't parse this file. Try downloading the template first to see the expected format.");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 400, color: C.plum, margin: 0, fontStyle: "italic", letterSpacing: "-0.02em" }}>
              unsent letters{" "}
              <span style={{ fontStyle: "normal", fontFamily: font, fontSize: 14, fontWeight: 500, color: C.orange }}>dashboard</span>
            </h1>
            <p style={{ fontFamily: font, fontSize: 12, color: C.gray, margin: "4px 0 0" }}>
              {isRealSubData || isRealPostData || isRealFollowerData ? "showing real data · " : "showing sample data · "}
              last updated: march 12, 2026
            </p>
          </div>
          <TabBar tabs={["Analytics", "Planning"]} active={mainTab} onChange={setMainTab} />
        </div>

        {mainTab === "Analytics" && (
          <AnalyticsTab
            subscriberData={subscriberData}
            posts={posts}
            onSubscriberCSV={handleSubscriberCSV}
            onPostCSV={handlePostCSV}
            isRealSubData={isRealSubData}
            isRealPostData={isRealPostData}
            onClearSubs={() => { setSubscriberData(DEFAULT_SUBSCRIBER_DATA); setIsRealSubData(false); }}
            onClearPosts={() => { setPosts(DEFAULT_POSTS); setIsRealPostData(false); }}
            followerData={followerData}
            onFollowerCSV={handleFollowerCSV}
            isRealFollowerData={isRealFollowerData}
            onClearFollowers={() => { setFollowerData(DEFAULT_FOLLOWER_DATA); setIsRealFollowerData(false); }}
          />
        )}

        {mainTab === "Planning" && (
          <PlanningTab pipeline={pipeline} setPipeline={setPipeline} queue={queue} setQueue={setQueue} publishedPosts={posts} />
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 40, fontSize: 11, fontFamily: font, color: C.grayLight }}>
        unsent letters · content dashboard · {isRealSubData || isRealPostData ? "real data" : "sample data"}
      </div>
    </div>
  );
}
