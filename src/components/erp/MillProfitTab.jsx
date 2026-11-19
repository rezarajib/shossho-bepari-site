import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Factory, PlusCircle } from "lucide-react";
import products from "../../data/products.json";
import { saveMillingEntry } from "../../services/erpService";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const numberValue = (value) => Math.max(0, Number(value) || 0);
const oil = products.find((product) => product.id === "mustard-oil");
const cake = products.find((product) => product.id === "mustard-cake");

export default function MillProfitTab({ entries = [], haatList = [], shops = [] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ rawMaund: "", oilLiters: "", cakeMaund: "", cakeKg: "" });
  const mustardPurchases = haatList.filter((entry) => /সরিষা|mustard/i.test(`${entry.productId ?? ""} ${entry.item ?? ""}`));
  const mustardMaund = mustardPurchases.reduce((sum, entry) => sum + numberValue(entry.maund), 0);
  const mustardCost = mustardPurchases.reduce((sum, entry) => sum + numberValue(entry.total), 0);
  const fallbackRate = products.find((product) => product.id === "yellow-mustard")?.wholesalePrice ?? 0;
  const rawMaundRate = mustardMaund > 0 ? mustardCost / mustardMaund : fallbackRate;
  const shopRevenue = shops.reduce((sum, shop) => sum + numberValue(shop.totalBill), 0);
  const processedMaund = entries.reduce((sum, entry) => sum + numberValue(entry.rawMaund), 0);
  const processedRevenue = entries.reduce(
    (sum, entry) =>
      sum +
      numberValue(entry.oilLiters) * (oil?.retailPrice ?? 0) +
      (numberValue(entry.cakeMaund) * 40 + numberValue(entry.cakeKg)) * (cake?.retailPrice ?? 0),
    0,
  );
  const totalHaatCost = haatList.reduce((sum, entry) => sum + numberValue(entry.total), 0);
  const estimatedNet = shopRevenue + processedRevenue - totalHaatCost;

  const mutation = useMutation({
    mutationFn: saveMillingEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setForm({ rawMaund: "", oilLiters: "", cakeMaund: "", cakeKg: "" });
    },
  });

  const submit = (event) => {
    event.preventDefault();
    const rawMaund = numberValue(form.rawMaund);
    if (!rawMaund) return;
    mutation.mutate({
      id: Date.now(),
      date: new Date().toLocaleDateString("bn-BD"),
      rawMaund,
      oilLiters: numberValue(form.oilLiters),
      cakeMaund: numberValue(form.cakeMaund),
      cakeKg: numberValue(form.cakeKg),
      estimatedRawCost: rawMaund * rawMaundRate,
    });
  };

  const fieldClass = "input input-bordered w-full border-stone-300 bg-white";

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-5">
          <p className="text-sm font-bold text-stone-600">মোট হাট ক্রয় ব্যয়</p>
          <p className="mt-1 text-2xl font-black text-stone-900">{formatTaka(totalHaatCost)}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm font-bold text-stone-600">মিল ও দোকানের আনুমানিক বিক্রয়</p>
          <p className="mt-1 text-2xl font-black text-emerald-800">{formatTaka(shopRevenue + processedRevenue)}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${estimatedNet < 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className="text-sm font-bold text-stone-600">আনুমানিক স্থূল লাভ / ক্ষতি</p>
          <p className={`mt-1 text-2xl font-black ${estimatedNet < 0 ? "text-red-700" : "text-emerald-900"}`}>{formatTaka(estimatedNet)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] p-5">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-900"><Factory className="h-5 w-5 text-emerald-800" /> নতুন মিলিং ব্যাচ</h3>
          <label className="block space-y-1 text-sm font-semibold text-stone-700">
            ভাঙানো কাঁচা সরিষা (মণ)
            <input className={fieldClass} type="number" min="0.01" step="0.01" required value={form.rawMaund} onChange={(event) => setForm((current) => ({ ...current, rawMaund: event.target.value }))} />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-stone-700">
            উৎপাদিত সরিষার তেল (লিটার)
            <input className={fieldClass} type="number" min="0" step="0.1" value={form.oilLiters} onChange={(event) => setForm((current) => ({ ...current, oilLiters: event.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1 text-sm font-semibold text-stone-700">
              খৈল (মণ)
              <input className={fieldClass} type="number" min="0" step="0.01" value={form.cakeMaund} onChange={(event) => setForm((current) => ({ ...current, cakeMaund: event.target.value }))} />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-stone-700">
              অতিরিক্ত কেজি
              <input className={fieldClass} type="number" min="0" max="39.99" step="0.1" value={form.cakeKg} onChange={(event) => setForm((current) => ({ ...current, cakeKg: event.target.value }))} />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-stone-600">বিক্রয় মূল্য পণ্য ক্যাটালগের বর্তমান খুচরা দর ধরে আনুমানিক হিসাব করা হবে। সরিষার গড় হাট দর না থাকলে ক্যাটালগের পাইকারি দর ধরা হবে।</p>
          {mutation.isError && <p role="alert" className="text-sm font-semibold text-red-700">মিলিং তথ্য সেভ করা যায়নি। আবার চেষ্টা করুন।</p>}
          <button type="submit" disabled={mutation.isPending} className="btn w-full border-none bg-emerald-800 font-bold text-white hover:bg-emerald-900">
            <PlusCircle className="h-4 w-4" /> {mutation.isPending ? "সেভ হচ্ছে..." : "মিলিং ব্যাচ সেভ করুন"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            {`এ পর্যন্ত ${toBanglaNum(processedMaund)} মণ সরিষা প্রসেসের হিসাব আছে। লাভ-ক্ষতি হলো ক্যাটালগ দরে অনুমিত বিক্রয়; বাস্তব নগদ লাভের জন্য অন্যান্য খরচও হিসাব করুন।`}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
              <thead><tr><th>তারিখ</th><th>কাঁচা সরিষা</th><th>তেল</th><th>খৈল</th><th>আনুমানিক কাঁচামাল খরচ</th></tr></thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-amber-50/60">
                    <td className="text-base font-bold text-stone-700 lg:text-lg">{entry.date}</td>
                    <td className="text-lg font-extrabold text-amber-900">{toBanglaNum(entry.rawMaund)} মণ</td>
                    <td className="text-lg font-bold text-stone-800">{toBanglaNum(entry.oilLiters)} লিটার</td>
                    <td className="text-lg font-bold text-stone-800">{toBanglaNum(entry.cakeMaund)} মণ {toBanglaNum(entry.cakeKg)} কেজি</td>
                    <td className="text-xl font-black text-emerald-900">{formatTaka(entry.estimatedRawCost)}</td>
                  </tr>
                ))}
                {!entries.length && <tr><td colSpan="5" className="py-8 text-center text-stone-500">এখনও কোনো মিলিং ব্যাচ যোগ হয়নি।</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
