import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Wallet } from "lucide-react";
import CustomButton from "../Button/CustomButton";
import { formatTaka } from "../../utils/formatBanglaNumber";
import {
  calculateBillFromUnits,
  calculateQuantityForBudget,
} from "../../utils/unitConverter";

const productVisuals = {
  "mustard-oil": { emoji: "🫙", label: "ঘানিভাঙা সরিষার তেল", colors: "from-yellow-100 via-amber-50 to-orange-100" },
  "mustard-cake": { emoji: "🌾", label: "মিলের সরিষার খৈল", colors: "from-lime-100 via-amber-50 to-yellow-100" },
  "yellow-mustard": { emoji: "🌼", label: "দেশি সরিষার দানা", colors: "from-yellow-100 via-amber-50 to-orange-100" },
  "sesame-til": { emoji: "🫘", label: "বাছাইকৃত তিল", colors: "from-stone-100 via-amber-50 to-orange-100" },
  "miniket-chal": { emoji: "🍚", label: "নিজস্ব মিলের চাল", colors: "from-stone-100 via-white to-amber-100" },
  "wheat-gom": { emoji: "🌾", label: "দেশি গম ও আটা", colors: "from-amber-100 via-yellow-50 to-orange-100" },
  "maize-vutta": { emoji: "🌽", label: "শুকনো দানা ভুট্টা", colors: "from-yellow-100 via-lime-50 to-amber-100" },
  "pulses-mix": { emoji: "🫘", label: "দেশি ডাল", colors: "from-rose-100 via-orange-50 to-amber-100" },
  "paddy-seed": { emoji: "🌱", label: "উচ্চফলনশীল ধানের বীজ", colors: "from-green-100 via-lime-50 to-yellow-100" },
  "seasonal-veg": { emoji: "🥬", label: "স্থানীয় কৃষকের ফসল", colors: "from-green-100 via-lime-50 to-emerald-100" },
  "pure-milk": { emoji: "🥛", label: "খামারের খাঁটি দুধ", colors: "from-sky-100 via-white to-blue-100" },
};

