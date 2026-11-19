import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CheckCircle2, Factory, PlusCircle, Truck } from "lucide-react";
import { markMillTruckReceived, saveMillTruckEntry } from "../../services/erpService";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const MAUND_KG = 40;
const JAR_LITERS = 20;
const MILLS = [
  { id: "kader", name: "কাদের আলী মিল", english: "Kader Ali Mill" },
  { id: "rafik", name: "রফিক মিয়া মিল", english: "Rafik Mia Mill" },
];
const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  millId: "kader",
  date: today,
  batch: "সপ্তাহের ১ম মিলিং",
  truckNumber: "",
  driverName: "",
  driverPhone: "",
  sacks: "",
  maund: "",
  kg: "0",
  oilJars: "0",
  oilLiters: "0",
  cakeMaund: "0",
  millFee: "",
  truckRent: "",
  status: "received",
};

const numberValue = (value) => Math.max(0, Number(value) || 0);
const entryMaund = (entry) => numberValue(entry.maund) + numberValue(entry.kg) / MAUND_KG;
const entryOilLiters = (entry) => numberValue(entry.oilJars) * JAR_LITERS + numberValue(entry.oilLiters);
const entryCost = (entry) => numberValue(entry.millFee) + numberValue(entry.truckRent);
const getWeekStart = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
};

