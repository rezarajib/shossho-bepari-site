import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { House, MessageCircle, Store, Truck } from "lucide-react";
import products from "../../data/products.json";
import { APP_CONFIG } from "../../constants/appConfig";
import { saveDirectFarmerEntry, saveHaatEntry } from "../../services/erpService";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const MAUND_KG = 40;
const DIRECT_COMMODITY_IDS = [
  "yellow-mustard",
  "sesame-til",
  "paddy-oryza",
  "maize-vutta",
  "jute-fiber",
  "black-cumin",
  "black-gram",
  "grass-pea",
  "wheat-gom",
  "pulses-mix",
  "miniket-chal",
  "mustard-cake",
];
const commodities = products.filter((product) => DIRECT_COMMODITY_IDS.includes(product.id));
const initialFarmerForm = {
  farmerName: "",
  village: "",
  phone: "",
  productId: "yellow-mustard",
  maund: "",
  kg: "",
  deductionKg: "0",
  ratePerMaund: "",
  haatRatePerMaund: "",
  transportCost: "0",
  paid: "",
};

const numberValue = (value) => Math.max(0, Number(value) || 0);

function WeightLabel({ kg }) {
  const maund = Math.floor(kg / MAUND_KG);
  const remainingKg = Number((kg % MAUND_KG).toFixed(2));
  return (
    <span>
      {toBanglaNum(maund)} মণ{remainingKg ? ` ${toBanglaNum(remainingKg)} কেজি` : ""}
      {" "}({toBanglaNum(Number(kg.toFixed(2)))} কেজি)
    </span>
  );
}

function getFarmerKey(farmer) {
  return `${String(farmer.farmerName ?? "").trim().toLocaleLowerCase()}|${String(farmer.village ?? "").trim().toLocaleLowerCase()}`;
}

