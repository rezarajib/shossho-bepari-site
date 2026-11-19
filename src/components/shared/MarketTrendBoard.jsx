import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toBanglaNum } from "../../utils/formatBanglaNumber";

const trends = [
  { id: "oil", label: "সরিষার তেল", unit: "৳/লিটার", prices: [268, 265, 262, 260], signal: "down" },
  { id: "mustard", label: "দেশি সরিষা", unit: "৳/মণ", prices: [3720, 3680, 3640, 3600], signal: "down" },
  { id: "corn", label: "শুকনো ভুট্টা", unit: "৳/মণ", prices: [1420, 1440, 1440, 1440], signal: "stable" },
  { id: "sesame", label: "তিল", unit: "৳/মণ", prices: [5300, 5400, 5500, 5500], signal: "up" },
  { id: "grain", label: "ধান/চাল", unit: "৳/মণ", prices: [1480, 1460, 1450, 1450], signal: "stable" },
  { id: "cake", label: "খৈল", unit: "৳/মণ", prices: [1880, 1910, 1940, 1960], signal: "up" },
];
const weeks = ["৪ সপ্তাহ আগে", "৩ সপ্তাহ আগে", "২ সপ্তাহ আগে", "আজ"];

const signalDetails = {
  down: { label: "📉 দর কমেছে (কেনার সেরা সময়)", classes: "bg-emerald-100 text-emerald-950" },
  stable: { label: "⚖️ দর স্থিতিশীল", classes: "bg-stone-200 text-stone-900" },
  up: { label: "📈 মৌসুম শেষে বাড়তে পারে", classes: "bg-amber-100 text-amber-950" },
};

export default function MarketTrendBoard() {
  const [selectedId, setSelectedId] = useState(trends[0].id);
  const selected = trends.find((trend) => trend.id === selectedId) ?? trends[0];
  const chartData = selected.prices.map((price, index) => ({ week: weeks[index], price }));
  const signal = signalDetails[selected.signal];

  return (
    <section className="w-full px-4 py-6 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="market-trend-title">
      <div className="rounded-3xl border-2 border-stone-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold tracking-wide text-emerald-800 lg:text-base">বাজারের গতিপ্রকৃতি</p>
            <h2 id="market-trend-title" className="mt-1 text-2xl font-black text-stone-900 sm:text-3xl">৪ সপ্তাহের বাজার দর গ্রাফ</h2>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-extrabold ${signal.classes}`}>{signal.label}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-stone-600">নমুনা মূল্য-প্রবণতা; এটি লাইভ হাটদর নয়। প্রকৃত দর ERP/বাজার উৎসে যাচাই করুন।</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {trends.map((trend) => (
            <button
              key={trend.id}
              type="button"
              onClick={() => setSelectedId(trend.id)}
              aria-pressed={selected.id === trend.id}
              className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                selected.id === trend.id
                  ? "border-emerald-900 bg-emerald-900 text-white"
                  : "border-stone-300 bg-[#FAF7F2] text-stone-800 hover:border-emerald-700"
              }`}
            >
              {trend.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="h-64 min-w-0 rounded-2xl bg-[#FAF7F2] p-3 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid stroke="#d6d3d1" strokeDasharray="4 4" />
                <XAxis dataKey="week" tick={{ fill: "#44403c", fontSize: 12 }} />
                <YAxis width={72} tick={{ fill: "#44403c", fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`৳${toBanglaNum(value)} ${selected.unit.replace("৳/", "")}`, "দর"]}
                  contentStyle={{ borderRadius: 12, borderColor: "#d6d3d1", fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="price" stroke="#047857" strokeWidth={4} dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 lg:min-w-56">
            <p className="text-sm font-bold text-stone-600">আজকের নমুনা দর</p>
            <p className="mt-1 text-2xl font-black text-stone-900">৳{toBanglaNum(selected.prices.at(-1))}</p>
            <p className="mt-1 text-base font-bold text-stone-700">{selected.unit}</p>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-sm font-extrabold ${signal.classes}`}>{signal.label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
