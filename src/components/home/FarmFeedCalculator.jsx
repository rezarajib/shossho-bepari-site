import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ShoppingBag, MessageCircle } from "lucide-react";
import products from "../../data/products.json";
import { APP_CONFIG } from "../../constants/appConfig";
import { useCart } from "../../hooks/useCart";
import { calculateSmartBill } from "../../utils/unitConverter";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const cowPresets = [
  { cows: 5, label: "৫টি গরু" },
  { cows: 15, label: "১৫টি গরু" },
  { cows: 30, label: "৩০টি গরু" },
  { cows: 50, label: "৫০টি গরু" },
];

const feedPlan = [
  { id: "maize-vutta", monthlyMaundPerAnimal: 1 },
  { id: "wheat-gom", monthlyMaundPerAnimal: 0.5 },
  { id: "mustard-cake", monthlyMaundPerAnimal: 0.8 },
];

const formatFeedWeight = (kg) => {
  const maund = Math.floor(kg / APP_CONFIG.maundToKg);
  const remainderKg = Number((kg % APP_CONFIG.maundToKg).toFixed(2));
  if (maund === 0) return `${toBanglaNum(remainderKg)} কেজি`;
  const quantity = remainderKg
    ? `${toBanglaNum(maund)} মণ ${toBanglaNum(remainderKg)} কেজি`
    : `${toBanglaNum(maund)} মণ`;
  return `${quantity} (${toBanglaNum(Number(kg.toFixed(2)))} কেজি)`;
};

