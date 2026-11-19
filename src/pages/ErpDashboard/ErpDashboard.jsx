import { Fragment, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { AlertTriangle, Download, MapPinned, Package, PlusCircle, Store, Wallet } from "lucide-react";
import products from "../../data/products.json";
import { addHaatFund, getCropFields, getErpData, saveCropField, saveHaatFund, updateIndustrialShipment, updateShopLedger } from "../../services/erpService";
import { APP_CONFIG } from "../../constants/appConfig";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";
import CustomButton from "../../common/Button/CustomButton";
import CustomModal from "../../common/Modal/CustomModal";
import HaatPurchaseTab from "../../components/erp/HaatPurchaseTab";
import MillProfitTab from "../../components/erp/MillProfitTab";
import MillTruckLedgerTab from "../../components/erp/MillTruckLedgerTab";
import { CROP_OPTIONS, CROP_STATUS_OPTIONS } from "../../utils/cropFields";

const normalizeDigits = (value) => value.replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit));
const blankCropForm = {
  id: "",
  farmerName: "",
  phone: "",
  village: "",
  union: "",
  crop: "সরিষা",
  variety: "",
  season: "rabi",
  areaBigha: "",
  estimatedMaund: "",
  stockMaund: "0",
  weeklyHarvestMaund: "0",
  status: "growing",
  harvestDays: "0",
};
const erpModalPanelClass = "w-full max-w-3xl overflow-y-auto rounded-3xl border-2 border-stone-300 bg-[#FAF7F2] p-5 shadow-2xl sm:p-8 lg:max-w-4xl lg:p-10";
const erpModalTitleClass = "text-2xl font-black text-stone-900 lg:text-3xl";
const erpModalInputClass = "input input-bordered min-h-14 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3.5 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15 lg:text-xl";
const erpModalSelectClass = "select select-bordered min-h-14 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 py-3.5 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15 lg:text-xl";
const erpModalLabelClass = "block space-y-2 text-base font-extrabold text-stone-800 lg:text-lg";
const CORE_COMMODITY_IDS = [
  "yellow-mustard", "wheat-gom", "miniket-chal", "sesame-til", "mustard-oil", "mustard-cake",
  "paddy-oryza", "maize-vutta", "jute-fiber", "black-cumin", "black-gram", "grass-pea",
];
const farmerPresetClassName = (isSelected) => [
  "max-w-full whitespace-normal rounded-xl border px-4 py-2.5 text-left text-base font-bold transition lg:text-[17px]",
  isSelected
    ? "border-emerald-900 bg-emerald-800 text-white shadow-md"
    : "border-stone-300 bg-[#FAF7F2] text-stone-800 hover:border-emerald-700 hover:bg-emerald-50",
].join(" ");

function getCatalogStock(product) {
  const match = String(product.stock ?? "").match(/[0-9০-৯,]+(?:\.[0-9০-৯]+)?/);
  if (!match) return { quantity: 0, unit: product.unitType === "volume" ? "liter" : "maund", value: 0 };
  const quantity = Number(normalizeDigits(match[0]).replaceAll(",", ""));
  if (!Number.isFinite(quantity)) return { quantity: 0, unit: product.unitType === "volume" ? "liter" : "maund", value: 0 };
  if (product.unitType === "volume") {
    const liters = /মণ/.test(product.stock) ? quantity * 40 : quantity;
    return { quantity: liters, unit: "liter", value: liters * product.retailPrice };
  }
  const kg = /টন/.test(product.stock) ? quantity * 1000 : /কেজি/.test(product.stock) ? quantity : quantity * 40;
  const maund = kg / 40;
  return { quantity: maund, unit: "maund", value: maund * product.wholesalePrice };
}

function getMillYield(entries, millId) {
  const completed = entries.filter((entry) => entry.millId === millId && entry.status === "received");
  const sentMaund = completed.reduce(
    (sum, entry) => sum + Math.max(0, Number(entry.maund) || 0) + Math.max(0, Number(entry.kg) || 0) / 40,
    0,
  );
  const oilLiters = completed.reduce(
    (sum, entry) => sum + Math.max(0, Number(entry.oilJars) || 0) * 20 + Math.max(0, Number(entry.oilLiters) || 0),
    0,
  );
  return sentMaund > 0 ? oilLiters / sentMaund : 0;
}

