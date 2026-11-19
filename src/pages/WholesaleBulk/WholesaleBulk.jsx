import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Tractor,
  Store,
  FileText,
  Send,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../../services/productService";
import { APP_CONFIG } from "../../constants/appConfig";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";
import { maundToTon, maundToKg } from "../../utils/unitConverter";
import { matchesSupplyModel, SUPPLY_MODEL_FILTERS } from "../../utils/businessModels";
import CustomButton from "../../common/Button/CustomButton";
import FarmFeedCalculator from "../../components/home/FarmFeedCalculator";
import IndustrialSupplyDesk from "../../components/wholesale/IndustrialSupplyDesk";
import MarketTrendBoard from "../../components/shared/MarketTrendBoard";

export default function WholesaleBulk() {
  const [selectedProduct, setSelectedProduct] = useState("maize-vutta");
  const [supplyModel, setSupplyModel] = useState("all");
  const [maundQty, setMaundQty] = useState(50); // ৫০ মণ = ২ টন
  const [buyerInfo, setBuyerInfo] = useState({
    buyerType: "গবাদিপশুর খামারি (গোখাদ্য)",
    organization: "",
    contactPerson: "",
    phone: "",
    address: "",
    deliveryDate: "",
    notes: "",
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "all", ""],
    queryFn: () => fetchProducts({ category: "all", search: "" }),
  });

  const modelProducts = products.filter((product) => matchesSupplyModel(product, supplyModel));
  const activeProduct =
    modelProducts.find((p) => p.id === selectedProduct) || modelProducts[0] || products[0] || {
      name: "শুকনো দানা ভুট্টা (খামারি গোখাদ্য)",
      wholesalePrice: 1440,
      wholesaleUnit: "মণ (৪০ কেজি)",
    };

  const totalKg = maundToKg(maundQty);
  const totalTon = maundToTon(maundQty);
  const baseTotal = activeProduct.wholesalePrice * maundQty;
  // ২ টন (৫০ মণ) বা তার বেশি অর্ডারে অতিরিক্ত ২% পাইকারি ছাড়
  const bulkDiscount = maundQty >= 50 ? Math.round(baseTotal * 0.02) : 0;
  const finalPayable = baseTotal - bulkDiscount;

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!buyerInfo.contactPerson || !buyerInfo.phone || !buyerInfo.address) {
      alert("দয়া করে নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।");
      return;
    }

    const message =
      `*🚛 ${APP_CONFIG.brandName} — পাইকারি ও টেন্ডার কোটেশন*%0A` +
      `ক্রেতার ধরন: ${buyerInfo.buyerType}%0A` +
      `প্রতিষ্ঠান/খামার: ${buyerInfo.organization || "প্রযোজ্য নয়"}%0A` +
      `যোগাযোগকারী: ${buyerInfo.contactPerson}%0A` +
      `মোবাইল: ${buyerInfo.phone}%0A` +
      `ঠিকানা: ${buyerInfo.address}%0A` +
      `------------------------%0A` +
      `পণ্য: ${activeProduct.name}%0A` +
      `পরিমাণ: ${toBanglaNum(maundQty)} মণ (${toBanglaNum(totalKg)} কেজি / ${toBanglaNum(totalTon)} টন)%0A` +
      `মোট মূল্য: ${formatTaka(baseTotal)}%0A` +
      `বাল্ক ছাড়: -${formatTaka(bulkDiscount)}%0A` +
      `*সর্বমোট প্রদেয়: ${formatTaka(finalPayable)}*%0A` +
      `নোট: ${buyerInfo.notes || "নেই"}`;

    window.open(
      `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="w-full space-y-10 px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      {/* হেডার সেকশন */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-stone-200/90 bg-linear-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#EAE5D9] p-8 text-stone-900 shadow-sm lg:p-12"
      >
        <span className="badge mb-3 border border-amber-300 bg-amber-100 px-4 py-3 text-base font-bold text-amber-950 lg:text-lg">
          B2B পাইকারি, খামারি ও সরকারি সরবরাহ পোর্টাল
        </span>
        <h1 className="text-4xl font-black leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
          মণ ও টন হিসেবে সরাসরি{" "}
          <span className="text-emerald-800">মিল ও হাটের পাইকারি অর্ডার</span>
        </h1>
        <p className="mt-3 max-w-3xl text-xl leading-relaxed text-stone-700 lg:text-2xl">
          গবাদিপশুর খামারের জন্য ভুট্টা, গম ও খাঁটি সরিষার খৈল, সরকারি অফিসের জন্য উচ্চফলনশীল ধানের বীজ এবং খুচরা দোকানের জন্য নিজস্ব মিলের খাঁটি সরিষার তেল সরাসরি অর্ডার করুন।
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <Tractor className="mb-2 h-10 w-10 rounded-xl bg-emerald-50 p-2 text-emerald-800" />
            <h3 className="text-xl font-extrabold text-stone-900">খামারি গোখাদ্য পাইকারি</h3>
            <p className="mt-1 text-base text-stone-600">
              ভুট্টা, গম ও সরিষার খৈলে ৫০ মণ+ অর্ডারে বিশেষ ছাড়
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <Building2 className="mb-2 h-10 w-10 rounded-xl bg-emerald-50 p-2 text-emerald-800" />
            <h3 className="text-xl font-extrabold text-stone-900">সরকারি অফিস বীজ সরবরাহ</h3>
            <p className="mt-1 text-base text-stone-600">
              মৌসুমি ধানের বীজ ও ক্যাশ মেমোসহ প্রাতিষ্ঠানিক ডেলিভারি
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <Store className="mb-2 h-10 w-10 rounded-xl bg-emerald-50 p-2 text-emerald-800" />
            <h3 className="text-xl font-extrabold text-stone-900">পাইকারি দোকান সরবরাহ</h3>
            <p className="mt-1 text-base text-stone-600">
              সপ্তাহে ২ বার ভাঙানো খাঁটি সরিষার তেল ও চাল-ডাল
            </p>
          </div>
        </div>
      </motion.div>

      <MarketTrendBoard />

      {/* মেইন গ্রিড: বামে ক্যালকুলেটর, ডানে কোটেশন ফর্ম */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* বাম পাশ: মণ/টন ক্যালকুলেটর */}
        <div className="h-fit space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-md lg:col-span-5">
        <div className="flex items-center gap-2 border-b border-amber-100 pb-3 text-2xl font-bold text-emerald-950">
          <Scale className="h-6 w-6 text-amber-700" /> পাইকারি ওজন ও দর হিসাব
          </div>

          <div>
            <label className="label text-base font-semibold text-emerald-950 lg:text-lg">
              সরবরাহ মডেল
            </label>
            <select
              className="select select-bordered min-h-14 w-full border-stone-300 bg-[#FAF7F2] px-4 py-3 text-base font-semibold lg:text-lg"
              value={supplyModel}
              onChange={(event) => {
                const nextModel = event.target.value;
                const nextProducts = products.filter((product) => matchesSupplyModel(product, nextModel));
                setSupplyModel(nextModel);
                if (!nextProducts.some((product) => product.id === selectedProduct) && nextProducts[0]) {
                  setSelectedProduct(nextProducts[0].id);
                }
              }}
            >
              <option value="all">সব সরবরাহ মডেল</option>
              {SUPPLY_MODEL_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>{filter.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-base font-semibold text-emerald-950 lg:text-lg">
              পণ্য নির্বাচন করুন
            </label>
            <select
              className="select select-bordered min-h-14 w-full border-stone-300 bg-[#FAF7F2] px-4 py-3 text-base font-semibold lg:text-lg"
              value={activeProduct.id || ""}
              onChange={(event) => setSelectedProduct(event.target.value)}
            >
              {modelProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatTaka(p.wholesalePrice)} / {p.wholesaleUnit}
                </option>
              ))}
            </select>
            {activeProduct.businessModel && (
              <p className="mt-2 text-sm font-semibold text-emerald-800 lg:text-base">
                মডেল: {activeProduct.businessModel} • {activeProduct.modelLabel || activeProduct.businessModelLabel}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex justify-between text-base font-bold lg:text-lg">
              <span>পরিমাণ (মণ হিসেবে):</span>
              <span className="text-xl font-extrabold text-amber-700">
                {toBanglaNum(maundQty)} মণ ({toBanglaNum(totalTon)} টন)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={maundQty}
              onChange={(e) => setMaundQty(Number(e.target.value))}
              className="range range-warning"
            />
            <div className="mt-1 flex justify-between text-base text-slate-600">
              <span>৫ মণ</span>
              <span>৫০ মণ (২ টন)</span>
              <span>২৫০ মণ (১০ টন)</span>
            </div>
            <FarmFeedCalculator />
          </div>

          {/* হিসাবের সারসংক্ষেপ */}
          <div className="space-y-2 rounded-2xl border border-stone-200 bg-[#FAF7F2] p-4 text-lg">
            <div className="flex justify-between">
              <span className="text-slate-700">মোট ওজন:</span>
              <span className="font-bold">
                {toBanglaNum(totalKg)} কেজি ({toBanglaNum(totalTon)} টন)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">পাইকারি দর:</span>
              <span className="font-bold">
                {formatTaka(activeProduct.wholesalePrice)} / {activeProduct.wholesaleUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">মোট মূল্য:</span>
              <span className="font-bold">{formatTaka(baseTotal)}</span>
            </div>
            {bulkDiscount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>৫০ মণ+ বিশেষ পাইকারি ছাড় (২%):</span>
                <span>-{formatTaka(bulkDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-amber-300 pt-2 text-xl font-extrabold text-emerald-950">
              <span>সর্বমোট প্রদেয়:</span>
              <span>{formatTaka(finalPayable)}</span>
            </div>
          </div>

          {maundQty >= 50 && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-base font-semibold text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              অভিনন্দন! ২ টন বা তার বেশি অর্ডারে ২% অতিরিক্ত পাইকারি ছাড় যুক্ত হয়েছে।
            </div>
          )}
        </div>

        {/* ডান পাশ: প্রাতিষ্ঠানিক ও পাইকারি অর্ডার ফর্ম */}
        <form
          onSubmit={handleBulkSubmit}
          className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-md md:p-8 lg:col-span-7"
        >
          <div className="flex items-center gap-2 border-b border-amber-100 pb-3 text-2xl font-bold text-emerald-950">
            <FileText className="h-6 w-6 text-amber-700" /> পাইকারি / টেন্ডার অর্ডার তথ্য
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-base font-medium">ক্রেতা / প্রতিষ্ঠানের ধরন</label>
              <select
                className="select select-bordered min-h-14 w-full px-4 py-3 text-base font-semibold"
                value={buyerInfo.buyerType}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, buyerType: e.target.value })
                }
              >
                <option>গবাদিপশুর খামারি (গোখাদ্য)</option>
                <option>সরকারি অফিস (ধানের বীজ সরবরাহ)</option>
                <option>পাইকারি দোকানদার (সরিষার তেল ও শস্য)</option>
                <option>আড়তদার / মিলার</option>
              </select>
            </div>
            <div>
              <label className="label text-base font-medium">
                খামার / অফিস / দোকানের নাম
              </label>
              <input
                type="text"
                className="input input-bordered min-h-14 w-full px-4 py-3 text-base"
                placeholder="যেমন: মদিনা ডেইরি ফার্ম / কৃষি অফিস"
                value={buyerInfo.organization}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, organization: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-base font-medium">যোগাযোগকারীর নাম *</label>
              <input
                type="text"
                required
                className="input input-bordered min-h-14 w-full px-4 py-3 text-base"
                placeholder="আপনার পূর্ণ নাম"
                value={buyerInfo.contactPerson}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, contactPerson: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label text-base font-medium">মোবাইল নম্বর *</label>
              <input
                type="tel"
                required
                className="input input-bordered min-h-14 w-full px-4 py-3 text-base"
                placeholder="017XXXXXXXX"
                value={buyerInfo.phone}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-base font-medium">ডেলিভারি ঠিকানা *</label>
              <input
                type="text"
                required
                className="input input-bordered min-h-14 w-full px-4 py-3 text-base"
                placeholder="গ্রাম / বাজার / উপজেলা"
                value={buyerInfo.address}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, address: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label text-base font-medium">সম্ভাব্য ডেলিভারির তারিখ</label>
              <input
                type="date"
                className="input input-bordered min-h-14 w-full px-4 py-3 text-base"
                value={buyerInfo.deliveryDate}
                onChange={(e) =>
                  setBuyerInfo({ ...buyerInfo, deliveryDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="label text-base font-medium">
              অতিরিক্ত নির্দেশনা (বস্তা প্যাকিং বা মেমো সংক্রান্ত)
            </label>
            <textarea
              rows="2"
              className="textarea textarea-bordered w-full px-4 py-3 text-base"
              placeholder="যেমন: ৫০ কেজির বস্তায় প্যাকিং লাগবে অথবা অফিসিয়াল ক্যাশ মেমো প্রয়োজন..."
              value={buyerInfo.notes}
              onChange={(e) =>
                setBuyerInfo({ ...buyerInfo, notes: e.target.value })
              }
            ></textarea>
          </div>

          <CustomButton type="submit" variant="primary" className="bg-emerald-800! h-auto min-h-14 w-full py-3.5 text-lg font-semibold hover:bg-emerald-900!">
            <Send className="w-4 h-4" /> WhatsApp-এ পাইকারি কোটেশন ও অর্ডার পাঠান
          </CustomButton>
        </form>
      </div>
      <IndustrialSupplyDesk products={products} />
    </div>
  );
}