export default function FarmFeedCalculator() {
  const [animals, setAnimals] = useState(10);
  const [durationDays, setDurationDays] = useState(30);
  const { addToCart } = useCart();

  const feedItems = useMemo(
    () =>
      feedPlan.map(({ id, monthlyMaundPerAnimal }) => {
        const product = products.find((item) => item.id === id);
        const maund = animals * monthlyMaundPerAnimal * durationDays / 30;
        const quantity = maund * (product?.maundToKg ?? APP_CONFIG.maundToKg);

        return {
          product,
          maund,
          quantity,
          bill: calculateSmartBill(product, quantity),
          retailTotal: quantity * product.retailPrice,
        };
      }),
    [animals, durationDays],
  );

  const totalKg = feedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalMaund = totalKg / APP_CONFIG.maundToKg;
  const totalCost = feedItems.reduce((sum, item) => sum + item.bill.calculatedTotal, 0);
  const totalSavings = feedItems.reduce(
    (sum, item) => sum + Math.max(0, item.retailTotal - item.bill.calculatedTotal),
    0,
  );
  const bulkEligible = totalKg >= 2000;
  const maize = feedItems.find((item) => item.product.id === "maize-vutta");
  const wheat = feedItems.find((item) => item.product.id === "wheat-gom");
  const cake = feedItems.find((item) => item.product.id === "mustard-cake");

  const addFeedToCart = () => {
    feedItems.forEach(({ product, bill }) => addToCart(product, bill));
  };

  const orderOnWhatsApp = () => {
    const itemLines = feedItems
      .map(({ product, bill }) => `${product.name} — ${bill.unitLabel} = ${formatTaka(bill.calculatedTotal)}`)
      .join("\n");
    const bulkNote = bulkEligible
      ? "\n২+ টন অর্ডার: অতিরিক্ত ২% পাইকারি ছাড়ের জন্য যোগ্য (চূড়ান্ত ছাড় নিশ্চিতকরণ সাপেক্ষে)।"
      : "";
    const message =
      `*🌾 ${APP_CONFIG.brandName} — ${toBanglaNum(durationDays)} দিনের গোখাদ্য অর্ডার*\n` +
      `পশুর সংখ্যা: ${toBanglaNum(animals)}টি\n` +
      `সময়কাল: ${toBanglaNum(durationDays)} দিন\n` +
      `------------------------\n${itemLines}\n` +
      `মোট ওজন: ${toBanglaNum(totalMaund.toFixed(2))} মণ (${toBanglaNum(totalKg.toFixed(0))} কেজি)\n` +
      `*আনুমানিক ${toBanglaNum(durationDays)} দিনের বিল: ${formatTaka(totalCost)}*\n` +
      `খুচরা দরের তুলনায় আনুমানিক সাশ্রয়: ${formatTaka(totalSavings)}${bulkNote}`;

    window.open(
      `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="my-12 w-full px-4 sm:px-8 lg:px-12 xl:px-16">
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-6 text-stone-800 shadow-lg lg:p-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 text-2xl font-extrabold text-stone-900 lg:text-3xl">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-emerald-800">
              <Calculator className="h-6 w-6" />
            </span>
            খামারের গোখাদ্য রেশন ক্যালকুলেটর
          </div>
          <p className="mt-3 text-lg leading-relaxed text-stone-600 lg:text-xl">
            পরিকল্পনার ভিত্তি: প্রতি পশুর ৩০ দিনে ১ মণ ভুট্টা, আধা মণ গম ও ০.৮ মণ সরিষার খৈল। এটি আনুমানিক রেশন—পশুর বয়স ও স্বাস্থ্য অনুযায়ী বিশেষজ্ঞের পরামর্শ নিন।
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-5 lg:p-6">
            <label htmlFor="farm-animal-count" className="mb-3 block text-base font-extrabold text-stone-800 lg:text-lg">
              <span className="mb-2 flex items-center justify-between gap-3">
                <span>খামারে গরু / পশুর সংখ্যা</span>
                <span className="text-2xl font-black text-emerald-900">{toBanglaNum(animals)}টি</span>
              </span>
              <input
                id="farm-animal-count"
                type="number"
                min="1"
                max="500"
                value={animals}
                onChange={(event) => setAnimals(Math.min(500, Math.max(1, Number(event.target.value) || 1)))}
                className="input input-bordered min-h-14 w-full rounded-xl border-2 border-stone-300 bg-white px-4 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15"
              />
            </label>
            <input
              type="range"
              min="1"
              max="500"
              value={animals}
              onChange={(event) => setAnimals(Number(event.target.value))}
              className="range range-warning w-full"
              aria-label="খামারে গরু বা পশুর সংখ্যা"
            />
            <div className="mt-1 flex justify-between text-xs font-medium text-stone-500">
              <span>১টি</span>
              <span>৫০০টি</span>
            </div>
            <label className="mt-4 block space-y-2 text-base font-extrabold text-stone-800 lg:text-lg">
              কত দিনের খাদ্য হিসাব করবেন?
              <select
                value={durationDays}
                onChange={(event) => setDurationDays(Number(event.target.value))}
                className="select select-bordered min-h-14 w-full rounded-xl border-2 border-stone-300 bg-white px-4 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15"
              >
                <option value="7">৭ দিন</option>
                <option value="15">১৫ দিন</option>
                <option value="30">৩০ দিন</option>
              </select>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {cowPresets.map((preset) => (
                <motion.button
                  key={preset.cows}
                  type="button"
                  onClick={() => setAnimals(preset.cows)}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={animals === preset.cows}
                  className={`rounded-full border px-3 py-2 text-sm font-bold transition-colors ${animals === preset.cows ? "border-emerald-800 bg-emerald-800 text-white" : "border-amber-200 bg-white text-stone-800 hover:border-amber-400 hover:bg-amber-50"}`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-base font-bold text-stone-700 lg:text-lg">ভুট্টা ও গম প্রয়োজন</p>
              <p className="mt-2 text-lg font-extrabold text-emerald-900">
                ভুট্টা: {formatFeedWeight(maize.quantity)}
              </p>
              <p className="text-lg font-extrabold text-emerald-900">
                গম: {formatFeedWeight(wheat.quantity)}
              </p>
              <p className="mt-2 border-t border-amber-200 pt-2 text-sm font-semibold text-stone-600">
                আনুমানিক: {formatTaka(maize.bill.calculatedTotal + wheat.bill.calculatedTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-4">
              <p className="text-base font-bold text-stone-700 lg:text-lg">সরিষার খৈল প্রয়োজন</p>
              <p className="mt-2 text-xl font-extrabold text-emerald-900 lg:text-2xl">
                {formatFeedWeight(cake.quantity)}
              </p>
              <p className="mt-2 border-t border-stone-200 pt-2 text-sm font-semibold text-stone-600">
                আনুমানিক: {formatTaka(cake.bill.calculatedTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:col-span-2">
              <p className="text-base font-bold text-stone-700 lg:text-lg">মোট ওজন (টন / মণ)</p>
              <p className="mt-1 text-2xl font-extrabold text-stone-900 lg:text-3xl">
                {toBanglaNum((totalKg / 1000).toFixed(2))} টন
                <span className="mx-2 text-stone-400">•</span>
                {toBanglaNum(totalMaund.toFixed(2))} মণ
              </p>
              {bulkEligible && (
                <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-base font-extrabold text-emerald-900">
                  ২+ টন অর্ডার: অতিরিক্ত ২% ছাড়ের জন্য যোগ্য
                </span>
              )}
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
              <p className="text-base font-bold text-stone-700 lg:text-lg">খুচরা দরের তুলনায় পাইকারি সাশ্রয়</p>
              <p className="mt-1 text-3xl font-black text-emerald-900 lg:text-4xl">{formatTaka(totalSavings)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
              <p className="text-base font-bold text-stone-700 lg:text-lg">আনুমানিক {toBanglaNum(durationDays)} দিনের বিল</p>
              <p className="mt-1 text-4xl font-black text-emerald-900 lg:text-5xl">{formatTaka(totalCost)}</p>
              {bulkEligible && (
                <p className="mt-1 text-sm text-stone-600">
                  ২+ টন অর্ডারে অতিরিক্ত ২% ছাড়ের যোগ্য; এই হিসাবের মোটে ছাড়টি ধরা হয়নি, অর্ডার নিশ্চিতকালে জানানো হবে।
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <motion.button
            type="button"
            onClick={addFeedToCart}
            whileTap={{ scale: 0.98 }}
            className="btn min-h-14 flex-1 border-none bg-emerald-800 px-5 text-base font-extrabold text-white hover:bg-emerald-900 lg:text-lg"
          >
            <ShoppingBag className="h-5 w-5" />
            এক ক্লিকে সব গোখাদ্য ব্যাগে যোগ করুন
          </motion.button>
          <motion.button
            type="button"
            onClick={orderOnWhatsApp}
            whileTap={{ scale: 0.98 }}
            className="btn min-h-12 flex-1 border border-emerald-800 bg-white px-5 text-lg font-extrabold text-emerald-900 hover:bg-emerald-50"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp-এ অর্ডার দিন
          </motion.button>
        </div>
      </div>
    </section>
  );
}