function downloadLedgerCsv({ shops, haat, directFarm, milling, millTruck, farmerBookings, industrialQuotes, fund }) {
  const rows = [
    ["ধরন", "তারিখ", "নাম/পণ্য", "পরিমাণ", "দর/মূল্য", "মোট", "পরিশোধ", "বাকি"],
    ["তহবিল", "", "হাট তহবিল", "", "", fund, "", ""],
    ...haat.map((entry) => ["হাট ক্রয়", entry.date, entry.item, `${entry.maund} মণ`, entry.ratePerMaund, entry.total, "", ""]),
    ...directFarm.map((entry) => ["কৃষক সংগ্রহ", entry.date, `${entry.farmerName} — ${entry.item}`, `${entry.netKg} কেজি`, entry.ratePerMaund, entry.total, entry.paid, entry.due]),
    ...shops.map((shop) => ["দোকান লেজার", "", `${shop.name} — ${shop.owner}`, `${shop.liters} লিটার`, "", shop.totalBill, shop.paid, shop.due]),
    ...milling.map((entry) => ["মিলিং", entry.date, "সরিষা প্রসেসিং", `${entry.rawMaund} মণ`, "", entry.estimatedRawCost, "", ""]),
    ...millTruck.map((entry) => ["মিল ও ট্রাক", entry.date, `${entry.millId} — ${entry.truckNumber}`, `${entry.maund} মণ ${entry.kg} কেজি`, "", entry.millFee + entry.truckRent, entry.status, ""]),
    ...farmerBookings.map((entry) => ["অগ্রিম কৃষক বুকিং", entry.createdAt?.slice(0, 10), `${entry.farmerName} — ${entry.village}`, `${entry.estimatedMaund} মণ`, entry.cropName, "", entry.status, entry.phone]),
    ...industrialQuotes.map((entry) => ["ইন্ডাস্ট্রিয়াল কোটেশন", entry.createdAt?.slice(0, 10), entry.companyName, `${entry.totalTons} টন / ${entry.totalMaund} মণ`, entry.productName, entry.estimatedTotal, entry.status, entry.phone]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `shossho-bepari-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function IndustrialShipmentEditor({ quote }) {
  const queryClient = useQueryClient();
  const [shipment, setShipment] = useState(() => ({
    status: quote.shipment?.status ?? quote.status ?? "quote-requested",
    truckNumber: quote.shipment?.truckNumber ?? "",
    netTons: String(quote.shipment?.netTons ?? quote.totalTons ?? ""),
    moisturePercent: quote.shipment?.moisturePercent == null ? "" : String(quote.shipment.moisturePercent),
    moistureCertificate: quote.shipment?.moistureCertificate ?? "",
    challanNumber: quote.shipment?.challanNumber ?? "",
  }));
  const mutation = useMutation({
    mutationFn: ({ id, values }) => updateIndustrialShipment(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["erpData"] }),
  });
  const update = (key, value) => setShipment((current) => ({ ...current, [key]: value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ id: quote.id, values: shipment });
      }}
      className="grid gap-3 rounded-xl border border-emerald-900/15 bg-[#FAF7F2] p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        চালানের অবস্থা
        <select value={shipment.status} onChange={(event) => update("status", event.target.value)} className="select select-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm font-bold text-stone-900">
          <option value="quote-requested">কোটেশন অপেক্ষমাণ</option>
          <option value="confirmed">অর্ডার নিশ্চিত</option>
          <option value="dispatched">ট্রাক রওনা হয়েছে</option>
          <option value="delivered">কারখানার গেটে পৌঁছেছে</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        ট্রাক নম্বর
        <input value={shipment.truckNumber} onChange={(event) => update("truckNumber", event.target.value)} className="input input-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm text-stone-900" placeholder="যেমন: ঢাকা মেট্রো-ট ১২-৩৪৫৬" />
      </label>
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        ওজন করা নিট টন
        <input type="number" min="0" step="0.001" value={shipment.netTons} onChange={(event) => update("netTons", event.target.value)} className="input input-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm text-stone-900" />
      </label>
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        মাপা আর্দ্রতা (%)
        <input type="number" min="0" max="100" step="0.01" value={shipment.moisturePercent} onChange={(event) => update("moisturePercent", event.target.value)} className="input input-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm text-stone-900" placeholder="পরীক্ষা না হলে ফাঁকা রাখুন" />
      </label>
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        আর্দ্রতা সনদ নম্বর / রেফারেন্স
        <input value={shipment.moistureCertificate} onChange={(event) => update("moistureCertificate", event.target.value)} className="input input-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm text-stone-900" placeholder="সনদের রেফারেন্স" />
      </label>
      <label className="space-y-1 text-xs font-extrabold text-stone-700">
        ডিজিটাল চালান নম্বর
        <input value={shipment.challanNumber} onChange={(event) => update("challanNumber", event.target.value)} className="input input-bordered min-h-11 w-full rounded-lg border-stone-300 bg-white text-sm text-stone-900" placeholder="যেমন: SB-2026-001" />
      </label>
      {mutation.isError && <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-3">ডিসপ্যাচ আপডেট সংরক্ষণ হয়নি। মান ও কোটেশন রেফারেন্স যাচাই করুন।</p>}
      {mutation.isSuccess && <p role="status" className="text-xs font-bold text-emerald-800 sm:col-span-2 lg:col-span-3">ডিসপ্যাচ তথ্য ট্র্যাকারে আপডেট হয়েছে।</p>}
      <button type="submit" disabled={mutation.isPending} className="btn btn-sm border-none bg-emerald-800 font-bold text-white hover:bg-emerald-900 sm:col-span-2 lg:col-span-3">
        {mutation.isPending ? "সংরক্ষণ হচ্ছে..." : "🚚 ডিসপ্যাচ / গেট তথ্য ট্র্যাকারে সেভ করুন"}
      </button>
      <p className="text-xs leading-relaxed text-stone-600 sm:col-span-2 lg:col-span-3">
        আর্দ্রতার শতাংশ কেবল সনদ রেফারেন্সসহ ট্র্যাকারে পরীক্ষিত দেখাবে। সনদের কাগজ ও প্রকৃত ওজন গেট-এ যাচাই করে লিখুন।
      </p>
    </form>
  );
}

export default function ErpDashboard() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const requestedCropField = location.state?.cropField;
  const [shopModal, setShopModal] = useState(false);
  const [fundModal, setFundModal] = useState(false);
  const [cropModal, setCropModal] = useState(Boolean(requestedCropField));
  const [fundInput, setFundInput] = useState("");
  const [fundEditMode, setFundEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("haat");

  const [shopForm, setShopForm] = useState({ shopId: 1, liters: 40, bill: 9800, paid: 9800 });
  const [cropForm, setCropForm] = useState(() => requestedCropField
    ? { ...blankCropForm, ...requestedCropField }
    : blankCropForm);

  const { data } = useQuery({ queryKey: ["erpData"], queryFn: getErpData });
  const { data: cropFields = [] } = useQuery({ queryKey: ["cropFields"], queryFn: getCropFields });
  const shops = data?.shops || [];
  const haatList = data?.haat || [];
  const directFarm = data?.directFarm || [];
  const milling = data?.milling || [];
  const millTruck = data?.millTruck || [];
  const farmerBookings = data?.farmerBookings || [];
  const industrialQuotes = data?.industrialQuotes || [];
  const fund = data?.fund ?? APP_CONFIG.weeklyHaatBudget;

  const shopMutation = useMutation({
    mutationFn: updateShopLedger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setShopModal(false);
    },
  });

  const fundMutation = useMutation({
    mutationFn: ({ amount, editMode }) => editMode ? saveHaatFund(amount) : addHaatFund(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setFundModal(false);
    },
  });

  const cropFieldMutation = useMutation({
    mutationFn: saveCropField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cropFields"] });
      setCropForm(blankCropForm);
      setCropModal(false);
    },
  });

  const openNewCropField = () => {
    setCropForm(blankCropForm);
    setCropModal(true);
  };

  const totalHaatSpent = haatList.reduce((sum, h) => sum + h.total, 0);
  const remainingCash = fund - totalHaatSpent;
  const totalShopDue = shops.reduce((sum, s) => sum + s.due, 0);
  const shopsWithDue = shops.filter((shop) => shop.due > 0).length;
  const catalogStock = products.reduce((sum, product) => {
    const stock = getCatalogStock(product);
    return {
      maund: sum.maund + (stock.unit === "maund" ? stock.quantity : 0),
      liters: sum.liters + (stock.unit === "liter" ? stock.quantity : 0),
      value: sum.value + stock.value,
    };
  }, { maund: 0, liters: 0, value: 0 });
  const purchasedStock = haatList.reduce((sum, entry) => {
    const itemText = `${entry.productId ?? ""} ${entry.item ?? ""}`.toLowerCase();
    const product = products.find((candidate) =>
      (entry.productId && candidate.id === entry.productId) ||
      itemText.includes(candidate.id) ||
      candidate.name.split(/[ (]/)[0] === String(entry.item ?? "").split(/[ (]/)[0]
    );
    if (!product) return { ...sum, value: sum.value + Number(entry.total || 0) };
    if (product.unitType === "volume") {
      return {
        ...sum,
        liters: sum.liters + Number(entry.liters || entry.maund * 40 || 0),
        value: sum.value + Number(entry.total || 0),
      };
    }
    return {
      ...sum,
      maund: sum.maund + Number(entry.maund || 0),
      value: sum.value + Number(entry.total || 0),
    };
  }, { maund: 0, liters: 0, value: 0 });
  const mustardOilProduct = products.find((product) => product.id === "mustard-oil");
  const shopOilOutflow = shops.reduce((sum, shop) => sum + Number(shop.liters || 0), 0);
  const remainingCatalogLiters = Math.max(0, catalogStock.liters - shopOilOutflow);
  const remainingOilValue = remainingCatalogLiters * ((mustardOilProduct?.wholesalePrice ?? 0) / 20);
  const stockValue = catalogStock.value - catalogStock.liters * (mustardOilProduct?.retailPrice ?? 0) + remainingOilValue + purchasedStock.value;
  const stockMaund = catalogStock.maund + purchasedStock.maund;
  const stockLiters = remainingCatalogLiters + purchasedStock.liters;
  const farmerLoyaltyPool = directFarm.reduce(
    (sum, entry) => sum + (Number(entry.netMaund) || Number(entry.netKg || 0) / 40) * 15,
    0,
  );
  const coreProducts = products.filter((product) => CORE_COMMODITY_IDS.includes(product.id));
  const lowStockProducts = coreProducts.filter((product) => {
    const stock = getCatalogStock(product);
    return stock.unit === "liter" ? stock.quantity <= 100 : stock.quantity <= 30;
  });
  const kaderYield = getMillYield(millTruck, "kader");
  const rafikYield = getMillYield(millTruck, "rafik");
  const openHaatLedger = () => {
    setActiveTab("haat");
    window.setTimeout(() => document.getElementById("haat-purchase")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 md:text-4xl">
            মালিকের ডিজিটাল খাতা ও মিল ERP
          </h1>
          <p className="text-base text-slate-700 lg:text-lg">
            সাপ্তাহিক হাটের ২,০০,০০০৳ তহবিল ও ৭ নিয়মিত দোকানের সরিষার তেল লেজার
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/crop-map" className="btn border border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50">
            <MapPinned className="h-4 w-4" /> লাইভ ফসল ম্যাপ
          </Link>
          <CustomButton variant="gold" onClick={openNewCropField}>
            <PlusCircle className="h-4 w-4" /> নতুন কৃষক ও জমির ফসল
          </CustomButton>
          <CustomButton variant="outline" onClick={() => downloadLedgerCsv({ shops, haat: haatList, directFarm, milling, millTruck, farmerBookings, industrialQuotes, fund })}>
            <Download className="w-4 h-4" /> হিসাব এক্সপোর্ট (CSV)
          </CustomButton>
          <CustomButton variant="gold" onClick={openHaatLedger}>
            <PlusCircle className="w-4 h-4" /> শস্য ক্রয় লিখুন
          </CustomButton>
          <CustomButton variant="primary" onClick={() => setShopModal(true)}>
            <Store className="w-4 h-4" /> ৭ দোকানে তেল এন্ট্রি
          </CustomButton>
        </div>
      </div>

      {/* সামারি কার্ড */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-200 bg-[#FAF7F2] p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1 text-base font-bold text-emerald-800"><Wallet className="w-5 h-5"/> হাটের মোট তহবিল</p>
            <button type="button" onClick={() => { setFundInput(""); setFundEditMode(false); setFundModal(true); }} className="btn btn-xs border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50">+ তহবিল যোগ/এডিট করুন</button>
          </div>
          <p className="mt-2 text-3xl font-black text-stone-900">{formatTaka(fund)}</p>
          <p className="mt-1 text-sm text-stone-600">খরচ হয়েছে: {formatTaka(totalHaatSpent)}</p>
        </div>
        <div className={`rounded-2xl border bg-white p-5 shadow ${remainingCash < 0 ? "border-red-300" : "border-amber-300"}`}>
          <p className="text-base font-semibold text-slate-700">হাতে নগদ বাকি আছে</p>
          <p className={`mt-1 text-3xl font-black ${remainingCash < 0 ? "text-red-600" : "text-emerald-800"}`}>{formatTaka(remainingCash)}</p>
          {remainingCash < 0 && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><AlertTriangle className="h-3.5 w-3.5" />তহবিল ঘাটতি — নতুন তহবিল যোগ করুন</span>}
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow">
          <p className="text-base font-semibold text-slate-700">৭ দোকানে মোট বাকি পাওনা</p>
          <p className="mt-1 text-3xl font-black text-red-600">{formatTaka(totalShopDue)}</p>
          <p className="mt-1 text-sm text-stone-600">{toBanglaNum(shopsWithDue)}টি দোকানে বাকি আছে</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow">
          <p className="flex items-center gap-1 text-base font-semibold text-slate-700"><Package className="h-5 w-5 text-emerald-800" /> গোডাউনে বর্তমান মজুত মূল্য</p>
          <p className="mt-1 text-3xl font-black text-emerald-900">{formatTaka(stockValue)}</p>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">{toBanglaNum(stockMaund.toFixed(1))} মণ · {toBanglaNum(stockLiters.toFixed(1))} লিটার (ক্যাটালগ ও হাট ক্রয়ের আনুমানিক হিসাব)</p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-emerald-900/15 bg-[#FAF7F2] p-5 shadow-sm sm:p-6" aria-labelledby="executive-summary-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold tracking-wide text-emerald-800">দ্রুত সিদ্ধান্তের জন্য</p>
            <h2 id="executive-summary-title" className="text-2xl font-black text-stone-900">📊 ব্যবসার সারসংক্ষেপ ও স্টক অ্যালার্ট</h2>
          </div>
          <p className="text-sm font-semibold text-stone-600">স্টক সতর্কতা: ৩০ মণ / ১০০ লিটারের সমান বা কম</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-600">কাদের আলী মিল • তেল উৎপাদন</p>
            <p className="mt-1 text-2xl font-black text-emerald-900">{toBanglaNum(Number(kaderYield.toFixed(2)))} <span className="text-base">লিটার/মণ</span></p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-600">রফিক মিয়া মিল • তেল উৎপাদন</p>
            <p className="mt-1 text-2xl font-black text-emerald-900">{toBanglaNum(Number(rafikYield.toFixed(2)))} <span className="text-base">লিটার/মণ</span></p>
          </article>
          <article className="rounded-2xl border border-rose-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-600">৭ দোকানে বাকি</p>
            <p className="mt-1 text-2xl font-black text-rose-700">{formatTaka(totalShopDue)}</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-600">কৃষক লয়্যালটি বোনাস পুল</p>
            <p className="mt-1 text-2xl font-black text-amber-900">{formatTaka(farmerLoyaltyPool)}</p>
          </article>
          <article className={`rounded-2xl border p-4 ${lowStockProducts.length ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-white"}`}>
            <p className="text-sm font-bold text-stone-700">১২ মূল পণ্যের কম মজুত</p>
            <p className={`mt-1 text-2xl font-black ${lowStockProducts.length ? "text-amber-900" : "text-emerald-900"}`}>{toBanglaNum(lowStockProducts.length)}টি</p>
            <p className="mt-1 text-sm font-semibold text-stone-700">{lowStockProducts.length ? lowStockProducts.map((product) => product.name.split(" (")[0]).join(" • ") : "পুনরায় মজুতের সতর্কতা নেই"}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-900/15 bg-white p-5 shadow-sm" aria-labelledby="procurement-pipeline-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="procurement-pipeline-title" className="text-xl font-black text-emerald-950">ফসল বুকিং ও শিল্প ক্রয় অনুরোধ</h2>
            <p className="mt-1 text-sm font-medium text-stone-600">ওয়েবসাইটের কৃষক রেট-লক এবং কর্পোরেট কোটেশন অনুরোধ এখানে এসেছে।</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-900">
            {toBanglaNum(farmerBookings.length + industrialQuotes.length)}টি অনুরোধ
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-190 text-left text-base">
            <thead className="bg-[#F3EFE6] text-lg font-black text-stone-900 lg:text-xl">
              <tr className="border-b-2 border-stone-300"><th className="px-5 py-4">ধরন / তারিখ</th><th className="px-5 py-4">কৃষক / প্রতিষ্ঠান</th><th className="px-5 py-4">ফসল / পণ্য</th><th className="px-5 py-4">পরিমাণ</th><th className="px-5 py-4">যোগাযোগ</th><th className="px-5 py-4">অবস্থা</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {[
                ...farmerBookings.map((entry) => ({
                  kind: "farmer",
                  id: entry.id,
                  type: "কৃষক রেট-লক",
                  date: entry.createdAt,
                  name: `${entry.farmerName} • ${entry.village}`,
                  product: entry.cropName,
                  quantity: `${toBanglaNum(entry.estimatedMaund)} মণ`,
                  phone: entry.phone,
                  status: "দর নিশ্চিত করা বাকি",
                })),
                ...industrialQuotes.map((entry) => ({
                  kind: "industrial",
                  quote: entry,
                  id: entry.id,
                  type: "শিল্প কোটেশন",
                  date: entry.createdAt,
                  name: entry.companyName,
                  product: entry.productName,
                  quantity: `${toBanglaNum(entry.totalTons)} টন • ${toBanglaNum(entry.totalMaund)} মণ`,
                  phone: entry.phone,
                  status: ({
                    "quote-requested": "কোটেশন অপেক্ষমাণ",
                    confirmed: "অর্ডার নিশ্চিত",
                    dispatched: "ট্রাক রওনা হয়েছে",
                    delivered: "কারখানার গেটে পৌঁছেছে",
                  })[entry.status] ?? "অবস্থা যাচাই করুন",
                })),
              ].sort((first, second) => String(second.date || "").localeCompare(String(first.date || ""))).map((entry) => (
                <Fragment key={entry.id}>
                  <tr className="bg-white transition-colors hover:bg-amber-50/60">
                    <td className="px-5 py-5 text-base font-bold text-stone-700 lg:text-lg">{entry.type}<span className="block text-base font-semibold text-stone-600">{entry.date ? new Date(entry.date).toLocaleDateString("bn-BD") : "তারিখ নেই"}</span></td>
                    <td className="px-5 py-5 text-lg font-black text-stone-900">{entry.name}</td>
                    <td className="px-5 py-5 text-lg font-bold text-stone-800">{entry.product}</td>
                    <td className="px-5 py-5 text-lg font-extrabold text-amber-900">{entry.quantity}</td>
                    <td className="px-5 py-5 text-lg"><a className="font-bold text-emerald-800 underline" href={`tel:${entry.phone}`}>{entry.phone}</a></td>
                    <td className="px-5 py-5"><span className={`rounded-full px-2.5 py-1 text-base font-bold ${entry.status === "ট্রাক রওনা হয়েছে" || entry.status === "কারখানার গেটে পৌঁছেছে" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{entry.status}</span></td>
                  </tr>
                  {entry.kind === "industrial" && (
                    <tr>
                      <td colSpan="6" className="px-3 pb-4">
                        <IndustrialShipmentEditor quote={entry.quote} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!farmerBookings.length && !industrialQuotes.length && <tr><td colSpan="6" className="p-6 text-center font-semibold text-stone-500">এখনও কোনো অগ্রিম বুকিং বা শিল্প কোটেশন আসেনি।</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recharts গ্রাফ: ৭ দোকানের নগদ জমা বনাম বাকি */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-amber-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-extrabold text-emerald-950">
          ৭ নিয়মিত দোকানের সরিষার তেল বিল ও বাকি বিশ্লেষণ
        </h2>
        <div className="h-72 min-w-0 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={shops}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="owner" />
              <YAxis tickFormatter={(value) => formatTaka(value)} width={88} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const shop = shops.find((item) => item.owner === label);
                  return (
                    <div className="rounded-xl border border-stone-200 bg-white p-3 text-sm shadow-lg">
                      <p className="mb-1 font-extrabold text-stone-900">{label}</p>
                      <p>মোট বিল: <strong>{formatTaka(shop?.totalBill ?? 0)}</strong></p>
                      <p className="text-emerald-800">নগদ জমা: <strong>{formatTaka(shop?.paid ?? 0)}</strong></p>
                      <p className="text-amber-800">বাকি পাওনা: <strong>{formatTaka(shop?.due ?? 0)}</strong></p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="paid" name="নগদ জমা (৳)" fill="#064e3b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="due" name="বাকি পাওনা (৳)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2" role="tablist" aria-label="ERP হিসাব বিভাগ">
        {[
          ["haat", "শস্য ক্রয় লেজার"],
          ["shops", "৭ দোকানে তেল বাকি"],
          ["mill", "⚙️ নিজস্ব মিলিং ও লাভ-ক্ষতি"],
          ["mill-truck", "🏭 ২ মিলের সরিষা ও ট্রাক ট্র্যাকার"],
        ].map(([tab, label]) => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`btn min-h-12 px-4 text-base ${activeTab === tab ? "border-emerald-800 bg-emerald-800 text-white" : "border-stone-300 bg-white text-stone-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "haat" && <HaatPurchaseTab haatList={haatList} directFarmList={directFarm} />}
      {activeTab === "shops" && (
        <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white shadow-md">
          <div className="border-b border-stone-200 bg-amber-50 p-4 font-bold text-emerald-950">
            ৭ নিয়মিত দোকানের তেল সরবরাহ ও বাকি লেজার (হাবিল, সাহেবআলী, সর্বেশ, সোনামিয়া, সোবেদআলী, আয়বুল্লা, কামরুল)
          </div>
          <table className="table w-full text-base [&_tbody_td]:border-b [&_tbody_td]:border-stone-200 [&_tbody_td]:px-5 [&_tbody_td]:py-5 [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-amber-50/60 [&_thead_th]:border-b-2 [&_thead_th]:border-stone-300 [&_thead_th]:bg-[#F3EFE6] [&_thead_th]:px-5 [&_thead_th]:py-4 [&_thead_th]:text-lg [&_thead_th]:font-black [&_thead_th]:text-stone-900 lg:[&_thead_th]:text-xl">
            <thead><tr><th>দোকান ও মালিক</th><th>সরিষার তেল (লিটার)</th><th>মোট বিল</th><th>নগদ জমা</th><th>বর্তমান বাকি</th></tr></thead>
            <tbody>{shops.map((s) => (
              <tr key={s.id} className="bg-white transition-colors hover:bg-amber-50/60">
                <td className="text-lg font-black text-stone-900">{s.name} ({s.owner})</td>
                <td className="text-lg font-extrabold text-amber-900">{toBanglaNum(s.liters)} লিটার</td>
                <td className="text-xl font-black text-emerald-900">{formatTaka(s.totalBill)}</td>
                <td className="text-lg font-bold text-green-800">{formatTaka(s.paid)}</td>
                <td className={`text-lg font-black ${s.due > 0 ? "text-red-700" : "text-green-800"}`}>{formatTaka(s.due)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {activeTab === "mill" && <MillProfitTab entries={milling} haatList={haatList} shops={shops} />}
      {activeTab === "mill-truck" && <MillTruckLedgerTab entries={millTruck} />}

      <CustomModal
        isOpen={cropModal}
        onClose={() => setCropModal(false)}
        title="নতুন কৃষক ও জমির ফসল যোগ / আপডেট"
        panelClassName={erpModalPanelClass}
        titleClassName={erpModalTitleClass}
      >
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-base font-extrabold text-stone-800 lg:text-lg">আগের মাঠের তথ্য সম্পাদনা করুন</p>
            <button type="button" onClick={openNewCropField} className="btn min-h-11 border-emerald-800 bg-white px-4 py-2 text-base font-extrabold text-emerald-900 hover:bg-emerald-50 lg:text-lg">+ নতুন রেকর্ড</button>
          </div>
          <div className="flex max-h-48 flex-wrap items-start gap-3 overflow-y-auto rounded-2xl border border-stone-300 bg-white p-3 pb-4">
            {cropFields.map((field) => (
              <button
                key={field.id}
                type="button"
                onClick={() => { setCropForm({ ...blankCropForm, ...field }); cropFieldMutation.reset(); }}
                className={farmerPresetClassName(cropForm.id === field.id)}
              >
                {field.farmerName} • {field.village} • {field.crop}
              </button>
            ))}
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            cropFieldMutation.mutate(cropForm);
          }}
          className="max-h-[54vh] space-y-5 overflow-y-auto pr-1 sm:space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            <label className={erpModalLabelClass}>
              কৃষকের নাম *
              <input className={erpModalInputClass} required value={cropForm.farmerName} onChange={(event) => setCropForm({ ...cropForm, farmerName: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              মোবাইল নম্বর
              <input className={erpModalInputClass} type="tel" inputMode="tel" value={cropForm.phone} onChange={(event) => setCropForm({ ...cropForm, phone: event.target.value })} placeholder="01XXXXXXXXX" />
            </label>
            <label className={erpModalLabelClass}>
              গ্রাম / পাড়া *
              <input className={erpModalInputClass} required value={cropForm.village} onChange={(event) => setCropForm({ ...cropForm, village: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              ইউনিয়ন / এলাকা
              <input className={erpModalInputClass} value={cropForm.union} onChange={(event) => setCropForm({ ...cropForm, union: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              বর্তমান ফসল *
              <select className={erpModalSelectClass} value={cropForm.crop} onChange={(event) => setCropForm({ ...cropForm, crop: event.target.value })}>
                {CROP_OPTIONS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
              </select>
            </label>
            <label className={erpModalLabelClass}>
              জাত / ধরন
              <input className={erpModalInputClass} value={cropForm.variety} onChange={(event) => setCropForm({ ...cropForm, variety: event.target.value })} placeholder="যেমন: বারি সরিষা-১৪" />
            </label>
            <label className={erpModalLabelClass}>
              কৃষি মৌসুম *
              <select className={erpModalSelectClass} value={cropForm.season} onChange={(event) => setCropForm({ ...cropForm, season: event.target.value })}>
                <option value="rabi">❄️ রবি মৌসুম</option>
                <option value="kharif1">☀️ খরিফ-১ মৌসুম</option>
                <option value="kharif2">🌧️ খরিফ-২ মৌসুম</option>
              </select>
              <span className="block text-sm font-semibold text-stone-600 lg:text-base">
                {cropForm.season === "rabi" && "সরিষা, গম, ভুট্টা, কালোজিরা ও খেসারি"}
                {cropForm.season === "kharif1" && "পাট, তিল ও ধান"}
                {cropForm.season === "kharif2" && "আমন ধান ও মাষকলাই"}
              </span>
            </label>
            <label className={erpModalLabelClass}>
              ফসলের বর্তমান অবস্থা *
              <select className={erpModalSelectClass} value={cropForm.status} onChange={(event) => setCropForm({ ...cropForm, status: event.target.value })}>
                {CROP_STATUS_OPTIONS.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
              </select>
            </label>
            <label className={erpModalLabelClass}>
              জমির পরিমাণ (বিঘা) *
              <input className={erpModalInputClass} type="number" min="0.1" step="0.1" required value={cropForm.areaBigha} onChange={(event) => setCropForm({ ...cropForm, areaBigha: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              সম্ভাব্য উৎপাদন (মণ) *
              <input className={erpModalInputClass} type="number" min="0" step="0.1" required value={cropForm.estimatedMaund} onChange={(event) => setCropForm({ ...cropForm, estimatedMaund: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              গোলায় বিক্রয়যোগ্য মজুত (মণ)
              <input className={erpModalInputClass} type="number" min="0" step="0.1" value={cropForm.stockMaund} onChange={(event) => setCropForm({ ...cropForm, stockMaund: event.target.value })} />
            </label>
            <label className={erpModalLabelClass}>
              এই সপ্তাহে কাটা হচ্ছে (মণ)
              <input className={erpModalInputClass} type="number" min="0" step="0.1" value={cropForm.weeklyHarvestMaund} onChange={(event) => setCropForm({ ...cropForm, weeklyHarvestMaund: event.target.value })} />
            </label>
          </div>
          {cropFieldMutation.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">ফসলের রেকর্ড সেভ করা যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।</p>}
          <button type="submit" disabled={cropFieldMutation.isPending} className="btn mt-4 min-h-16 w-full rounded-2xl border-none bg-emerald-800 py-4 text-xl font-black text-white shadow-lg hover:bg-emerald-900 lg:text-2xl">
            {cropFieldMutation.isPending ? "সেভ হচ্ছে..." : cropForm.id ? "কৃষক ও জমির তথ্য আপডেট করুন" : "নতুন কৃষকের জমি সেভ করুন"}
          </button>
        </form>
      </CustomModal>

      {/* ৭ দোকানে তেল ডেলিভারি মডাল */}
      <CustomModal isOpen={shopModal} onClose={() => setShopModal(false)} title="দোকানে সরিষার তেল ডেলিভারি ও জমা" panelClassName={erpModalPanelClass} titleClassName={erpModalTitleClass}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            shopMutation.mutate(shopForm);
          }}
          className="grid gap-4 sm:grid-cols-2 sm:gap-5"
        >
          <label className={erpModalLabelClass}>
            দোকান ও মালিক
            <select className={erpModalSelectClass} value={shopForm.shopId} onChange={(e) => setShopForm({ ...shopForm, shopId: e.target.value })}>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.owner})</option>)}
            </select>
          </label>
          <label className={erpModalLabelClass}>
            সরবরাহ করা তেল (লিটার)
            <input type="number" className={erpModalInputClass} value={shopForm.liters} onChange={(e) => setShopForm({ ...shopForm, liters: e.target.value, bill: e.target.value * 245 })} required />
          </label>
          <label className={erpModalLabelClass}>
            মোট বিল (৳)
            <input type="number" className={erpModalInputClass} value={shopForm.bill} onChange={(e) => setShopForm({ ...shopForm, bill: e.target.value })} required />
          </label>
          <label className={erpModalLabelClass}>
            নগদ জমা (৳)
            <input type="number" className={erpModalInputClass} value={shopForm.paid} onChange={(e) => setShopForm({ ...shopForm, paid: e.target.value })} required />
          </label>
          <CustomButton type="submit" variant="primary" className="min-h-16 w-full rounded-2xl text-lg font-black sm:col-span-2">লেজার আপডেট করুন</CustomButton>
        </form>
      </CustomModal>

      <CustomModal isOpen={fundModal} onClose={() => setFundModal(false)} title="হাট তহবিল যোগ / সম্পাদনা" panelClassName={erpModalPanelClass} titleClassName={erpModalTitleClass}>
        <form onSubmit={(event) => { event.preventDefault(); fundMutation.mutate({ amount: Number(fundInput), editMode: fundEditMode }); }} className="space-y-5">
          <p className="text-base leading-relaxed text-stone-700 lg:text-lg">বর্তমান হাট তহবিল {formatTaka(fund)}। {fundEditMode ? "মোট নতুন তহবিলের পরিমাণ লিখুন।" : "যত টাকা যোগ করতে চান তা লিখুন।"}</p>
          <label className={erpModalLabelClass}>
            {fundEditMode ? "মোট তহবিল (৳)" : "নতুন জমা (৳)"}
            <input autoFocus className={erpModalInputClass} type="number" min={fundEditMode ? "0" : "1"} step="1" required value={fundInput} onChange={(event) => setFundInput(event.target.value)} />
          </label>
          {fundMutation.isError && <p role="alert" className="text-base font-semibold text-red-700">তহবিল সেভ করা যায়নি। আবার চেষ্টা করুন।</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFundModal(false)} className="btn min-h-12 rounded-xl px-4 text-base font-bold text-stone-700">বাতিল</button>
            <button type="button" onClick={() => { setFundEditMode((editing) => !editing); setFundInput(fundEditMode ? "" : String(fund)); }} className="btn min-h-12 rounded-xl border-stone-300 px-4 text-base font-bold">
              {fundEditMode ? "জমা যোগে ফিরুন" : "মোট তহবিল সম্পাদনা"}
            </button>
            <button type="submit" disabled={fundMutation.isPending} className="btn min-h-12 rounded-xl border-none bg-emerald-800 px-4 text-base font-extrabold text-white hover:bg-emerald-900">{fundMutation.isPending ? "সেভ হচ্ছে..." : fundEditMode ? "মোট তহবিল সেভ" : "তহবিল যোগ করুন"}</button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}