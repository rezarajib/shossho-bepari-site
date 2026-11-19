import { useState } from "react";
import { CheckCircle2, PackageCheck, QrCode, Wheat } from "lucide-react";
import { toBanglaNum } from "../../utils/formatBanglaNumber";

const batches = [
  {
    id: "batch-42",
    label: "ব্যাচ #৪২ • কাদের আলী মিল",
    product: "খাঁটি সরিষার তেল",
    category: "oil-seeds",
    farmer: "আব্দুল করিম",
    village: "চাপড়া ইউনিয়ন, কুষ্টিয়া",
    quality: "আর্দ্রতা ১১.২% • ১০০% ভেজালমুক্ত",
    millingDate: "১৮ নভেম্বর, ২০২৬",
    packingDate: "১৯ নভেম্বর, ২০২৬",
  },
  {
    id: "batch-43",
    label: "ব্যাচ #৪৩ • রফিক মিয়া মিল",
    product: "খাঁটি সরিষার তেল",
    category: "oil-seeds",
    farmer: "মোছা. রহিমা খাতুন",
    village: "যদুবয়রা ইউনিয়ন, কুষ্টিয়া",
    quality: "আর্দ্রতা ১০.৮% • ১০০% ভেজালমুক্ত",
    millingDate: "১৯ নভেম্বর, ২০২৬",
    packingDate: "২০ নভেম্বর, ২০২৬",
  },
  {
    id: "lot-108",
    label: "লট #১০৮ • শুকনো ভুট্টা",
    product: "শুকনো দানা ভুট্টা",
    category: "livestock-feed",
    farmer: "স্থানীয় কৃষক সংগ্রহ",
    village: "সদকী ইউনিয়ন, কুষ্টিয়া",
    quality: "আর্দ্রতা ১১.৫% • গ্রেড A",
    millingDate: "১৭ নভেম্বর, ২০২৬",
    packingDate: "১৮ নভেম্বর, ২০২৬",
  },
];

export default function BatchTraceability({ onOrder }) {
  const [selectedId, setSelectedId] = useState(batches[0].id);
  const selected = batches.find((batch) => batch.id === selectedId) ?? batches[0];

  return (
    <section className="w-full px-4 py-6 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="traceability-title">
      <div className="rounded-3xl border-2 border-stone-200 bg-[#FAF7F2] p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold tracking-wide text-emerald-800 lg:text-base">উৎস থেকে প্যাকেট পর্যন্ত স্বচ্ছ যাত্রা</p>
            <h2 id="traceability-title" className="mt-1 text-2xl font-black text-stone-900 sm:text-3xl">🔍 ব্যাচ ও উৎস যাচাই</h2>
          </div>
          <span className="rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-950">
            নমুনা ট্রেসেবিলিটি তথ্য
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-stone-600">নিচের রেকর্ডগুলো UI প্রদর্শনের নমুনা; প্রকৃত উৎস ও পরীক্ষার তথ্য ERP-তে যাচাই করে প্রকাশ করতে হবে।</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {batches.map((batch) => (
            <button
              key={batch.id}
              type="button"
              onClick={() => setSelectedId(batch.id)}
              aria-pressed={selected.id === batch.id}
              className={`rounded-2xl border px-4 py-3 text-left text-base font-extrabold transition ${
                selected.id === batch.id
                  ? "border-emerald-900 bg-emerald-900 text-white shadow-md"
                  : "border-stone-300 bg-white text-stone-800 hover:border-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {batch.label}
            </button>
          ))}
        </div>

        <article className="mt-4 grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[1fr_auto] sm:p-6">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-stone-900">
              <Wheat className="h-5 w-5 text-amber-700" /> {selected.product}
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-bold text-stone-500">উৎস গ্রাম ও কৃষক</dt>
                <dd className="mt-1 text-lg font-extrabold text-stone-900">{selected.farmer} • {selected.village}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-stone-500">মান ও আর্দ্রতা পরীক্ষা</dt>
                <dd className="mt-1 text-lg font-extrabold text-emerald-900">{selected.quality}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-stone-500">মিলিং তারিখ</dt>
                <dd className="mt-1 text-base font-bold text-stone-800">{selected.millingDate}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-stone-500">প্যাকিং তারিখ</dt>
                <dd className="mt-1 text-base font-bold text-stone-800">{selected.packingDate}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <QrCode className="h-12 w-12 text-emerald-800" />
            <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-900"><CheckCircle2 className="h-4 w-4" /> QR যাচাই নমুনা</span>
            <span className="text-xs font-semibold text-stone-600">প্রকৃত QR যাচাই ERP সংযোগের পর সক্রিয় হবে</span>
          </div>
          <button
            type="button"
            onClick={() => onOrder?.(selected.category)}
            className="btn min-h-12 w-full rounded-xl border-none bg-emerald-800 text-base font-black text-white hover:bg-emerald-900 sm:col-span-2"
          >
            <PackageCheck className="h-5 w-5" /> এই ব্যাচ অর্ডার করুন
          </button>
        </article>
        <p className="mt-3 text-right text-xs font-semibold text-stone-500">{toBanglaNum(batches.length)}টি নমুনা ব্যাচ</p>
      </div>
    </section>
  );
}