function MillSummaryCard({ mill, entries }) {
  const sentMaund = entries.reduce((sum, entry) => sum + entryMaund(entry), 0);
  const completedEntries = entries.filter((entry) => entry.status === "received");
  const completedMaund = completedEntries.reduce((sum, entry) => sum + entryMaund(entry), 0);
  const oilLiters = completedEntries.reduce((sum, entry) => sum + entryOilLiters(entry), 0);
  const cakeMaund = completedEntries.reduce((sum, entry) => sum + numberValue(entry.cakeMaund), 0);
  const averageYield = completedMaund > 0 ? oilLiters / completedMaund : 0;
  const pendingTrips = entries.filter((entry) => entry.status === "pending").length;
  const pendingMaund = entries
    .filter((entry) => entry.status === "pending")
    .reduce((sum, entry) => sum + entryMaund(entry), 0);

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-stone-900">{mill.name}</h3>
          <p className="text-xs font-semibold text-stone-500">{mill.english}</p>
        </div>
        <span className="rounded-xl bg-emerald-50 p-2 text-emerald-800"><Factory className="h-5 w-5" /></span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
        <div><dt className="text-xs font-semibold text-stone-500">মোট সরিষা পাঠানো</dt><dd className="text-lg font-extrabold text-stone-900">{toBanglaNum(Number(sentMaund.toFixed(2)))} মণ</dd></div>
        <div><dt className="text-xs font-semibold text-stone-500">মোট ট্রাক ট্রিপ</dt><dd className="text-lg font-extrabold text-stone-900">{toBanglaNum(entries.length)}টি</dd></div>
        <div><dt className="text-xs font-semibold text-stone-500">মোট তেল প্রাপ্তি</dt><dd className="text-lg font-extrabold text-emerald-900">{toBanglaNum(Number(oilLiters.toFixed(1)))} লিটার</dd></div>
        <div><dt className="text-xs font-semibold text-stone-500">খৈল প্রাপ্তি</dt><dd className="text-lg font-extrabold text-stone-900">{toBanglaNum(Number(cakeMaund.toFixed(2)))} মণ</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <p className="text-sm font-bold text-stone-700">গড় তেল উৎপাদন: <span className="text-emerald-800">{toBanglaNum(Number(averageYield.toFixed(2)))} লিটার/মণ</span></p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pendingTrips ? "bg-amber-100 text-amber-950" : "bg-emerald-50 text-emerald-800"}`}>
          {pendingTrips ? `${toBanglaNum(pendingTrips)}টি ট্রিপ বাকি • ${toBanglaNum(Number(pendingMaund.toFixed(2)))} মণ` : "সব ট্রিপ বুঝে পাওয়া"}
        </span>
      </div>
    </article>
  );
}

export default function MillTruckLedgerTab({ entries = [] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");
  const [returnEntry, setReturnEntry] = useState(null);
  const [returnForm, setReturnForm] = useState({ oilJars: "0", oilLiters: "0", cakeMaund: "0" });

  const createMutation = useMutation({
    mutationFn: saveMillTruckEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    },
  });
  const receivedMutation = useMutation({
    mutationFn: ({ id, details }) => markMillTruckReceived(id, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setReturnEntry(null);
      setReturnForm({ oilJars: "0", oilLiters: "0", cakeMaund: "0" });
    },
  });

  const filteredEntries = useMemo(
    () => filter === "all" ? entries : entries.filter((entry) => entry.millId === filter),
    [entries, filter],
  );
  const currentWeekStart = getWeekStart(new Date().toISOString().slice(0, 10));
  const weeklyEntries = entries.filter((entry) => getWeekStart(entry.date) === currentWeekStart);
  const millSummaries = MILLS.map((mill) => ({
    ...mill,
    entries: entries.filter((entry) => entry.millId === mill.id),
  }));
  const totalMaund = weeklyEntries.reduce((sum, entry) => sum + entryMaund(entry), 0);
  const totalTrips = weeklyEntries.length;
  const completed = weeklyEntries.filter((entry) => entry.status === "received");
  const totalOilLiters = completed.reduce((sum, entry) => sum + entryOilLiters(entry), 0);
  const totalCosts = weeklyEntries.reduce((sum, entry) => sum + entryCost(entry), 0);
  const completedCosts = completed.reduce((sum, entry) => sum + entryCost(entry), 0);
  const netCostPerLiter = totalOilLiters > 0 ? completedCosts / totalOilLiters : 0;
  const chartData = millSummaries.map((mill) => {
    const done = mill.entries.filter((entry) => entry.status === "received");
    const sent = done.reduce((sum, entry) => sum + entryMaund(entry), 0);
    const oil = done.reduce((sum, entry) => sum + entryOilLiters(entry), 0);
    return {
      name: mill.name,
      trips: mill.entries.length,
      yieldPerMaund: sent > 0 ? Number((oil / sent).toFixed(2)) : 0,
      oilLiters: oil,
    };
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const maund = numberValue(form.maund);
    if (!maund && !numberValue(form.kg)) return;
    createMutation.mutate({
      ...form,
      id: `mill-truck-${Date.now()}`,
      sacks: numberValue(form.sacks),
      maund: numberValue(form.maund),
      kg: numberValue(form.kg),
      oilJars: form.status === "received" ? numberValue(form.oilJars) : 0,
      oilLiters: form.status === "received" ? numberValue(form.oilLiters) : 0,
      cakeMaund: form.status === "received" ? numberValue(form.cakeMaund) : 0,
      millFee: numberValue(form.millFee),
      truckRent: numberValue(form.truckRent),
    });
  };

  const handleReturnSubmit = (event) => {
    event.preventDefault();
    if (!returnEntry) return;
    receivedMutation.mutate({
      id: returnEntry.id,
      details: {
        oilJars: numberValue(returnForm.oilJars),
        oilLiters: numberValue(returnForm.oilLiters),
        cakeMaund: numberValue(returnForm.cakeMaund),
      },
    });
  };

  const fieldClass = "input input-bordered min-h-0 w-full border-stone-300 bg-white text-stone-900";
  const labelClass = "block space-y-1 text-sm font-bold text-stone-700";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-900 lg:text-3xl">🏭 ২ মিলের সরিষা ও ট্রাক ট্র্যাকার <span className="text-base font-bold text-stone-500 lg:text-lg">(Mill &amp; Truck Ledger)</span></h2>
        <p className="mt-1 text-sm text-stone-600">সপ্তাহের দুই দফা সরিষা পাঠানো, মিলের উৎপাদন, পরিবহন ব্যয় ও ফেরত পাওয়া একসাথে ট্র্যাক করুন।</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {millSummaries.map((mill) => <MillSummaryCard key={mill.id} mill={mill} entries={mill.entries} />)}
        <article className="rounded-2xl border border-amber-200 bg-[#FAF7F2] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-stone-900">সপ্তাহে ২ দিন মিলিং সামারি</h3>
              <p className="text-xs font-semibold text-stone-500">দুই মিলের সম্মিলিত হিসাব</p>
            </div>
            <span className="rounded-xl bg-amber-100 p-2 text-amber-800"><Truck className="h-5 w-5" /></span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div><dt className="text-xs font-semibold text-stone-500">মোট ট্রাক ট্রিপ</dt><dd className="text-lg font-extrabold text-stone-900">{toBanglaNum(totalTrips)}টি</dd></div>
            <div><dt className="text-xs font-semibold text-stone-500">মোট সরিষা</dt><dd className="text-lg font-extrabold text-stone-900">{toBanglaNum(Number(totalMaund.toFixed(2)))} মণ</dd></div>
            <div><dt className="text-xs font-semibold text-stone-500">মিল ও গাড়ি ভাড়া খরচ</dt><dd className="text-lg font-extrabold text-stone-900">{formatTaka(totalCosts)}</dd></div>
            <div><dt className="text-xs font-semibold text-stone-500">তেল প্রতি লিটারে খরচ</dt><dd className="text-lg font-extrabold text-emerald-900">{totalOilLiters ? formatTaka(netCostPerLiter) : "ফেরতের অপেক্ষায়"}</dd></div>
          </dl>
        </article>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-[#FAF7F2] p-5">
          <h3 className="flex items-center gap-2 text-xl font-black text-stone-900"><PlusCircle className="h-5 w-5 text-emerald-800" /> নতুন ট্রাক ও মিল এন্ট্রি</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>মিল নির্বাচন
              <select className="select select-bordered w-full border-stone-300 bg-white" value={form.millId} onChange={(event) => setForm({ ...form, millId: event.target.value })}>
                {MILLS.map((mill) => <option key={mill.id} value={mill.id}>{mill.name}</option>)}
              </select>
            </label>
            <label className={labelClass}>তারিখ
              <input className={fieldClass} type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            </label>
            <label className={labelClass}>সাপ্তাহিক ব্যাচ
              <select className="select select-bordered w-full border-stone-300 bg-white" value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })}>
                <option>সপ্তাহের ১ম মিলিং</option><option>সপ্তাহের ২য় মিলিং</option>
              </select>
            </label>
            <label className={labelClass}>ট্রাক / পিকআপ নম্বর
              <input className={fieldClass} required value={form.truckNumber} onChange={(event) => setForm({ ...form, truckNumber: event.target.value })} placeholder="ঢাকা মেট্রো-ট ১১-XXXX" />
            </label>
            <label className={labelClass}>চালকের নাম
              <input className={fieldClass} required value={form.driverName} onChange={(event) => setForm({ ...form, driverName: event.target.value })} placeholder="চালকের নাম" />
            </label>
            <label className={labelClass}>চালকের মোবাইল
              <input className={fieldClass} type="tel" value={form.driverPhone} onChange={(event) => setForm({ ...form, driverPhone: event.target.value })} placeholder="০১XXXXXXXXX" />
            </label>
            <label className={labelClass}>বস্তার সংখ্যা
              <input className={fieldClass} type="number" min="0" step="1" value={form.sacks} onChange={(event) => setForm({ ...form, sacks: event.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={labelClass}>সরিষা (মণ)
                <input className={fieldClass} type="number" min="0" step="0.01" value={form.maund} onChange={(event) => setForm({ ...form, maund: event.target.value })} required />
              </label>
              <label className={labelClass}>অতিরিক্ত কেজি
                <input className={fieldClass} type="number" min="0" max="39.99" step="0.1" value={form.kg} onChange={(event) => setForm({ ...form, kg: event.target.value })} />
              </label>
            </div>
            <label className={labelClass}>মিল ভাঙানো খরচ (৳)
              <input className={fieldClass} type="number" min="0" step="1" value={form.millFee} onChange={(event) => setForm({ ...form, millFee: event.target.value })} />
            </label>
            <label className={labelClass}>ট্রাক ভাড়া (৳)
              <input className={fieldClass} type="number" min="0" step="1" value={form.truckRent} onChange={(event) => setForm({ ...form, truckRent: event.target.value })} />
            </label>
          </div>

          <fieldset className="rounded-xl border border-stone-200 bg-white p-3">
            <legend className="px-1 text-sm font-bold text-stone-700">মিলের ফেরত / বর্তমান অবস্থা</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <input type="radio" name="millStatus" className="radio radio-success radio-sm" checked={form.status === "received"} onChange={() => setForm({ ...form, status: "received" })} />
                সম্পন্ন (তেল বুঝে পাওয়া গেছে)
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <input type="radio" name="millStatus" className="radio radio-warning radio-sm" checked={form.status === "pending"} onChange={() => setForm({ ...form, status: "pending" })} />
                মিলে ভাঙানো চলছে (Pending Return)
              </label>
            </div>
          </fieldset>

          {form.status === "received" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={labelClass}>তেল (২০ লিটার জার)
                <input className={fieldClass} type="number" min="0" step="1" value={form.oilJars} onChange={(event) => setForm({ ...form, oilJars: event.target.value })} />
              </label>
              <label className={labelClass}>অতিরিক্ত তেল (লিটার)
                <input className={fieldClass} type="number" min="0" step="0.1" value={form.oilLiters} onChange={(event) => setForm({ ...form, oilLiters: event.target.value })} />
              </label>
              <label className={labelClass}>খৈল (মণ)
                <input className={fieldClass} type="number" min="0" step="0.01" value={form.cakeMaund} onChange={(event) => setForm({ ...form, cakeMaund: event.target.value })} />
              </label>
            </div>
          )}

          {createMutation.isError && <p role="alert" className="text-sm font-bold text-red-700">ট্রাক ও মিলের তথ্য সেভ করা যায়নি। আবার চেষ্টা করুন।</p>}
          <button type="submit" disabled={createMutation.isPending} className="btn w-full border-none bg-emerald-800 font-extrabold text-white hover:bg-emerald-900">
            {createMutation.isPending ? "সেভ হচ্ছে..." : "ট্রাক ও মিল এন্ট্রি সেভ করুন"}
          </button>
        </form>

        <div className="min-w-0 space-y-5">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xl font-black text-stone-900">দুই মিলের তেল উৎপাদন তুলনা</h3>
            <div className="h-64 min-w-0 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="yield" orientation="left" tickFormatter={(value) => toBanglaNum(value)} />
                  <YAxis yAxisId="oil" orientation="right" tickFormatter={(value) => toBanglaNum(value)} />
                  <Tooltip formatter={(value, name) => [`${toBanglaNum(value)}${name === "গড় তেল (লিটার/মণ)" ? " লিটার/মণ" : " লিটার"}`, name]} />
                  <Legend />
                  <Bar yAxisId="yield" dataKey="yieldPerMaund" name="গড় তেল (লিটার/মণ)" fill="#047857" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="oil" dataKey="oilLiters" name="মোট তেল (লিটার)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-[#FAF7F2] p-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">ট্রাক ও মিল রিটার্ন লেজার</h3>
                <p className="text-sm text-stone-600">প্রতি ট্রিপের সরিষা, উৎপাদন ও মোট খরচ</p>
              </div>
              <select aria-label="মিল অনুযায়ী ফিল্টার" className="select select-bordered select-sm border-stone-300 bg-white" value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">সব মিল</option>
                {MILLS.map((mill) => <option key={mill.id} value={mill.id}>{mill.name}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
                <thead><tr><th>তারিখ</th><th>মিল / ব্যাচ</th><th>ট্রাক</th><th>সরিষা</th><th>তেল প্রাপ্তি</th><th>লিটার/মণ</th><th>খৈল</th><th>মোট খরচ</th><th>অবস্থা</th></tr></thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const mill = MILLS.find((item) => item.id === entry.millId);
                    const sent = entryMaund(entry);
                    const oil = entry.status === "received" ? entryOilLiters(entry) : 0;
                    const yieldRate = sent > 0 ? oil / sent : 0;
                    return (
                      <tr key={entry.id} className="transition-colors hover:bg-amber-50/60">
                        <td className="text-base font-bold text-stone-700 lg:text-lg">{entry.date}<div className="text-base font-semibold text-stone-600">{entry.batch}</div></td>
                        <td className="text-lg font-black text-stone-900">{mill?.name ?? "অজানা মিল"}</td>
                        <td className="text-lg font-bold text-stone-800"><span>{entry.truckNumber}</span><div className="text-base font-semibold text-stone-600">{entry.driverName}</div></td>
                        <td className="text-lg font-extrabold text-amber-900">{toBanglaNum(Number(sent.toFixed(2)))} মণ</td>
                        <td className="text-lg font-bold text-stone-800">{entry.status === "received" ? `${toBanglaNum(Number(oil.toFixed(1)))} লিটার` : "অপেক্ষমাণ"}</td>
                        <td className="text-lg font-bold text-stone-800">{entry.status === "received" ? toBanglaNum(Number(yieldRate.toFixed(2))) : "—"}</td>
                        <td className="text-lg font-bold text-stone-800">{entry.status === "received" ? `${toBanglaNum(entry.cakeMaund)} মণ` : "—"}</td>
                        <td className="text-xl font-black text-emerald-900">{formatTaka(entryCost(entry))}</td>
                        <td>
                          {entry.status === "pending" ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">Pending Return</span>
                              <button type="button" onClick={() => { setReturnEntry(entry); setReturnForm({ oilJars: "0", oilLiters: "0", cakeMaund: "0" }); }} className="btn btn-xs border-amber-300 bg-amber-50 font-bold text-amber-950 hover:bg-amber-100">তেল-খৈল বুঝে নিন</button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> সম্পন্ন</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredEntries.length && <tr><td colSpan="9" className="py-8 text-center text-stone-500">এই মিলের কোনো ট্রাক এন্ট্রি নেই।</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {returnEntry && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-stone-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setReturnEntry(null); }}>
          <form onSubmit={handleReturnSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <div>
              <h3 className="text-xl font-black text-stone-900">মিলের তেল ও খৈল বুঝে নিন</h3>
              <p className="text-sm text-stone-600">{returnEntry.truckNumber} · {returnEntry.truckNumber && MILLS.find((mill) => mill.id === returnEntry.millId)?.name}</p>
            </div>
            <label className={labelClass}>তেল (২০ লিটার জার)
              <input className={fieldClass} type="number" min="0" step="1" value={returnForm.oilJars} onChange={(event) => setReturnForm({ ...returnForm, oilJars: event.target.value })} />
            </label>
            <label className={labelClass}>অতিরিক্ত তেল (লিটার)
              <input className={fieldClass} type="number" min="0" step="0.1" value={returnForm.oilLiters} onChange={(event) => setReturnForm({ ...returnForm, oilLiters: event.target.value })} />
            </label>
            <label className={labelClass}>প্রাপ্ত খৈল (মণ)
              <input className={fieldClass} type="number" min="0" step="0.01" value={returnForm.cakeMaund} onChange={(event) => setReturnForm({ ...returnForm, cakeMaund: event.target.value })} />
            </label>
            {receivedMutation.isError && <p role="alert" className="text-sm font-bold text-red-700">ফেরতের তথ্য সেভ হয়নি। আবার চেষ্টা করুন।</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReturnEntry(null)} className="btn btn-ghost">বাতিল</button>
              <button type="submit" disabled={receivedMutation.isPending} className="btn border-none bg-emerald-800 text-white hover:bg-emerald-900">{receivedMutation.isPending ? "সেভ হচ্ছে..." : "ফেরত বুঝে সেভ করুন"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