export default function ProductCard({ product, onAdd }) {
  const [quantity, setQuantity] = useState({
    maund: 0,
    kg: 1,
    liters: 1,
    jars: 0,
    budget: 1000,
  });
  const [budgetMode, setBudgetMode] = useState(false);
  const isWeight = product.unitType === "weight";
  const isJarProduct = Boolean(product.jarSize);
  const unitName = isWeight ? "কেজি" : "লিটার";
  const bill = budgetMode
    ? calculateQuantityForBudget(product, quantity.budget)
    : calculateBillFromUnits(product, quantity);
  const hasQuantity = bill.quantity > 0 && bill.calculatedTotal > 0;
  const presets = isWeight
    ? [
        { label: "৫ কেজি", values: { kg: 5 } },
        { label: "২০ কেজি (আধা মণ)", values: { kg: 20 } },
        { label: "১ মণ", values: { maund: 1 } },
        { label: "৫ মণ", values: { maund: 5 } },
        { label: "১০ মণ", values: { maund: 10 } },
      ]
    : isJarProduct
      ? [
          { label: "১ লিটার", values: { liters: 1 } },
          { label: "৫ লিটার", values: { liters: 5 } },
          { label: "১৫ লিটার জার", values: { liters: 15 } },
          { label: `${product.jarSize} লিটার জার`, values: { jars: 1 } },
        ]
      : [
          { label: "১ লিটার", values: { liters: 1 } },
          { label: "৫ লিটার", values: { liters: 5 } },
          { label: "২০ লিটার", values: { liters: 20 } },
          { label: "১ মণ", values: { liters: product.maundToLiters || 40 } },
        ];

  const setUnits = (values) => {
    setBudgetMode(false);
    setQuantity((current) => ({
      ...current,
      maund: 0,
      kg: 0,
      liters: 0,
      jars: 0,
      ...values,
    }));
  };

  const updateUnit = (name, value) => {
    setBudgetMode(false);
    setQuantity((current) => ({ ...current, [name]: value }));
  };

  const visual = productVisuals[product.id] ?? {
    emoji: "🌾",
    label: product.category,
    colors: "from-amber-100 via-yellow-50 to-lime-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-900 shadow-sm transition-all hover:shadow-xl"
    >
      <div className={`relative h-44 overflow-hidden bg-linear-to-br ${visual.colors}`}>
        <div aria-hidden="true" className="absolute -right-8 -top-12 h-44 w-44 rounded-full border-24 border-white/40" />
        <div aria-hidden="true" className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/40 blur-xl" />
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-bold text-emerald-950 shadow-sm lg:text-base">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" /> ১০০% খাঁটি
        </span>
        <span className="absolute right-3 top-3 z-10 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-sm font-bold text-slate-800 shadow-sm lg:text-base">
          মজুত: {product.stock}
        </span>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center">
            <span aria-hidden="true" className="text-7xl drop-shadow-sm transition-transform duration-500 group-hover:scale-105">
              {visual.emoji}
            </span>
            <span className="mt-1 rounded-full bg-white/75 px-3 py-1 text-sm font-bold text-slate-700 backdrop-blur-sm">
              {visual.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="min-h-14">
          <h3 className="line-clamp-2 text-2xl font-black leading-snug text-slate-900 lg:text-[26px]">{product.name}</h3>
          <p className="mt-1 text-base font-medium text-stone-600">উৎস: {product.origin}</p>
          {product.businessModel && (
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-emerald-800" title={product.businessModelLabel}>
              মডেল: {product.businessModel} • {product.modelLabel || product.businessModelLabel?.replace(`${product.businessModel} `, "").replace(/[()]/g, "")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-slate-800">পরিমাণ বেছে নিন</p>
            <button
              type="button"
              onClick={() => setBudgetMode((enabled) => !enabled)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-base font-bold transition-colors ${
                budgetMode
                  ? "bg-emerald-950 text-white"
                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              টাকা অনুযায়ী
            </button>
          </div>

          {budgetMode ? (
            <label className="block text-base font-bold text-slate-600">
              বাজেট (৳)
              <input
                type="number"
                min="1"
                step="1"
                inputMode="decimal"
                value={quantity.budget}
                onChange={(event) =>
                  setQuantity((current) => ({
                    ...current,
                    budget: event.target.value,
                  }))
                }
                className="input mt-1 min-h-12 w-full border-stone-300 bg-white py-2.5 text-lg font-extrabold text-slate-900 lg:text-xl"
                aria-label={`${product.name} কেনার বাজেট`}
              />
            </label>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setUnits(preset.values)}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-emerald-950 transition-colors hover:bg-amber-100 lg:text-base"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {isWeight ? (
                  <>
                    <label className="text-base font-bold text-slate-600">
                      মণ
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={quantity.maund}
                        onChange={(event) => updateUnit("maund", event.target.value)}
                        className="input mt-1 min-h-12 w-full border-stone-300 bg-white py-2.5 text-lg font-extrabold text-slate-900 lg:text-xl"
                        aria-label={`${product.name} মণের পরিমাণ`}
                      />
                    </label>
                    <label className="text-base font-bold text-slate-600">
                      কেজি
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        inputMode="decimal"
                        value={quantity.kg}
                        onChange={(event) => updateUnit("kg", event.target.value)}
                        className="input mt-1 min-h-12 w-full border-stone-300 bg-white py-2.5 text-lg font-extrabold text-slate-900 lg:text-xl"
                        aria-label={`${product.name} কেজির পরিমাণ`}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    {isJarProduct && (
                      <label className="text-base font-bold text-slate-600">
                        জার ({product.jarSize} লিটার)
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="decimal"
                          value={quantity.jars}
                          onChange={(event) => updateUnit("jars", event.target.value)}
                          className="input mt-1 min-h-12 w-full border-stone-300 bg-white py-2.5 text-lg font-extrabold text-slate-900 lg:text-xl"
                          aria-label={`${product.name} জারের সংখ্যা`}
                        />
                      </label>
                    )}
                    <label className="text-base font-bold text-slate-600">
                      {isJarProduct ? "অতিরিক্ত লিটার" : "লিটার"}
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        inputMode="decimal"
                        value={quantity.liters}
                        onChange={(event) => updateUnit("liters", event.target.value)}
                        className="input mt-1 min-h-12 w-full border-stone-300 bg-white py-2.5 text-lg font-extrabold text-slate-900 lg:text-xl"
                        aria-label={`${product.name} লিটারের পরিমাণ`}
                      />
                    </label>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-bold text-slate-600">মোট পরিমাণ</span>
            {bill.appliedRateType === "wholesale" && hasQuantity && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-sm font-bold text-green-800">
                পাইকারি রেট প্রযোজ্য!
              </span>
            )}
          </div>
          <p className="text-base font-bold text-emerald-950">
            {hasQuantity ? bill.unitLabel : `পরিমাণ লিখুন (${unitName})`}
          </p>
          {hasQuantity && (
            <p className="text-sm text-slate-600">
              পূর্ণ {isJarProduct ? "জার/মণ" : "মণ"} পাইকারি দরে, অতিরিক্ত {unitName} খুচরা দরে
            </p>
          )}
          <div className="flex items-center justify-between border-t border-emerald-200 pt-2">
            <span className="text-lg font-bold text-slate-700">মোট বিল</span>
            <span className="text-3xl font-black text-emerald-950 lg:text-4xl">
              {formatTaka(hasQuantity ? bill.calculatedTotal : 0)}
            </span>
          </div>
        </div>

        <CustomButton
          variant={bill.appliedRateType === "wholesale" ? "gold" : "primary"}
          className="w-full py-3.5 text-lg font-extrabold"
          disabled={!hasQuantity}
          onClick={() => onAdd(product, bill)}
        >
          <ShoppingBag className="w-4 h-4" /> ব্যাগে যোগ করুন
        </CustomButton>
      </div>
    </motion.div>
  );
}