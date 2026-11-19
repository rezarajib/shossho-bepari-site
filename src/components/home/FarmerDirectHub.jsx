import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, CheckCircle2, LockKeyhole, MapPinned, Phone, Sprout, Wallet, Weight } from "lucide-react";
import coreProducts from "../../data/products.json";
import { APP_CONFIG } from "../../constants/appConfig";
import { saveFarmerBooking } from "../../services/erpService";
import { toBanglaNum } from "../../utils/formatBanglaNumber";

const coreCropIds = [
  "yellow-mustard",
  "wheat-gom",
  "miniket-chal",
  "sesame-til",
  "mustard-oil",
  "mustard-cake",
  "paddy-oryza",
  "maize-vutta",
  "jute-fiber",
  "black-cumin",
  "black-gram",
  "grass-pea",
];
const cropOptions = coreCropIds.map((id) => coreProducts.find((product) => product.id === id)).filter(Boolean);
const guarantees = [
  {
    icon: <Weight className="h-8 w-8" />,
    title: "উঠান থেকেই ডিজিটাল ওজনে সংগ্রহ",
    detail: "হাটে আনা-নেওয়ার ঝামেলা ও মধ্যস্বত্বভোগীর কাটতি ছাড়াই সংগ্রহের ব্যবস্থা।",
    color: "bg-emerald-100 text-emerald-900",
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    title: "সাথে সাথে নগদ / বিকাশ পেমেন্ট",
    detail: "ওজন ও দর মিলিয়ে নেওয়ার পর সরাসরি কৃষককে পেমেন্ট।",
    color: "bg-amber-100 text-amber-950",
  },
  {
    icon: <LockKeyhole className="h-8 w-8" />,
    title: "ফসল কাটার আগেই অগ্রিম দর লক",
    detail: "আলোচনা ও নিশ্চিতকরণ সাপেক্ষে কাটার ১৫ দিন আগেও দর বুকিংয়ের অনুরোধ দিন।",
    color: "bg-stone-100 text-stone-900",
  },
  {
    icon: <Sprout className="h-8 w-8" />,
    title: "মৌসুমের শুরুতে বীজ ও সার সহায়তা",
    detail: "অংশীদার কৃষকের জন্য মৌসুমভিত্তিক উপকরণ সহায়তার সুযোগ।",
    color: "bg-lime-100 text-lime-950",
  },
];

const initialForm = {
  farmerName: "",
  village: "",
  phone: "",
  cropId: coreCropIds[0],
  estimatedMaund: "",
  expectedHarvestDate: "",
};

function makeBookingMessage(form) {
  const crop = cropOptions.find((product) => product.id === form.cropId);
  return [
    `আসসালামু আলাইকুম, ${APP_CONFIG.brandName}।`,
    "কৃষকের অগ্রিম ফসল বুকিং / রেট লকের অনুরোধ:",
    `কৃষকের নাম: ${form.farmerName}`,
    `গ্রাম: ${form.village}`,
    `মোবাইল: ${form.phone}`,
    `ফসল: ${crop?.name ?? form.cropId}`,
    `সম্ভাব্য পরিমাণ: ${toBanglaNum(form.estimatedMaund)} মণ`,
    `সম্ভাব্য কাটার তারিখ: ${form.expectedHarvestDate}`,
    "দর ও সংগ্রহের সময় নিশ্চিত করতে যোগাযোগ করুন।",
  ].join("\n");
}

