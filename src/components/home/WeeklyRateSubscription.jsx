import { useState } from "react";
import { MessageCircle, Smartphone } from "lucide-react";
import { APP_CONFIG } from "../../constants/appConfig";

const interestOptions = [
  "খাঁটি সরিষার তেল",
  "খামারি গোখাদ্য",
  "পাইকারি শস্য",
];

export default function WeeklyRateSubscription() {
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(interestOptions[0]);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^88/, "");
    if (!/^01[3-9]\d{8}$/.test(digits)) {
      setError("সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন।");
      return;
    }

    setError("");
    const message = [
      `আসসালামু আলাইকুম, আমি ${APP_CONFIG.brandName}-এর সাপ্তাহিক হাট ও মিলের দর আপডেট পেতে চাই।`,
      `মোবাইল: ${digits}`,
      `আগ্রহ: ${interest}`,
      "সাপ্তাহিক রেট তালিকায় যুক্ত করার আগে আমার অনুরোধটি নিশ্চিত করুন।",
    ].join("\n");
    window.open(
      `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section id="rate-alert" className="w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="rate-alert-title">
      <div className="grid gap-6 rounded-3xl border-2 border-emerald-900/15 bg-linear-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#EAE5D9] p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:p-10">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-amber-300">
            <Smartphone className="h-6 w-6" />
          </span>
          <h2 id="rate-alert-title" className="mt-3 text-2xl font-black text-stone-900 sm:text-3xl">📲 সাপ্তাহিক হাট ও মিলের দর মোবাইলে পান</h2>
          <p className="mt-2 text-base leading-relaxed text-stone-700 lg:text-lg">
            আপনার নম্বর ও পছন্দের পণ্য WhatsApp-এ পাঠান। রেট-আপডেট তালিকায় যুক্ত করার অনুরোধটি আমরা নিশ্চিত করব।
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <label className="space-y-1.5 text-base font-extrabold text-stone-800">
            WhatsApp / মোবাইল নম্বর
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
              className="input input-bordered min-h-14 w-full rounded-xl border-2 border-stone-300 bg-white px-4 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15"
              aria-describedby={error ? "rate-alert-error" : "rate-alert-note"}
            />
          </label>
          <label className="space-y-1.5 text-base font-extrabold text-stone-800">
            কোন দর জানতে চান?
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="select select-bordered min-h-14 w-full rounded-xl border-2 border-stone-300 bg-white px-4 text-lg font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15"
            >
              {interestOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          {error ? (
            <p id="rate-alert-error" role="alert" className="text-sm font-bold text-red-700">{error}</p>
          ) : (
            <p id="rate-alert-note" className="text-sm font-medium text-stone-600">এটি WhatsApp-এ অনুরোধ পাঠাবে; স্বয়ংক্রিয় সাবস্ক্রিপশন নয়।</p>
          )}
          <button type="submit" className="btn min-h-14 rounded-xl border-none bg-emerald-800 text-base font-black text-white hover:bg-emerald-900 lg:text-lg">
            <MessageCircle className="h-5 w-5" /> WhatsApp-এ রেট আপডেট চালু করুন
          </button>
        </form>
      </div>
    </section>
  );
}