function getWeightSlipUrl(entry, loyaltyBonus) {
  const phone = String(entry.phone ?? "").replace(/\D/g, "");
  if (phone.length < 10) return null;
  const internationalPhone = phone.startsWith("0") ? `88${phone}` : phone;
  const netKg = numberValue(entry.netKg);
  const totalMaund = netKg / MAUND_KG;
  const message = [
    `*${APP_CONFIG.brandName} — ডিজিটাল ওজন রসিদ*`,
    `তারিখ: ${entry.date}`,
    `কৃষকের নাম: ${entry.farmerName}`,
    `গ্রাম: ${entry.village}`,
    `ফসল: ${entry.item}`,
    `নিট ওজন: ${toBanglaNum(totalMaund.toFixed(2))} মণ (${toBanglaNum(netKg.toFixed(2))} কেজি)`,
    `ক্রয় দর: ${formatTaka(entry.ratePerMaund)} / মণ`,
    `মোট বিল: ${formatTaka(entry.total)}`,
    `নগদ পরিশোধ: ${formatTaka(entry.paid)}`,
    `বাকি: ${formatTaka(entry.due)}`,
    `মোট সংগ্রহে অর্জিত লয়্যালটি বোনাস: ${formatTaka(loyaltyBonus)}`,
    "ধন্যবাদ—আপনার ফসল সরাসরি সংগ্রহ করার ডিজিটাল রসিদ।",
  ].join("\n");
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export default function HaatPurchaseTab({ haatList = [], directFarmList = [] }) {
  const queryClient = useQueryClient();
  const [sourceType, setSourceType] = useState("haat");
  const [haatForm, setHaatForm] = useState({
    productId: "yellow-mustard",
    maund: "",
    ratePerMaund: "",
  });
  const [farmerForm, setFarmerForm] = useState(initialFarmerForm);
  const selectedProduct = commodities.find((product) => product.id === farmerForm.productId) ?? commodities[0];
  const grossKg = numberValue(farmerForm.maund) * MAUND_KG + numberValue(farmerForm.kg);
  const netKg = Math.max(0, grossKg - numberValue(farmerForm.deductionKg));
  const netMaund = netKg / MAUND_KG;
  const payable = netMaund * numberValue(farmerForm.ratePerMaund);
  const paid = Math.min(payable, numberValue(farmerForm.paid));
  const due = Math.max(0, payable - paid);
  const landedCostPerMaund = netMaund > 0
    ? (payable + numberValue(farmerForm.transportCost)) / netMaund
    : 0;

  const haatMutation = useMutation({
    mutationFn: saveHaatEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setHaatForm((current) => ({ ...current, maund: "", ratePerMaund: "" }));
    },
  });
  const directMutation = useMutation({
    mutationFn: saveDirectFarmerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setFarmerForm(initialFarmerForm);
    },
  });

  const farmerDirectory = useMemo(() => {
    const farmers = new Map();
    directFarmList.forEach((entry) => {
      const key = `${entry.farmerName ?? ""}|${entry.village ?? ""}`;
      const farmer = farmers.get(key) ?? {
        farmerName: entry.farmerName || "নাম দেওয়া হয়নি",
        village: entry.village || "গ্রাম উল্লেখ নেই",
        phone: entry.phone || "",
        maund: 0,
        savings: 0,
        savingsMaund: 0,
        due: 0,
        visits: 0,
      };
      const weightMaund = numberValue(entry.netKg) / MAUND_KG;
      const haatRate = numberValue(entry.haatRatePerMaund);
      const directRate = numberValue(entry.ratePerMaund);
      farmer.maund += weightMaund;
      farmer.loyaltyBonus = (farmer.loyaltyBonus || 0) + weightMaund * 15;
      farmer.due += numberValue(entry.due);
      farmer.visits += 1;
      if (haatRate > 0 && weightMaund > 0) {
        farmer.savings += (haatRate - directRate) * weightMaund;
        farmer.savingsMaund += weightMaund;
      }
      if (!farmer.phone && entry.phone) farmer.phone = entry.phone;
      farmers.set(key, farmer);
    });

    return [...farmers.values()].map((farmer) => ({
      ...farmer,
      averageSavingsPerMaund: farmer.savingsMaund > 0 ? farmer.savings / farmer.savingsMaund : null,
    }));
  }, [directFarmList]);

  const totalDirectMaund = directFarmList.reduce((sum, entry) => sum + numberValue(entry.netKg) / MAUND_KG, 0);
  const totalFarmerDue = directFarmList.reduce((sum, entry) => sum + numberValue(entry.due), 0);
  const savingsEntries = directFarmList.filter((entry) => numberValue(entry.haatRatePerMaund) > 0 && numberValue(entry.netKg) > 0);
  const savingsMaunds = savingsEntries.reduce((sum, entry) => sum + numberValue(entry.netKg) / MAUND_KG, 0);
  const averageSavings = savingsMaunds > 0
    ? savingsEntries.reduce(
      (sum, entry) => sum + (numberValue(entry.haatRatePerMaund) - numberValue(entry.ratePerMaund)) * (numberValue(entry.netKg) / MAUND_KG),
      0,
    ) / savingsMaunds
    : null;

  const updateFarmerField = (field, value) => {
    setFarmerForm((current) => ({ ...current, [field]: value }));
  };

  const submitHaatPurchase = (event) => {
    event.preventDefault();
    const product = commodities.find((item) => item.id === haatForm.productId);
    const maund = numberValue(haatForm.maund);
    const ratePerMaund = numberValue(haatForm.ratePerMaund);
    if (!product || !maund || !ratePerMaund) return;

    haatMutation.mutate({
      id: Date.now(),
      sourceType: "haat",
      date: new Date().toLocaleDateString("bn-BD"),
      productId: product.id,
      item: product.name,
      maund,
      ratePerMaund,
      total: maund * ratePerMaund,
    });
  };

  const submitFarmerPurchase = (event) => {
    event.preventDefault();
    if (!farmerForm.farmerName.trim() || !farmerForm.village.trim() || !netKg || !numberValue(farmerForm.ratePerMaund)) return;

    directMutation.mutate({
      id: Date.now(),
      sourceType: "direct-farmer",
      date: new Date().toLocaleDateString("bn-BD"),
      farmerName: farmerForm.farmerName.trim(),
      village: farmerForm.village.trim(),
      phone: farmerForm.phone.trim(),
      productId: selectedProduct.id,
      item: selectedProduct.name,
      grossKg,
      deductionKg: numberValue(farmerForm.deductionKg),
      netKg,
      netMaund,
      ratePerMaund: numberValue(farmerForm.ratePerMaund),
      haatRatePerMaund: numberValue(farmerForm.haatRatePerMaund),
      transportCost: numberValue(farmerForm.transportCost),
      total: payable,
      paid,
      due,
      landedCostPerMaund,
    });
  };

  const inputClass = "input input-bordered min-h-14 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3.5 text-lg font-bold text-stone-900 placeholder:font-medium placeholder:text-stone-400 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/15 lg:text-xl";
  const labelClass = "mb-2 block text-base font-extrabold text-stone-800 lg:text-lg";

  return (
    <section id="haat-purchase" className="min-w-0 space-y-6 overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-[#FAF7F2] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-stone-900 lg:text-3xl">কৃষক ও হাট থেকে শস্য সংগ্রহ</h2>
          <p className="mt-1 text-base font-medium text-stone-600 lg:text-lg">ক্রয়ের উৎস, কৃষক, পরিবহন ও পরিশোধের হিসাব এক জায়গায় রাখুন।</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2" aria-label="ক্রয়ের উৎস নির্বাচন">
          <button
            type="button"
            onClick={() => setSourceType("haat")}
            aria-pressed={sourceType === "haat"}
            className={`btn min-h-12 whitespace-normal rounded-xl px-5 py-3 text-base font-black lg:text-lg ${sourceType === "haat" ? "border-emerald-800 bg-emerald-800 text-white" : "border-stone-300 bg-white text-stone-700"}`}
          >
            <Store className="h-4 w-4" /> সাপ্তাহিক হাট ক্রয়
          </button>
          <button
            type="button"
            onClick={() => setSourceType("direct")}
            aria-pressed={sourceType === "direct"}
            className={`btn min-h-12 whitespace-normal rounded-xl px-5 py-3 text-base font-black lg:text-lg ${sourceType === "direct" ? "border-emerald-800 bg-emerald-800 text-white" : "border-stone-300 bg-white text-stone-700"}`}
          >
            <House className="h-4 w-4" /> কৃষকের বাড়ি থেকে সংগ্রহ
          </button>
        </div>
      </div>

      <div className="px-5 pb-6 sm:px-6">
        {(haatMutation.isError || directMutation.isError) && (
          <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            ক্রয়ের তথ্য সেভ করা যায়নি। আবার চেষ্টা করুন।
          </p>
        )}
        {sourceType === "haat" ? (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <form onSubmit={submitHaatPurchase} className="space-y-3 rounded-2xl border border-emerald-200 bg-[#FAF7F2] p-4 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900">নতুন সাপ্তাহিক হাট ক্রয়</h3>
              <label className={labelClass}>
                পণ্যের নাম
                <select
                  className={inputClass}
                  value={haatForm.productId}
                  onChange={(event) => setHaatForm((current) => ({ ...current, productId: event.target.value }))}
                >
                  {commodities.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </label>
              <label className={labelClass}>
                পরিমাণ (মণ)
                <input className={inputClass} type="number" min="0.01" step="0.01" required value={haatForm.maund} onChange={(event) => setHaatForm((current) => ({ ...current, maund: event.target.value }))} />
              </label>
              <label className={labelClass}>
                প্রতি মণের দর (৳)
                <input className={inputClass} type="number" min="1" step="1" required value={haatForm.ratePerMaund} onChange={(event) => setHaatForm((current) => ({ ...current, ratePerMaund: event.target.value }))} />
              </label>
              <button type="submit" disabled={haatMutation.isPending} className="btn min-h-14 w-full border-none bg-emerald-800 px-4 py-3 text-lg font-bold text-white hover:bg-emerald-900">
                {haatMutation.isPending ? "সেভ হচ্ছে..." : "হাট ক্রয় খাতায় সেভ করুন"}
              </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50/60">
              <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
                <thead><tr><th>তারিখ</th><th>পণ্য</th><th>পরিমাণ</th><th>দর/মণ</th><th>মোট</th></tr></thead>
                <tbody>
                  {haatList.map((entry) => (
                    <tr key={entry.id}>
                      <td className="text-base font-bold text-stone-700 lg:text-lg">{entry.date}</td>
                      <td className="text-lg font-black text-stone-900 lg:text-xl">{entry.item}</td>
                      <td className="text-lg font-extrabold text-amber-900 lg:text-xl">{toBanglaNum(entry.maund)} মণ</td>
                      <td className="text-lg font-bold text-stone-800 lg:text-xl">{formatTaka(entry.ratePerMaund)}</td>
                      <td className="text-xl font-black text-emerald-900 lg:text-2xl">{formatTaka(entry.total)}</td>
                    </tr>
                  ))}
                  {!haatList.length && <tr><td colSpan="5" className="py-8 text-center text-stone-500">এখনও কোনো হাট ক্রয় যোগ হয়নি।</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={submitFarmerPurchase} className="grid min-w-0 grid-cols-1 gap-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelClass}>
                কৃষকের নাম
                <input className={inputClass} value={farmerForm.farmerName} onChange={(event) => updateFarmerField("farmerName", event.target.value)} placeholder="যেমন: আব্দুল করিম" required />
              </label>
              <label className={labelClass}>
                গ্রাম / পাড়া
                <input className={inputClass} value={farmerForm.village} onChange={(event) => updateFarmerField("village", event.target.value)} placeholder="গ্রাম বা পাড়ার নাম" required />
              </label>
              <label className={labelClass}>
                মোবাইল নম্বর
                <input className={inputClass} type="tel" inputMode="tel" value={farmerForm.phone} onChange={(event) => updateFarmerField("phone", event.target.value)} placeholder="পুনরায় সংগ্রহের যোগাযোগ" />
              </label>
              <label className={labelClass}>
                পণ্যের নাম
                <select className={inputClass} value={farmerForm.productId} onChange={(event) => updateFarmerField("productId", event.target.value)}>
                  {commodities.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </label>
              <div className="md:col-span-2">
                <span className="mb-2 block text-base font-extrabold text-stone-800 lg:text-lg">মোট ওজন (মণ ও কেজি)</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelClass}>
                    মণ
                    <input className={inputClass} type="number" min="0" step="1" value={farmerForm.maund} onChange={(event) => updateFarmerField("maund", event.target.value)} />
                  </label>
                  <label className={labelClass}>
                    অতিরিক্ত কেজি
                    <input className={inputClass} type="number" min="0" max="39.99" step="0.1" value={farmerForm.kg} onChange={(event) => updateFarmerField("kg", event.target.value)} />
                  </label>
                </div>
              </div>
              <label className={labelClass}>
                আর্দ্রতা / ধলতা বাদ (কেজি)
                <input className={inputClass} type="number" min="0" step="0.1" value={farmerForm.deductionKg} onChange={(event) => updateFarmerField("deductionKg", event.target.value)} />
              </label>
              <label className={labelClass}>
                প্রতি মণের ক্রয় দর (৳)
                <input className={inputClass} type="number" min="1" step="1" value={farmerForm.ratePerMaund} onChange={(event) => updateFarmerField("ratePerMaund", event.target.value)} required />
              </label>
              <label className={labelClass}>
                তুলনার জন্য হাট দর/মণ (৳)
                <input className={inputClass} type="number" min="0" step="1" value={farmerForm.haatRatePerMaund} onChange={(event) => updateFarmerField("haatRatePerMaund", event.target.value)} placeholder="সাশ্রয় হিসাবের জন্য" />
              </label>
              <label className={labelClass}>
                ভ্যান / গাড়ি ভাড়া (৳)
                <input className={inputClass} type="number" min="0" step="1" value={farmerForm.transportCost} onChange={(event) => updateFarmerField("transportCost", event.target.value)} />
              </label>
              <label className={labelClass}>
                নগদ পরিশোধ (৳)
                <input className={inputClass} type="number" min="0" step="1" max={payable} value={farmerForm.paid} onChange={(event) => updateFarmerField("paid", event.target.value)} placeholder="০" />
              </label>

              <div className="rounded-xl border border-stone-200 bg-white p-4 text-base md:col-span-2 xl:col-span-3 lg:text-lg">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="text-base font-bold text-stone-600 lg:text-lg">নিট পরিশোধযোগ্য ওজন:</span><br /><strong className="text-xl font-black text-emerald-900 lg:text-2xl"><WeightLabel kg={netKg} /></strong></p>
                  <p><span className="text-base font-bold text-stone-600 lg:text-lg">পণ্যের মূল্য:</span><br /><strong className="text-xl font-black text-stone-900 lg:text-2xl">{formatTaka(payable)}</strong></p>
                  <p><span className="text-base font-bold text-stone-600 lg:text-lg">বাকি:</span><br /><strong className="text-xl font-black text-rose-700 lg:text-2xl">{formatTaka(due)}</strong></p>
                  <p><span className="text-base font-bold text-stone-600 lg:text-lg">গোডাউন landed cost/মণ:</span><br /><strong className="text-xl font-black text-emerald-900 lg:text-2xl">{formatTaka(landedCostPerMaund)}</strong></p>
                </div>
                <p className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3 text-base font-semibold text-stone-700 lg:text-lg">
                  <Truck className="h-3.5 w-3.5 text-emerald-800" />
                  {selectedProduct?.name}: স্থূল {toBanglaNum(grossKg)} কেজি − বাদ {toBanglaNum(numberValue(farmerForm.deductionKg))} কেজি
                </p>
              </div>
              <button type="submit" disabled={directMutation.isPending || netKg <= 0} className="btn min-h-14 border-none bg-emerald-800 px-5 py-3 text-lg font-bold text-white hover:bg-emerald-900 md:col-span-2 xl:col-span-3">
                {directMutation.isPending ? "সেভ হচ্ছে..." : "কৃষক সংগ্রহ ও পাওনা খাতায় সেভ করুন"}
              </button>
            </form>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-4">
                <p className="text-sm font-semibold text-stone-600">সরাসরি কৃষক থেকে সংগ্রহ</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">{toBanglaNum(totalDirectMaund.toFixed(2))} মণ</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-sm font-semibold text-stone-600">হাটের তুলনায় গড় সাশ্রয় / মণ</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">{averageSavings === null ? "দর যোগ হয়নি" : formatTaka(averageSavings)}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-stone-600">কৃষকদের মোট বাকি</p>
                <p className="mt-1 text-2xl font-black text-rose-700">{formatTaka(totalFarmerDue)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <h3 className="text-lg font-black text-amber-950">🎁 কৃষক লয়্যালটি বোনাস</h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-950/85">
                সরাসরি কৃষক সংগ্রহের প্রতি মণে ৳১৫ করে রিওয়ার্ড জমা হচ্ছে। এটি ক্রয়-ইতিহাসভিত্তিক হিসাব; নগদ/বিকাশে বোনাস পরিশোধ আলাদা করে নথিভুক্ত করতে হবে।
              </p>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
                  <caption className="caption-top px-4 py-3 text-left text-lg font-extrabold text-stone-900">কৃষক ডিরেক্টরি ও সংগ্রহের সারাংশ</caption>
                  <thead><tr><th>কৃষক ও গ্রাম</th><th>মোবাইল</th><th>মোট সংগ্রহ</th><th>লয়্যালটি বোনাস</th><th>গড় সাশ্রয়/মণ</th><th>বাকি</th><th>সংগ্রহ</th></tr></thead>
                  <tbody>
                    {farmerDirectory.map((farmer) => (
                      <tr key={`${farmer.farmerName}|${farmer.village}`} className="transition-colors hover:bg-amber-50/60">
                        <td className="border-b border-stone-200 py-5 text-lg font-black text-stone-900">{farmer.farmerName}<br /><span className="text-base font-semibold text-stone-700">{farmer.village}</span></td>
                        <td className="border-b border-stone-200 px-5 py-5 text-base font-bold text-stone-700 lg:text-lg">{farmer.phone || "—"}</td>
                        <td className="border-b border-stone-200 px-5 py-5 text-lg font-extrabold text-amber-900">{toBanglaNum(farmer.maund.toFixed(2))} মণ</td>
                        <td className="border-b border-stone-200 px-5 py-5 text-lg font-black text-emerald-900">{formatTaka(farmer.loyaltyBonus || farmer.maund * 15)}</td>
                        <td className="border-b border-stone-200 px-5 py-5 text-lg font-bold text-stone-800">{farmer.averageSavingsPerMaund === null ? "—" : formatTaka(farmer.averageSavingsPerMaund)}</td>
                        <td className={`border-b border-stone-200 px-5 py-5 text-lg font-black ${farmer.due ? "text-rose-700" : "text-emerald-900"}`}>{formatTaka(farmer.due)}</td>
                        <td className="border-b border-stone-200 px-5 py-5 text-lg font-bold text-stone-800">{toBanglaNum(farmer.visits)} বার</td>
                      </tr>
                    ))}
                    {!farmerDirectory.length && <tr><td colSpan="7" className="py-8 text-center text-stone-500">কৃষক সংগ্রহের রেকর্ড যোগ হলে ডিরেক্টরি এখানে দেখা যাবে।</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
                  <caption className="caption-top px-4 py-3 text-left text-lg font-extrabold text-stone-900">সরাসরি কৃষক সংগ্রহের ইতিহাস</caption>
                  <thead><tr><th>তারিখ</th><th>কৃষক / গ্রাম</th><th>পণ্য</th><th>নিট ওজন</th><th>দর/মণ</th><th>গাড়ি ভাড়া</th><th>গোদাম দর/মণ</th><th>মোট / বাকি</th><th>ওজন রসিদ</th></tr></thead>
                  <tbody>
                    {directFarmList.map((entry) => (
                      <tr key={entry.id} className="transition-colors hover:bg-amber-50/60">
                        <td className="text-base font-bold text-stone-700 lg:text-lg">{entry.date}</td>
                        <td className="text-lg font-black text-stone-900">{entry.farmerName}<br /><span className="text-base font-semibold text-stone-700">{entry.village}</span></td>
                        <td className="text-lg font-black text-stone-900">{entry.item}</td>
                        <td className="text-lg font-extrabold text-amber-900"><WeightLabel kg={numberValue(entry.netKg)} /></td>
                        <td className="text-lg font-bold text-stone-800">{formatTaka(entry.ratePerMaund)}</td>
                        <td className="text-lg font-bold text-stone-800">{formatTaka(entry.transportCost)}</td>
                        <td className="text-lg font-bold text-stone-800">{formatTaka(entry.landedCostPerMaund)}</td>
                        <td className="text-xl font-black text-emerald-900">{formatTaka(entry.total)}<br /><span className="text-base font-bold text-rose-700">বাকি {formatTaka(entry.due)}</span></td>
                        <td>
                          {(() => {
                            const farmer = farmerDirectory.find((item) => getFarmerKey(item) === getFarmerKey(entry));
                            const loyaltyBonus = (farmer?.maund ?? 0) * 15;
                            const url = getWeightSlipUrl(entry, loyaltyBonus);
                            return url ? (
                              <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm whitespace-nowrap border-emerald-800 bg-white font-bold text-emerald-900 hover:bg-emerald-50">
                                <MessageCircle className="h-4 w-4" /> 📲 WhatsApp Slip
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-stone-500" title="এই কৃষকের রেকর্ডে বৈধ মোবাইল নম্বর নেই">মোবাইল নম্বর নেই</span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                    {!directFarmList.length && <tr><td colSpan="9" className="py-8 text-center text-stone-500">এখনও সরাসরি কৃষক সংগ্রহের ইতিহাস নেই।</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