export default function FarmerDirectHub() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const bookingMutation = useMutation({
    mutationFn: saveFarmerBooking,
    onSuccess: (_data, booking) => {
      queryClient.invalidateQueries({ queryKey: ["erpData"] });
      setFeedback(booking.action === "whatsapp"
        ? "বুকিংটি ERP পাইপলাইনে সংরক্ষিত হয়েছে এবং WhatsApp খোলা হয়েছে। দর চূড়ান্ত হবে মালিকের নিশ্চিতকরণের পর।"
        : "অগ্রিম বুকিংটি ERP কৃষক পাইপলাইনে সংরক্ষিত হয়েছে।");
      setForm(initialForm);
    },
  });

  const updateForm = (key, value) => {
    setFeedback("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitBooking = (event) => {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value ?? "save";
    if (action === "whatsapp") {
      const ownerUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(makeBookingMessage(form))}`;
      window.open(ownerUrl, "_blank", "noopener,noreferrer");
    }
    bookingMutation.mutate({
      ...form,
      cropName: cropOptions.find((product) => product.id === form.cropId)?.name ?? form.cropId,
      estimatedMaund: Number(form.estimatedMaund),
      status: "booking-requested",
      action,
    });
  };

  return (
    <section className="space-y-7 px-4 py-10 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="farmer-direct-hub-title">
      <header className="rounded-3xl border-2 border-emerald-900/10 bg-linear-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#e9efe1] p-6 sm:p-8 lg:p-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-4 py-2 text-sm font-extrabold text-emerald-950">
          🌾 কৃষকের পাশে, ফসলের শুরু থেকে সংগ্রহ পর্যন্ত
        </p>
        <h2 id="farmer-direct-hub-title" className="mt-4 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          কৃষকের ফসলের ন্যায্য দর ও সরাসরি সংগ্রহ
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-stone-700 lg:text-lg">
          ফসল কাটার আগে বুকিংয়ের অনুরোধ দিন। পরিমাণ, মান, দর ও সংগ্রহের দিন দুই পক্ষের সম্মতিতে নিশ্চিত করা হবে।
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {guarantees.map((item) => (
          <article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>{item.icon}</span>
            <h3 className="mt-4 text-lg font-black leading-snug text-stone-900 lg:text-xl">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 lg:text-base">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <aside className="flex flex-col justify-between rounded-3xl bg-emerald-950 p-6 text-white shadow-lg sm:p-8">
          <div>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-emerald-950"><LockKeyhole className="h-7 w-7" /></span>
            <h3 className="mt-5 text-2xl font-black leading-snug lg:text-3xl">আগাম ফসল বুকিং ও দর লক</h3>
            <p className="mt-3 text-base leading-relaxed text-emerald-50 lg:text-lg">
              আজকের দর ১৫ দিন পর্যন্ত ধরে রাখার অনুরোধ পাঠান। ফসলের মান, পরিমাণ ও বাজার পরিস্থিতি যাচাই করে মালিক দর নিশ্চিত করবেন।
            </p>
          </div>
          <p className="mt-6 flex items-start gap-2 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-relaxed text-emerald-50">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            ফর্ম জমা হলেই অনুরোধটি স্থানীয় ERP পাইপলাইনে থাকে; এটি নিজে থেকে চূড়ান্ত বিক্রয়চুক্তি নয়।
          </p>
        </aside>

        <form onSubmit={submitBooking} className="space-y-4 rounded-3xl border-2 border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-2">
            <h3 className="text-2xl font-black text-stone-900">কৃষকের অগ্রিম ফসল বুকিং / রেট লক ফর্ম</h3>
            <p className="mt-1 text-sm font-medium text-stone-600">সঠিক যোগাযোগ নম্বর দিন—আমরা সংগ্রহ ও দর নিয়ে কথা বলব।</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              কৃষকের নাম *
              <input required value={form.farmerName} onChange={(event) => updateForm("farmerName", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" autoComplete="name" />
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              গ্রাম / এলাকা *
              <input required value={form.village} onChange={(event) => updateForm("village", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              মোবাইল নম্বর *
              <input required type="tel" inputMode="tel" pattern="(?:\+?88)?01[3-9][0-9]{8}" title="১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন" placeholder="01XXXXXXXXX" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" autoComplete="tel" />
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              ফসল (১২টি মূল পণ্য) *
              <select value={form.cropId} onChange={(event) => updateForm("cropId", event.target.value)} className="select select-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">
                {cropOptions.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              আনুমানিক পরিমাণ (মণ) *
              <input required type="number" min="1" step="0.5" value={form.estimatedMaund} onChange={(event) => updateForm("estimatedMaund", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800">
              সম্ভাব্য ফসল কাটার তারিখ *
              <span className="relative block">
                <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-800" />
                <input required type="date" value={form.expectedHarvestDate} onChange={(event) => updateForm("expectedHarvestDate", event.target.value)} className="input input-bordered min-h-13 w-full rounded-xl border-2 border-stone-300 bg-white pl-12 text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15" />
              </span>
            </label>
          </div>
          {bookingMutation.isError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">বুকিং সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।</p>}
          {feedback && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{feedback}</p>}
          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            <button type="submit" value="save" disabled={bookingMutation.isPending} className="btn min-h-14 rounded-xl border-2 border-emerald-800 bg-white px-4 text-base font-black text-emerald-950 hover:bg-emerald-50">
              <CheckCircle2 className="h-5 w-5" /> ERP পাইপলাইনে সংরক্ষণ
            </button>
            <button type="submit" value="whatsapp" disabled={bookingMutation.isPending} className="btn min-h-14 rounded-xl border-none bg-emerald-800 px-4 text-base font-black text-white shadow-md hover:bg-emerald-900">
              <Phone className="h-5 w-5" /> WhatsApp-এ বুকিং পাঠান <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
      <div className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-stone-600">
        <MapPinned className="h-4 w-4 text-emerald-800" />
        মাঠ ও গোডাউনের পরিমাণ বাস্তব যাচাই এবং চূড়ান্ত দর মালিকের নিশ্চিতকরণসাপেক্ষে।
      </div>
    </section>
  );
}
