import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ClipboardList, Factory, Printer, Search, Send, Truck } from "lucide-react";
import { APP_CONFIG } from "../../constants/appConfig";
import { getCropFields, getErpData, saveIndustrialQuote } from "../../services/erpService";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const industrialLots = [
  { productId: "yellow-mustard", cropNames: ["সরিষা"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌻" },
  { productId: "maize-vutta", cropNames: ["ভুট্টা"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌽" },
  { productId: "sesame-til", cropNames: ["তিল"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌱" },
  { productId: "paddy-oryza", cropNames: ["ধান", "আমন ধান"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌾" },
  { productId: "wheat-gom", cropNames: ["গম"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌾" },
  { productId: "jute-fiber", cropNames: ["পাট"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🌿" },
  { productId: "black-cumin", cropNames: ["কালোজিরা"], moisture: "লোডিং-পূর্ব পরীক্ষা বাকি", icon: "🫘" },
];
const truckOptions = [
  { tons: 5, label: "৫ টন মিনি ট্রাক" },
  { tons: 10, label: "১০ টন ট্রাক" },
  { tons: 15, label: "১৫+ টন বড় ট্রাক", capacityTons: 15 },
];
const initialForm = {
  productId: "yellow-mustard",
  truckCapacity: "5",
  truckCount: "1",
  companyName: "",
  phone: "",
  factoryLocation: "",
  notes: "",
};

const normalizeDigits = (value) => String(value).replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit));

function getWarehouseMaund(product) {
  const stock = String(product?.stock ?? "");
  const match = stock.match(/[0-9০-৯,]+(?:\.[0-9০-৯]+)?/);
  if (!match) return 0;
  const amount = Number(normalizeDigits(match[0]).replaceAll(",", ""));
  if (!Number.isFinite(amount)) return 0;
  if (/টন|ton/i.test(stock)) return amount * 25;
  if (/কেজি|kg/i.test(stock)) return amount / 40;
  if (/লিটার|প্রি-অর্ডার/i.test(stock)) return 0;
  return amount;
}

function formatAmount(value, digits = 1) {
  return toBanglaNum(Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: digits }));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function printQuote({ form, product, truckLabel, totalTons, totalMaund, estimatedTotal }) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  const today = new Date().toLocaleDateString("bn-BD");
  printWindow.document.write(`<!doctype html>
    <html lang="bn"><head><meta charset="utf-8"><title>${escapeHtml(APP_CONFIG.brandName)} কর্পোরেট কোটেশন</title>
    <style>
      body{font-family:Arial,sans-serif;color:#1c1917;margin:36px;line-height:1.55}
      header{border-bottom:3px solid #064e3b;padding-bottom:16px;margin-bottom:24px}
      h1{color:#064e3b;margin:0 0 4px;font-size:26px} h2{font-size:20px;margin-top:28px}
      .tag{display:inline-block;background:#fef3c7;color:#78350f;padding:6px 12px;border-radius:20px;font-weight:bold}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{border:1px solid #d6d3d1;padding:10px;text-align:left} th{background:#f5f5f4}
      .notice{background:#fef2f2;border-left:4px solid #b91c1c;padding:12px;margin-top:24px}
      footer{margin-top:42px;display:flex;justify-content:space-between}
      @media print{body{margin:16mm}}
    </style></head><body>
    <header><h1>${escapeHtml(APP_CONFIG.brandName)}</h1><div>${escapeHtml(APP_CONFIG.brandEnglish)}</div>
    <p>ইন্ডাস্ট্রিয়াল বাল্ক ক্রয় • তারিখ: ${escapeHtml(today)}</p><span class="tag">প্রাথমিক কোটেশন / চালান অনুরোধ</span></header>
    <h2>ক্রেতা ও ডেলিভারি তথ্য</h2><table>
    <tr><th>প্রতিষ্ঠান / মিল</th><td>${escapeHtml(form.companyName)}</td></tr>
    <tr><th>যোগাযোগ</th><td>${escapeHtml(form.phone)}</td></tr>
    <tr><th>কারখানার ঠিকানা</th><td>${escapeHtml(form.factoryLocation)}</td></tr></table>
    <h2>পণ্য ও ট্রাক লোড হিসাব</h2><table>
    <tr><th>পণ্য</th><td>${escapeHtml(product?.name)}</td></tr>
    <tr><th>ট্রাক পরিকল্পনা</th><td>${escapeHtml(truckLabel)} × ${escapeHtml(form.truckCount)} ট্রিপ</td></tr>
    <tr><th>আনুমানিক পরিমাণ</th><td>${escapeHtml(formatAmount(totalTons, 2))} টন / ${escapeHtml(formatAmount(totalMaund, 1))} মণ</td></tr>
    <tr><th>তালিকাভুক্ত পাইকারি দরে আনুমানিক পণ্য মূল্য</th><td>${escapeHtml(formatTaka(estimatedTotal))}</td></tr></table>
    <p>আর্দ্রতা, গ্রেড, মজুত, পরিবহন ও চূড়ান্ত দর নমুনা পরীক্ষা এবং বিক্রেতার নিশ্চিতকরণের পর নির্ধারিত হবে।</p>
    <div class="notice"><strong>গুরুত্বপূর্ণ:</strong> এটি ক্রয়-অনুরোধের প্রাথমিক হিসাব; মূল্য পরিশোধের রসিদ বা নিশ্চিত সরবরাহ-চুক্তি নয়। পণ্য যাচাই ও লিখিত নিশ্চিতকরণের পর চূড়ান্ত কোটেশন দেওয়া হবে।</div>
    <footer><span>ক্রেতার স্বাক্ষর</span><span>বিক্রেতার নিশ্চিতকরণ</span></footer>
    <script>window.addEventListener("load",()=>window.print())</script></body></html>`);
  printWindow.document.close();
  return true;
}

function printDigitalChallan(quote) {
  const shipment = quote.shipment ?? {};
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  printWindow.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${escapeHtml(APP_CONFIG.brandName)} ডিজিটাল চালান</title>
    <style>body{font-family:Arial,sans-serif;color:#1c1917;margin:36px;line-height:1.55}h1{color:#064e3b;border-bottom:3px solid #064e3b;padding-bottom:12px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #d6d3d1;padding:10px;text-align:left}th{background:#f5f5f4}.note{background:#fef3c7;padding:12px}@media print{body{margin:16mm}}</style></head>
    <body><h1>${escapeHtml(APP_CONFIG.brandName)} — ডিজিটাল ডেলিভারি চালান</h1>
    <p>চালান নং: ${escapeHtml(shipment.challanNumber || "নম্বর দেওয়া হয়নি")} • কোটেশন রেফারেন্স: ${escapeHtml(quote.id)}</p>
    <table><tr><th>প্রতিষ্ঠান</th><td>${escapeHtml(quote.companyName)}</td></tr><tr><th>পণ্য</th><td>${escapeHtml(quote.productName)}</td></tr>
    <tr><th>ট্রাক নম্বর</th><td>${escapeHtml(shipment.truckNumber || "এখনও বরাদ্দ হয়নি")}</td></tr><tr><th>নিট ওজন</th><td>${escapeHtml(shipment.netTons || "—")} টন</td></tr>
    <tr><th>আর্দ্রতা</th><td>${shipment.moisturePercent === null || shipment.moisturePercent === "" ? "পরীক্ষা হয়নি" : `${escapeHtml(shipment.moisturePercent)}%`}</td></tr>
    <tr><th>অবস্থা</th><td>${escapeHtml(shipment.statusLabel || quote.status)}</td></tr></table>
    <p class="note">এই ডিজিটাল চালানটি স্থানীয় ERP-তে সংরক্ষিত ডিসপ্যাচ তথ্যের কপি। ওজন, আর্দ্রতা, সনদ ও প্রাপ্তি গেট-এ যাচাই করুন।</p>
    <script>window.addEventListener("load",()=>window.print())</script></body></html>`);
  printWindow.document.close();
  return true;
}

function ShipmentTracker() {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [error, setError] = useState("");
  const { data, isError } = useQuery({ queryKey: ["erpData"], queryFn: getErpData });
  const quotes = data?.industrialQuotes ?? [];
  const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "").replace(/^88/, "");
  const matches = searchedPhone
    ? quotes.filter((quote) => normalizePhone(quote.phone) === normalizePhone(searchedPhone))
    : [];
  const statusLabels = {
    "quote-requested": "কোটেশন অনুরোধ / অপেক্ষমাণ",
    confirmed: "অর্ডার নিশ্চিত",
    dispatched: "ট্রাক রওনা হয়েছে",
    delivered: "কারখানার গেটে পৌঁছেছে",
  };
  const submitSearch = (event) => {
    event.preventDefault();
    if (normalizePhone(phone).length < 10) {
      setError("কোটেশন দেওয়ার সময় ব্যবহৃত সম্পূর্ণ মোবাইল নম্বরটি লিখুন।");
      setSearchedPhone("");
      return;
    }
    setError("");
    setSearchedPhone(phone);
  };

  return (
    <section id="industrial-shipment-tracker" className="scroll-mt-28 overflow-hidden rounded-3xl border-2 border-emerald-900/15 bg-white shadow-sm" aria-labelledby="shipment-tracker-heading">
      <header className="bg-emerald-950 px-5 py-5 text-white sm:px-7">
        <h3 id="shipment-tracker-heading" className="text-2xl font-black">🚚 ইন্ডাস্ট্রি ট্রাক ডেলিভারি ট্র্যাকার</h3>
        <p className="mt-1 text-sm font-medium text-emerald-100">কোটেশনে দেওয়া মোবাইল নম্বর দিয়ে আপনার বাল্ক চালানের সর্বশেষ অবস্থা দেখুন।</p>
      </header>
      <div className="space-y-4 p-5 sm:p-7">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="shipment-tracker-phone">কোটেশনের মোবাইল নম্বর</label>
          <input id="shipment-tracker-phone" type="tel" inputMode="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="কোটেশনের মোবাইল নম্বর লিখুন" className="input input-bordered min-h-13 flex-1 rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
          <button type="submit" className="btn min-h-13 rounded-xl border-none bg-emerald-800 px-5 font-black text-white hover:bg-emerald-900"><Search className="h-5 w-5" /> চালান খুঁজুন</button>
        </form>
        {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
        {isError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">ট্র্যাকিং তথ্য লোড করা যায়নি। পরে আবার চেষ্টা করুন।</p>}
        {searchedPhone && !matches.length && !isError && (
          <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">এই নম্বরে কোনো কোটেশন পাওয়া যায়নি। নম্বরটি যাচাই করুন, অথবা বিক্রেতার সঙ্গে যোগাযোগ করুন।</p>
        )}
        {matches.map((quote) => {
          const shipment = quote.shipment ?? {};
          const moistureVerified = shipment.moisturePercent !== null &&
            shipment.moisturePercent !== undefined &&
            shipment.moisturePercent !== "" &&
            Number.isFinite(Number(shipment.moisturePercent)) &&
            Boolean(shipment.moistureCertificate);
          const dryGrade = moistureVerified && Number(shipment.moisturePercent) < 12;
          return (
            <article key={quote.id} className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-stone-600">কোটেশন রেফারেন্স</p>
                  <p className="font-black text-stone-900">{quote.id}</p>
                  <h4 className="mt-2 text-xl font-black text-emerald-950">{quote.companyName} • {quote.productName}</h4>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-sm font-black ${quote.status === "delivered" ? "bg-emerald-100 text-emerald-950" : quote.status === "dispatched" ? "bg-blue-100 text-blue-950" : "bg-amber-100 text-amber-950"}`}>
                  {statusLabels[quote.status] ?? "অবস্থা আপডেট হয়নি"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold text-stone-600">ট্রাক নম্বর</p><p className="mt-1 font-black text-stone-900">{shipment.truckNumber || "বরাদ্দের অপেক্ষায়"}</p></div>
                <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold text-stone-600">নিট টনেজ</p><p className="mt-1 font-black text-stone-900">{shipment.netTons ? `${formatAmount(shipment.netTons, 3)} টন` : `${formatAmount(quote.totalTons, 2)} টন (পরিকল্পিত)`}</p></div>
                <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold text-stone-600">আর্দ্রতা সনদ</p><p className={`mt-1 font-black ${dryGrade ? "text-emerald-800" : "text-amber-800"}`}>{moistureVerified ? `${formatAmount(shipment.moisturePercent, 2)}% • ${dryGrade ? "< ১২% পরীক্ষিত" : "সনদ সংরক্ষিত"}` : "পরীক্ষা / সনদ অপেক্ষমাণ"}</p>{shipment.moistureCertificate && <p className="text-xs text-stone-600">সনদ: {shipment.moistureCertificate}</p>}</div>
                <div className="rounded-xl bg-white p-3"><p className="text-xs font-semibold text-stone-600">ডিজিটাল চালান</p><p className="mt-1 font-black text-stone-900">{shipment.challanNumber || "তৈরি হয়নি"}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-stone-600">সর্বশেষ আপডেট: {shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleString("bn-BD") : "ডিসপ্যাচ তথ্য এখনো যোগ হয়নি"}</p>
                <button type="button" onClick={() => { if (!printDigitalChallan(quote)) setError("চালান প্রিন্ট উইন্ডো খোলা যায়নি; ব্রাউজারের পপ-আপ অনুমতি দিন।"); }} className="btn btn-sm border-emerald-800 bg-white font-bold text-emerald-900 hover:bg-emerald-50"><Printer className="h-4 w-4" /> ডিজিটাল চালান প্রিন্ট / সেভ</button>
              </div>
            </article>
          );
        })}
        <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">
          ট্র্যাকিংয়ে শুধু ERP-তে নথিভুক্ত shipment দেখায়। Moisture certificate reference ও পরিমাপ মালিক/গেট-অপারেটর সংরক্ষণ করলে তবেই পরীক্ষিত হিসেবে দেখাবে। বর্তমান অ্যাপের ERP লোকাল ব্রাউজারে সংরক্ষিত; অন্য ডিভাইসে real-time ট্র্যাকিংয়ের জন্য সার্ভার sync প্রয়োজন।
        </p>
      </div>
    </section>
  );
}

export default function IndustrialSupplyDesk({ products = [] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const { data: fields = [], isError: fieldsError } = useQuery({ queryKey: ["cropFields"], queryFn: getCropFields });
  const quoteMutation = useMutation({
    mutationFn: saveIndustrialQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setFeedback("ক্রয় অনুরোধটি স্থানীয় ERP পাইপলাইনে নথিভুক্ত হয়েছে। মালিকের নিশ্চিতকরণের পর চূড়ান্ত কোটেশন দেওয়া হবে।");
    },
  });

  const lots = useMemo(() => industrialLots.map((lot) => {
    const product = products.find((item) => item.id === lot.productId);
    const warehouseMaund = getWarehouseMaund(product);
    const fieldStockMaund = fields
      .filter((field) => lot.cropNames.includes(field.crop))
      .reduce((sum, field) => sum + Number(field.stockMaund || 0) +
        (field.status === "harvesting" ? Number(field.weeklyHarvestMaund || 0) : 0), 0);
    const totalMaund = warehouseMaund + fieldStockMaund;
    return {
      ...lot,
      product,
      warehouseMaund,
      fieldStockMaund,
      totalMaund,
      totalTons: totalMaund / 25,
    };
  }), [fields, products]);

  const selectedLot = lots.find((lot) => lot.productId === form.productId) ?? lots[0];
  const selectedTruck = truckOptions.find((option) => String(option.tons) === form.truckCapacity) ?? truckOptions[0];
  const totalTons = selectedTruck.tons * Number(form.truckCount || 0);
  const totalMaund = totalTons * 25;
  const unitPrice = Number(selectedLot?.product?.wholesalePrice || 0);
  const estimatedTotal = totalMaund * unitPrice;
  const lotAvailable = selectedLot?.totalMaund || 0;
  const quoteRecord = () => ({
    ...form,
    productName: selectedLot?.product?.name || "",
    truckLabel: selectedTruck.label,
    totalTons,
    totalMaund,
    estimatedTotal,
    createdAt: new Date().toISOString(),
    status: "quote-requested",
  });

  const updateForm = (key, value) => {
    setFeedback("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitQuote = (event) => {
    event.preventDefault();
    const message = [
      `*${APP_CONFIG.brandName} — ইন্ডাস্ট্রিয়াল বাল্ক কোটেশন অনুরোধ*`,
      `প্রতিষ্ঠান/মিল: ${form.companyName}`,
      `মোবাইল: ${form.phone}`,
      `কারখানার ঠিকানা: ${form.factoryLocation}`,
      `পণ্য: ${selectedLot?.product?.name ?? ""}`,
      `ট্রাক: ${selectedTruck.label} × ${toBanglaNum(form.truckCount)} ট্রিপ`,
      `আনুমানিক লোড: ${formatAmount(totalTons, 2)} টন (${formatAmount(totalMaund, 1)} মণ)`,
      `তালিকাভুক্ত পাইকারি দরে আনুমানিক মূল্য: ${formatTaka(estimatedTotal)}`,
      `অতিরিক্ত তথ্য: ${form.notes || "নেই"}`,
      "আর্দ্রতা, গ্রেড, মজুত ও চূড়ান্ত দর যাচাই করে কোটেশন নিশ্চিত করুন।",
    ].join("\n");
    const target = event.nativeEvent.submitter?.value;
    if (target === "whatsapp") {
      window.open(`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }
    quoteMutation.mutate(quoteRecord());
  };

  const handlePrint = () => {
    const printed = printQuote({
      form,
      product: selectedLot?.product,
      truckLabel: selectedTruck.label,
      totalTons,
      totalMaund,
      estimatedTotal,
    });
    if (!printed) setFeedback("প্রিন্ট উইন্ডো খোলা যায়নি। ব্রাউজারের পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করুন।");
  };

  return (
    <section id="industrial-procurement" className="scroll-mt-28 space-y-7 rounded-3xl border-2 border-stone-200 bg-[#FAF7F2] p-5 sm:p-8 lg:p-10" aria-labelledby="industrial-desk-title">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-4 py-2 text-sm font-extrabold text-emerald-950">
            <Factory className="h-4 w-4" /> ফিড মিল • অয়েল মিল • অটো রাইস মিল • পাট ও মসলা প্রসেসর
          </span>
          <h2 id="industrial-desk-title" className="mt-4 text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl">
            ইন্ডাস্ট্রিয়াল ও কর্পোরেট বাল্ক প্রোকিউরমেন্ট ডেস্ক
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-700 lg:text-lg">
            গোডাউনের তালিকাভুক্ত মজুত ও ERP-তে থাকা বিক্রয়যোগ্য কৃষক মজুত/চলতি সংগ্রহ একসাথে দেখুন। টন হিসেবে ট্রাক লোডের প্রাথমিক কোটেশন চান।
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950">
          <ClipboardList className="h-5 w-5" /> ১ মণ = ৪০ কেজি
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["ফিড মিল", "ভুট্টা • গম", "🌽"],
          ["অয়েল মিল", "সরিষা • তিল • কালোজিরা", "🛢️"],
          ["অটো রাইস মিল", "ধান", "🌾"],
          ["পাট / মসলা প্রসেসর", "পাট • কালোজিরা", "🌿"],
        ].map(([title, detail, emoji]) => (
          <article key={title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <span className="text-3xl" aria-hidden="true">{emoji}</span>
            <h3 className="mt-2 text-lg font-black text-stone-900">{title}</h3>
            <p className="text-sm font-semibold text-stone-600">{detail}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-stone-200 bg-emerald-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-black lg:text-2xl">📦 লাইভ ইন্ডাস্ট্রিয়াল লট বোর্ড</h3>
          <span className="text-sm font-semibold text-emerald-100">ERP ও ক্যাটালগের বর্তমান এন্ট্রি • চূড়ান্ত লোডের আগে পুনরায় যাচাই হবে</span>
        </div>
        {fieldsError && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">কৃষক মজুত লোড করা যায়নি; কৃষক পাইপলাইনের পরিমাণ গণনায় অন্তর্ভুক্ত হয়নি।</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-220 text-left">
            <thead className="bg-stone-100 text-sm font-extrabold text-stone-700">
              <tr><th className="p-4">পণ্য / লট</th><th className="p-4">গোডাউন মজুত</th><th className="p-4">কৃষক মজুত ও চলতি সংগ্রহ</th><th className="p-4">মোট সম্ভাব্য লট</th><th className="p-4">মান যাচাই</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lots.map((lot) => (
                <tr key={lot.productId} className="align-top">
                  <td className="p-4"><span className="mr-2 text-2xl" aria-hidden="true">{lot.icon}</span><span className="font-extrabold text-stone-900">{lot.product?.name ?? lot.cropNames.join(", ")}</span></td>
                  <td className="p-4 font-bold text-stone-800">{formatAmount(lot.warehouseMaund)} মণ<br /><span className="text-xs font-medium text-stone-500">ক্যাটালগ স্টক</span></td>
                  <td className="p-4 font-bold text-stone-800">{formatAmount(lot.fieldStockMaund)} মণ<br /><span className="text-xs font-medium text-stone-500">ERP মাঠ/গোলার রেকর্ড</span></td>
                  <td className="p-4"><strong className="text-lg font-black text-emerald-900">{formatAmount(lot.totalTons, 2)} টন</strong><br /><span className="font-bold text-stone-700">{formatAmount(lot.totalMaund)} মণ</span></td>
                  <td className="p-4"><span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-950"><BadgeCheck className="h-4 w-4" /> A গ্রেড যাচাই সাপেক্ষে</span><p className="mt-1 text-xs font-semibold text-stone-600">আর্দ্রতা: {lot.moisture}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-stone-100 px-5 py-3 text-xs leading-relaxed text-stone-600">
          টন হিসাব ১ টন = ১,০০০ কেজি এবং ১ মণ = ৪০ কেজি ধরে। প্রদর্শিত মোটে ক্যাটালগ স্টক এবং কৃষকের গোলার মজুত/চলতি সংগ্রহ যোগ করা হয়েছে; সম্ভাব্য পরিমাণ দ্বৈত গণনা এড়াতে অর্ডারের আগে মালিক যাচাই করবেন। আর্দ্রতা শতাংশ ও গ্রেডের পরীক্ষাগার সনদ বর্তমানে ERP-তে নেই—লোডিংয়ের আগে পরীক্ষা করে জানানো হবে।
        </p>
      </div>

      <ShipmentTracker />

      <form onSubmit={submitQuote} className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] sm:p-7">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-950"><Truck className="h-6 w-6" /></span>
            <div><h3 className="text-2xl font-black text-stone-900">টনেজ কোটেশন ও ট্রাক লোড ক্যালকুলেটর</h3><p className="text-sm font-medium text-stone-600">মিল/কোম্পানির তথ্য দিয়ে তাৎক্ষণিক ক্রয় অনুরোধ তৈরি করুন।</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              পণ্য *
              <select required value={form.productId} onChange={(event) => updateForm("productId", event.target.value)} className="select select-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">
                {industrialLots.map((lot) => <option key={lot.productId} value={lot.productId}>{lot.cropNames[0]}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              ট্রাকের ধারণক্ষমতা *
              <select value={form.truckCapacity} onChange={(event) => updateForm("truckCapacity", event.target.value)} className="select select-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">
                {truckOptions.map((option) => <option key={option.tons} value={option.tons}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              ট্রাক / ট্রিপ সংখ্যা *
              <input required type="number" min="1" max="100" step="1" value={form.truckCount} onChange={(event) => updateForm("truckCount", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              কোম্পানি / মিলের নাম *
              <input required value={form.companyName} onChange={(event) => updateForm("companyName", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              যোগাযোগ নম্বর *
              <input required type="tel" inputMode="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
            <label className="space-y-2 text-sm font-extrabold text-stone-800">
              ডেলিভারি কারখানার ঠিকানা *
              <input required value={form.factoryLocation} onChange={(event) => updateForm("factoryLocation", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-extrabold text-stone-800">
            মান, প্যাকিং বা সরবরাহের অতিরিক্ত নির্দেশনা
            <textarea rows="2" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} className="textarea textarea-bordered w-full rounded-xl border-2 border-stone-300 bg-white text-base font-medium text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
          </label>
          {quoteMutation.isError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">কোটেশন অনুরোধ ERP-তে সংরক্ষণ হয়নি। আবার চেষ্টা করুন।</p>}
          {feedback && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{feedback}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" value="whatsapp" disabled={quoteMutation.isPending} className="btn min-h-14 rounded-xl border-none bg-emerald-800 px-4 text-base font-black text-white hover:bg-emerald-900">
              <Send className="h-5 w-5" /> WhatsApp-এ কোটেশন পাঠান
            </button>
            <button type="button" onClick={handlePrint} className="btn min-h-14 rounded-xl border-2 border-emerald-800 bg-white px-4 text-base font-black text-emerald-950 hover:bg-emerald-50">
              <Printer className="h-5 w-5" /> প্রিন্ট কোটেশন / চালান
            </button>
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-emerald-900/15 bg-[#F3EFE6] p-5">
          <h4 className="text-xl font-black text-emerald-950">লোডের আনুমানিক সারাংশ</h4>
          <div className="space-y-3 text-sm font-semibold text-stone-700">
            <p className="flex justify-between gap-3"><span>নির্বাচিত লট</span><span className="text-right font-extrabold text-stone-900">{selectedLot?.cropNames[0]}</span></p>
            <p className="flex justify-between gap-3"><span>ট্রাক ধারণক্ষমতা × ট্রিপ</span><span className="text-right font-extrabold text-stone-900">{selectedTruck.label} × {toBanglaNum(Number(form.truckCount || 0))}</span></p>
            <p className="flex justify-between gap-3"><span>পরিকল্পিত পরিমাণ</span><span className="text-right font-extrabold text-stone-900">{formatAmount(totalTons, 2)} টন / {formatAmount(totalMaund)} মণ</span></p>
            <p className="flex justify-between gap-3"><span>বোর্ডের সম্ভাব্য লট</span><span className="text-right font-extrabold text-emerald-900">{formatAmount(lotAvailable / 25, 2)} টন / {formatAmount(lotAvailable)} মণ</span></p>
            <p className="flex justify-between gap-3 border-t border-stone-300 pt-3"><span>তালিকাভুক্ত দরে আনুমানিক পণ্য মূল্য</span><span className="text-right text-lg font-black text-emerald-950">{formatTaka(estimatedTotal)}</span></p>
          </div>
          {totalMaund > lotAvailable && <p className="rounded-xl border border-amber-300 bg-amber-100 p-3 text-sm font-bold leading-relaxed text-amber-950">চাহিদা বোর্ডের সম্ভাব্য লটের চেয়ে বেশি। বিক্রেতার নিশ্চিতকরণ ছাড়া এই পরিমাণ সরবরাহ নিশ্চিত নয়।</p>}
          <p className="text-xs leading-relaxed text-stone-600">এই হিসাব প্রাথমিক; পরিবহন, আর্দ্রতা, মান যাচাই, প্যাকিং ও চূড়ান্ত দর অন্তর্ভুক্ত নয়। মূল্য-সূচক পণ্য ক্যাটালগের বর্তমান পাইকারি দর থেকে।</p>
        </aside>
      </form>
    </section>
  );
}
