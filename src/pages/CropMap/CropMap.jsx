import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  Mic,
  MapPinned,
  MessageCircle,
  PackageCheck,
  Phone,
  Satellite,
  Sprout,
  Tractor,
  Volume2,
  Wheat,
} from "lucide-react";
import { getCropFields, saveCropField } from "../../services/erpService";
import { APP_CONFIG } from "../../constants/appConfig";
import { CROP_OPTIONS, CROP_STATUS_FILTERS, CROP_STATUS_OPTIONS, getCropStatus, getSeasonLabel, SEASON_OPTIONS } from "../../utils/cropFields";
import { toBanglaNum } from "../../utils/formatBanglaNumber";
import FarmerDirectHub from "../../components/home/FarmerDirectHub";

const formatNumber = (value, fractionDigits = 1) =>
  toBanglaNum(Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: fractionDigits,
  }));

const stageStyles = {
  growing: { color: "fill-lime-500", badge: "bg-lime-100 text-lime-900", pulse: "bg-lime-500" },
  ripening: { color: "fill-amber-500", badge: "bg-amber-100 text-amber-950", pulse: "bg-amber-500" },
  harvesting: { color: "fill-emerald-700", badge: "bg-emerald-100 text-emerald-950", pulse: "bg-emerald-600" },
  stock: { color: "fill-orange-500", badge: "bg-orange-100 text-orange-950", pulse: "bg-orange-500" },
};
const cropVisuals = {
  সরিষা: { emoji: "🌻", color: "bg-amber-100 text-amber-950" },
  তিল: { emoji: "🌱", color: "bg-lime-100 text-lime-950" },
  ধান: { emoji: "🌾", color: "bg-yellow-100 text-yellow-950" },
  "আমন ধান": { emoji: "🌾", color: "bg-yellow-100 text-yellow-950" },
  চাল: { emoji: "🍚", color: "bg-stone-100 text-stone-900" },
  গম: { emoji: "🌾", color: "bg-amber-100 text-amber-950" },
  ভুট্টা: { emoji: "🌽", color: "bg-yellow-100 text-yellow-950" },
  পাট: { emoji: "🌿", color: "bg-emerald-100 text-emerald-950" },
  কালোজিরা: { emoji: "🫘", color: "bg-stone-200 text-stone-900" },
  মাষকলাই: { emoji: "🫘", color: "bg-stone-200 text-stone-900" },
  খেসারি: { emoji: "🫘", color: "bg-lime-100 text-lime-950" },
};

const getCropVisual = (crop) => cropVisuals[crop] ?? { emoji: "🌱", color: "bg-emerald-100 text-emerald-950" };

function getVisualStatus(field) {
  if (field.status === "stock") return { label: "🟢 গোলায় মাল রেডি", className: "bg-emerald-100 text-emerald-950" };
  if (field.status === "harvesting") return { label: "🟠 এখন কাটা হচ্ছে", className: "bg-orange-100 text-orange-950" };
  if (field.status === "ripening") return { label: "🟡 ফসল পাকছে", className: "bg-amber-100 text-amber-950" };
  return { label: "🌱 চারা বাড়ছে", className: "bg-lime-100 text-lime-950" };
}

function getWhatsAppUrl(field) {
  const phone = String(field.phone || "").replace(/\D/g, "");
  if (phone.length < 10) return null;
  const internationalPhone = phone.startsWith("0") ? `88${phone}` : phone;
  const message = `আসসালামু আলাইকুম, ${field.farmerName}। ${field.village} গ্রামের ${field.crop} ফসল (${field.estimatedMaund} মণ সম্ভাব্য উৎপাদন) সংগ্রহের বিষয়ে কথা বলতে চাই।`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

function getFarmerSpeech(field) {
  const status = getCropStatus(field.status).label;
  const harvestInfo = field.status === "stock"
    ? `গোলায় ${field.stockMaund} মণ ফসল বিক্রির জন্য আছে।`
    : field.status === "harvesting"
      ? `এই সপ্তাহে ${field.weeklyHarvestMaund} মণ ফসল কাটা হচ্ছে।`
      : field.status === "ripening"
        ? `${field.harvestDays} দিন পর ফসল কাটা হবে।`
        : status;
  return `${field.farmerName}। গ্রাম ${field.village}, ইউনিয়ন ${field.union || "উল্লেখ নেই"}। ফসল ${field.crop}, জাত ${field.variety || "উল্লেখ নেই"}। জমি ${field.areaBigha} বিঘা। সম্ভাব্য উৎপাদন ${field.estimatedMaund} মণ। ${harvestInfo}`;
}

function BanglaAudioButton({ field, compact = false }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");

  const speakField = () => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setError("এই ব্রাউজারে বাংলা অডিও সুবিধা নেই।");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getFarmerSpeech(field));
    const voices = window.speechSynthesis.getVoices();
    const banglaVoice = voices.find((voice) => /^bn-(BD|IN)/i.test(voice.lang))
      ?? voices.find((voice) => /^bn/i.test(voice.lang));
    utterance.lang = banglaVoice?.lang ?? "bn-BD";
    if (banglaVoice) utterance.voice = banglaVoice;
    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setError("");
      setIsSpeaking(true);
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError("অডিও চালু হয়নি। আবার চাপুন।");
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <button
        type="button"
        onClick={speakField}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-800 bg-white font-black text-emerald-950 transition hover:bg-emerald-50 focus-visible:outline-4 focus-visible:outline-emerald-700 ${compact ? "min-h-11 px-3 text-sm" : "min-h-14 w-full px-4 text-base lg:text-lg"}`}
      >
        <Volume2 className={`shrink-0 ${compact ? "h-5 w-5" : "h-6 w-6"}`} />
        {isSpeaking ? "🔊 শুনছেন..." : "🔊 বাংলায় শুনে নিন"}
      </button>
      {error && <p role="alert" className="text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}

function FieldMap({ fields, selectedId, onSelect }) {
  const columns = 4;
  const rows = Math.max(1, Math.ceil(fields.length / columns));
  const height = Math.max(320, rows * 132 + 50);

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-900/10 bg-[#e8f0de]">
      <svg
        viewBox={`0 0 1000 ${height}`}
        role="group"
        aria-label="গ্রামভিত্তিক কৃষকের জমির ইন্টারঅ্যাকটিভ মানচিত্র"
        className="block h-auto min-w-190 w-full"
      >
        <defs>
          <pattern id="field-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#69815d" strokeOpacity=".12" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height={height} fill="#e8f0de" />
        <rect width="1000" height={height} fill="url(#field-grid)" />
        <path d={`M -20 ${height * 0.77} C 220 ${height * 0.68}, 310 ${height * 0.9}, 540 ${height * 0.77} S 820 ${height * 0.65}, 1040 ${height * 0.82}`} fill="none" stroke="#9bd1cf" strokeWidth="28" opacity=".8" />
        <path d={`M -20 ${height * 0.77} C 220 ${height * 0.68}, 310 ${height * 0.9}, 540 ${height * 0.77} S 820 ${height * 0.65}, 1040 ${height * 0.82}`} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="9 12" opacity=".7" />
        <path d={`M 0 ${height * 0.48} C 250 ${height * 0.43}, 520 ${height * 0.52}, 1000 ${height * 0.4}`} fill="none" stroke="#d7bd77" strokeWidth="14" opacity=".9" />
        <path d={`M 0 ${height * 0.48} C 250 ${height * 0.43}, 520 ${height * 0.52}, 1000 ${height * 0.4}`} fill="none" stroke="#fff9e9" strokeWidth="2" strokeDasharray="8 12" />

        {fields.map((field, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const x = 28 + column * 242;
          const y = 22 + row * 132;
          const isSelected = selectedId === field.id;
          const style = stageStyles[field.status] ?? stageStyles.growing;
          return (
            <g
              key={field.id}
              role="button"
              tabIndex="0"
              aria-label={`${field.village} গ্রামের ${field.farmerName}, ${field.crop}, ${getCropStatus(field.status).label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(field.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(field.id);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <title>{`${field.farmerName} • ${field.village} • ${field.crop}`}</title>
              <path
                d={`M ${x + 11} ${y} L ${x + 208} ${y + 3} L ${x + 202} ${y + 104} L ${x + 4} ${y + 99} Z`}
                className={`${style.color} transition-all duration-200 ${isSelected ? "stroke-amber-500" : "stroke-white"}`}
                strokeWidth={isSelected ? "6" : "3"}
              />
              <path d={`M ${x + 24} ${y + 12} L ${x + 195} ${y + 16} M ${x + 18} ${y + 40} L ${x + 193} ${y + 44} M ${x + 15} ${y + 68} L ${x + 190} ${y + 72}`} fill="none" stroke="#ffffff" strokeOpacity=".5" strokeWidth="2" />
              <circle cx={x + 28} cy={y + 25} r="12" fill={isSelected ? "#b45309" : "#064e3b"} stroke="white" strokeWidth="3" />
              <text x={x + 28} y={y + 29} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">{toBanglaNum(index + 1)}</text>
              <text x={x + 48} y={y + 30} fill="#17251c" fontSize="17" fontWeight="800">{field.village}</text>
              <text x={x + 20} y={y + 62} fill="#243329" fontSize="16" fontWeight="700">{field.crop}</text>
              <text x={x + 20} y={y + 84} fill="#35443a" fontSize="12">{field.farmerName}</text>
            </g>
          );
        })}
        <g transform={`translate(800 ${Math.max(28, height - 31)})`}>
          <circle r="8" fill="#047857" />
          <text x="15" y="5" fill="#344238" fontSize="13" fontWeight="700">কৃষকের মাঠ ও গোলা</text>
        </g>
      </svg>
    </div>
  );
}

function GoogleSatelliteMap({ field }) {
  if (!field) return null;
  const location = `${field.village}, ${field.union || ""}, Kumarkhali, Kushtia`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=k&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-sm" aria-label="গুগল স্যাটেলাইট ম্যাপ">
      <div className="flex flex-col gap-2 border-b border-stone-200 bg-[#FAF7F2] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-900 sm:text-xl">🛰️ আসল গুগল স্যাটেলাইট ম্যাপ</h2>
          <p className="text-sm font-semibold text-stone-600">{field.village} • {field.union || "ইউনিয়ন উল্লেখ নেই"}</p>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn min-h-11 border border-emerald-800 bg-white px-4 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50">
          📍 Google Maps-এ লোকেশন খুলুন
        </a>
      </div>
      <iframe
        key={`${field.id}-${field.village}-${field.union}`}
        title={`${field.village}, ${field.union || "কুমারখালী"}, কুষ্টিয়ার স্যাটেলাইট মানচিত্র`}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-90 w-full border-0 sm:h-120"
      />
      <p className="border-t border-stone-100 px-4 py-2 text-xs font-medium text-stone-600">
        Google-এর গ্রাম/ইউনিয়নভিত্তিক মানচিত্র। সুনির্দিষ্ট জমির সীমানা বা GPS পিন এই রেকর্ডে নেই।
      </p>
    </section>
  );
}

function FarmerInspector({ field }) {
  if (!field) {
    return (
      <aside className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
        <MapPinned className="h-10 w-10 text-emerald-700" />
        <p className="mt-3 text-lg font-extrabold text-stone-900">মানচিত্র থেকে একটি জমি বেছে নিন</p>
        <p className="mt-1 text-sm text-stone-600">কৃষক, ফসল, জমি ও সংগ্রহের অবস্থা এখানে দেখুন।</p>
      </aside>
    );
  }

  const style = stageStyles[field.status] ?? stageStyles.growing;
  const whatsappUrl = getWhatsAppUrl(field);
  const acreage = Number(field.areaBigha || 0) / 3;
  const cropVisual = getCropVisual(field.crop);
  const visualStatus = getVisualStatus(field);
  const businessPhone = `+${APP_CONFIG.whatsappNumber}`;
  const voiceMessage = `আসসালামু আলাইকুম, ${field.farmerName}। ${field.village} গ্রামের ${field.crop} ফসলের বিষয়ে ভয়েস মেসেজ পাঠাতে চাই।`;
  const voiceMessageUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(voiceMessage)}`;

  return (
    <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-800">{field.union} • {field.village}</p>
          <h2 className="mt-1 text-2xl font-black text-stone-900 sm:text-3xl">{field.farmerName}</h2>
          <p className="mt-1 text-base font-semibold text-stone-700">{field.phone || "মোবাইল নম্বর যোগ করা হয়নি"}</p>
        </div>
        <span className={`inline-flex min-w-20 flex-col items-center rounded-2xl p-3 text-center text-sm font-black ${cropVisual.color}`}>
          <span aria-hidden="true" className="text-4xl leading-none">{cropVisual.emoji}</span>
          <span className="mt-1">{field.crop}</span>
        </span>
      </div>

      <div className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black ${visualStatus.className}`}>
        <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${style.pulse}`} />
        {visualStatus.label}
        {field.status === "stock" && ` • ${formatNumber(field.stockMaund)} মণ`}
        {field.status === "ripening" && ` • ${toBanglaNum(field.harvestDays || 0)} দিন পর`}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#FAF7F2] p-3">
          <dt className="text-sm font-semibold text-stone-600">জমির পরিমাণ</dt>
          <dd className="mt-1 text-2xl font-black text-stone-900">{formatNumber(field.areaBigha)} বিঘা <span className="text-base">/ {formatNumber(acreage, 2)} একর</span></dd>
        </div>
        <div className="rounded-xl bg-[#FAF7F2] p-3">
          <dt className="text-sm font-semibold text-stone-600">বর্তমান ফসল ও জাত</dt>
          <dd className="mt-1 text-xl font-black text-stone-900">{field.crop} <span className="text-sm font-semibold text-stone-600">({field.variety || "জাত উল্লেখ নেই"})</span></dd>
        </div>
        <div className="rounded-xl bg-[#FAF7F2] p-3">
          <dt className="text-sm font-semibold text-stone-600">সম্ভাব্য উৎপাদন</dt>
          <dd className="mt-1 text-2xl font-black text-emerald-900">{formatNumber(field.estimatedMaund)} মণ</dd>
        </div>
        <div className="rounded-xl bg-[#FAF7F2] p-3">
          <dt className="text-sm font-semibold text-stone-600">বর্তমান বিক্রয়যোগ্য মজুত</dt>
          <dd className="mt-1 text-2xl font-black text-amber-800">{formatNumber(field.stockMaund)} মণ</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-stone-600">
        <CalendarDays className="h-4 w-4 text-emerald-800" /> {getSeasonLabel(field.season)}
      </p>
      <div className="mt-5 space-y-3">
        <BanglaAudioButton field={field} />
        <div className="grid gap-3 sm:grid-cols-2">
          <a href={`tel:${businessPhone}`} className="btn min-h-16 rounded-2xl border-none bg-emerald-800 px-3 text-base font-black text-white shadow-md hover:bg-emerald-900 lg:text-lg">
            <Phone className="h-6 w-6" /> 📞 সরাসরি কল করুন
          </a>
          <a href={voiceMessageUrl} target="_blank" rel="noreferrer" className="btn min-h-16 rounded-2xl border-2 border-emerald-800 bg-white px-3 text-base font-black text-emerald-950 hover:bg-emerald-50 lg:text-lg">
            <Mic className="h-6 w-6" /> 🎤 WhatsApp ভয়েস মেসেজ পাঠান
          </a>
        </div>
        <p className="text-sm font-semibold text-stone-600">WhatsApp খুললে মাইক আইকনে চাপ দিয়ে আপনার ভয়েস মেসেজ রেকর্ড করে পাঠান।</p>
        <div className="flex flex-wrap gap-3">
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-bold text-emerald-900 hover:bg-emerald-100"><MessageCircle className="h-4 w-4" /> কৃষককে WhatsApp করুন</a>}
          <Link to="/erp" state={{ cropField: field }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-100 px-4 text-sm font-bold text-amber-950 hover:bg-amber-200">
            <ArrowUpRight className="h-4 w-4" /> ERP-তে এন্ট্রি করুন
          </Link>
        </div>
      </div>
    </aside>
  );
}

function UnionAgentQuickLog({ fields }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    farmerName: "",
    phone: "",
    village: "",
    union: "",
    crop: "সরিষা",
    areaBigha: "1",
    estimatedMaund: "0",
    stockMaund: "0",
    weeklyHarvestMaund: "0",
    status: "stock",
    season: "rabi",
    variety: "",
    harvestDays: "0",
  });
  const mutation = useMutation({
    mutationFn: saveCropField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cropFields"] });
      setFeedback("কৃষক ও ফসলের তথ্য ERP মাঠের রেকর্ডে সংরক্ষণ হয়েছে।");
      setSelectedFieldId("");
      setForm({
        farmerName: "",
        phone: "",
        village: "",
        union: "",
        crop: "সরিষা",
        areaBigha: "1",
        estimatedMaund: "0",
        stockMaund: "0",
        weeklyHarvestMaund: "0",
        status: "stock",
        season: "rabi",
        variety: "",
        harvestDays: "0",
      });
    },
  });
  const updateForm = (key, value) => {
    setFeedback("");
    setForm((current) => ({ ...current, [key]: value }));
  };
  const selectFarmer = (id) => {
    setSelectedFieldId(id);
    setFeedback("");
    const field = fields.find((item) => item.id === id);
    if (field) {
      setForm({
        ...field,
        areaBigha: String(field.areaBigha ?? "1"),
        estimatedMaund: String(field.estimatedMaund ?? "0"),
        stockMaund: String(field.stockMaund ?? "0"),
        weeklyHarvestMaund: String(field.weeklyHarvestMaund ?? "0"),
      });
      return;
    }
    setForm((current) => ({
      ...current,
      farmerName: "",
      phone: "",
      village: "",
      union: "",
      areaBigha: "1",
      estimatedMaund: "0",
      stockMaund: "0",
      weeklyHarvestMaund: "0",
      status: "stock",
    }));
  };
  const submitLog = (event) => {
    event.preventDefault();
    const field = fields.find((item) => item.id === selectedFieldId);
    mutation.mutate({
      ...form,
      id: field?.id,
      season: form.season || field?.season || "rabi",
      harvestDays: Number(form.harvestDays || 0),
    });
  };
  const inputClass = "input input-bordered min-h-12 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15";
  const labelClass = "block space-y-1.5 text-sm font-extrabold text-stone-800";

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-emerald-900/15 bg-white shadow-sm" aria-labelledby="union-agent-heading">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="union-agent-quick-log"
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-16 w-full items-center justify-between gap-3 bg-emerald-950 px-5 py-4 text-left text-lg font-black text-white transition hover:bg-emerald-900 sm:px-7"
      >
        <span id="union-agent-heading">🧑‍🌾 ইউনিয়ন প্রতিনিধি (Field Agent) দ্রুত এন্ট্রি</span>
        <span aria-hidden="true" className="rounded-lg bg-white/10 px-3 py-1 text-sm">{isOpen ? "− বন্ধ করুন" : "+ খুলুন"}</span>
      </button>
      {isOpen && (
        <form id="union-agent-quick-log" onSubmit={submitLog} className="space-y-4 bg-[#FAF7F2] p-5 sm:p-7">
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold leading-relaxed text-amber-950">
            কৃষকের কথামতো ফসলের প্রস্তুতি বা গোলার মজুত লিখুন। এই তথ্য স্থানীয় ERP-তে সংরক্ষিত হবে এবং মালিক পরে যাচাই করতে পারবেন।
          </p>
          <label className={labelClass}>
            আগের কৃষকের রেকর্ড (ঐচ্ছিক)
            <select value={selectedFieldId} onChange={(event) => selectFarmer(event.target.value)} className="select select-bordered min-h-12 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">
              <option value="">নতুন কৃষক / নতুন জমির রেকর্ড</option>
              {fields.map((field) => <option key={field.id} value={field.id}>{field.farmerName} • {field.village} • {field.crop}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={labelClass}>কৃষকের নাম *<input required value={form.farmerName} onChange={(event) => updateForm("farmerName", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>মোবাইল নম্বর<input type="tel" value={form.phone || ""} onChange={(event) => updateForm("phone", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>গ্রাম / পাড়া *<input required value={form.village} onChange={(event) => updateForm("village", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>ইউনিয়ন / এলাকা<input value={form.union || ""} onChange={(event) => updateForm("union", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>ফসল *<select value={form.crop} onChange={(event) => updateForm("crop", event.target.value)} className="select select-bordered min-h-12 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">{CROP_OPTIONS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></label>
            <label className={labelClass}>ফসলের অবস্থা *<select value={form.status} onChange={(event) => updateForm("status", event.target.value)} className="select select-bordered min-h-12 w-full rounded-xl border-2 border-stone-300 bg-white text-base font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15">{CROP_STATUS_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
            <label className={labelClass}>জমির পরিমাণ (বিঘা) *<input required type="number" min="0.1" step="0.1" value={form.areaBigha} onChange={(event) => updateForm("areaBigha", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>সম্ভাব্য উৎপাদন (মণ)<input type="number" min="0" step="0.1" value={form.estimatedMaund} onChange={(event) => updateForm("estimatedMaund", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>গোলায় বিক্রয়যোগ্য মজুত (মণ)<input type="number" min="0" step="0.1" value={form.stockMaund} onChange={(event) => updateForm("stockMaund", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>এই সপ্তাহে কাটা হচ্ছে (মণ)<input type="number" min="0" step="0.1" value={form.weeklyHarvestMaund} onChange={(event) => updateForm("weeklyHarvestMaund", event.target.value)} className={inputClass} /></label>
          </div>
          {mutation.isError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">তথ্য সংরক্ষণ হয়নি। নাম, গ্রাম, জমির পরিমাণ ও ওজন যাচাই করে আবার চেষ্টা করুন।</p>}
          {feedback && <p role="status" className="rounded-xl bg-emerald-100 p-3 text-sm font-bold text-emerald-950">{feedback}</p>}
          <button type="submit" disabled={mutation.isPending} className="btn min-h-14 w-full rounded-xl border-none bg-emerald-800 text-base font-black text-white shadow-md hover:bg-emerald-900">
            {mutation.isPending ? "সংরক্ষণ হচ্ছে..." : selectedFieldId ? "কৃষকের ফসল ও মজুত আপডেট করুন" : "নতুন কৃষকের তথ্য দ্রুত সেভ করুন"}
          </button>
        </form>
      )}
    </section>
  );
}

export default function CropMap() {
  const { data: fields = [], isLoading, isError } = useQuery({ queryKey: ["cropFields"], queryFn: getCropFields });
  const [season, setSeason] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("map");
  const [selectedId, setSelectedId] = useState("");

  const visibleFields = useMemo(() => fields.filter((field) => {
    const matchesSeason = season === "all" || field.season === season;
    const matchesStatus = statusFilter === "all" ||
      field.status === statusFilter ||
      (statusFilter === "soon" && ["ripening", "growing"].includes(field.status));
    return matchesSeason && matchesStatus;
  }), [fields, season, statusFilter]);
  const selectedField = visibleFields.find((field) => field.id === selectedId) ?? visibleFields[0] ?? null;
  const farmersCount = new Set(fields.map((field) => field.farmerName.trim()).filter(Boolean)).size;
  const totalArea = fields.reduce((sum, field) => sum + Number(field.areaBigha || 0), 0);
  const totalStock = fields.reduce((sum, field) => sum + Number(field.stockMaund || 0), 0);
  const weeklyHarvest = fields.reduce((sum, field) =>
    sum + (field.status === "harvesting" ? Number(field.weeklyHarvestMaund || 0) : 0), 0);
  const selectField = (id) => setSelectedId(id);
  const statusBadge = (field) => {
    const visualStatus = getVisualStatus(field);
    return <span className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${visualStatus.className}`}>{visualStatus.label}</span>;
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-lg font-bold text-emerald-900">ফসল ও কৃষকের মাঠের তথ্য লোড হচ্ছে...</div>;
  }
  if (isError) {
    return <div role="alert" className="mx-auto max-w-7xl px-4 py-16 text-center text-lg font-bold text-red-700">ফসলের মাঠের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।</div>;
  }

  return (
    <main className="w-full space-y-7 px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
      <header className="flex flex-col justify-between gap-5 rounded-3xl border-2 border-stone-200 bg-linear-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#EAE5D9] p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/80 px-3.5 py-1.5 text-sm font-bold text-emerald-950">
            <MapPinned className="h-4 w-4" /> কৃষকের মাঠ থেকে সরাসরি সংগ্রহ পরিকল্পনা
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            🗺️ লাইভ ফসল ও কৃষক মাঠ ম্যাপ
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-700 lg:text-lg">
            কোন গ্রামে কী ফসল হচ্ছে, কখন কাটা হবে এবং কৃষকের গোলায় কত মজুত আছে—এক নজরে দেখুন।
          </p>
        </div>
        <Link to="/erp" className="btn min-h-14 self-start rounded-2xl border-none bg-emerald-800 px-6 text-lg font-black text-white shadow-md hover:bg-emerald-900 lg:self-center">
          <Sprout className="h-5 w-5" /> কৃষকের জমি যোগ করুন
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="মৌসুমের সারাংশ">
        {[
          { label: "মোট নিবন্ধিত কৃষক", value: `${toBanglaNum(farmersCount)} জন`, icon: <Tractor className="h-5 w-5" />, color: "text-emerald-900" },
          { label: "মোট আবাদকৃত জমি", value: `${formatNumber(totalArea)} বিঘা`, icon: <MapPinned className="h-5 w-5" />, color: "text-stone-900" },
          { label: "গোলায় বিক্রয়যোগ্য মজুত", value: `${formatNumber(totalStock)} মণ`, icon: <PackageCheck className="h-5 w-5" />, color: "text-amber-800" },
          { label: "এই সপ্তাহে কাটা হচ্ছে", value: `${formatNumber(weeklyHarvest)} মণ`, icon: <Wheat className="h-5 w-5" />, color: "text-emerald-900" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-stone-600">{item.label}</p>
              <span className="rounded-xl bg-[#FAF7F2] p-2 text-emerald-800">{item.icon}</span>
            </div>
            <p className={`mt-2 text-2xl font-black sm:text-3xl ${item.color}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <UnionAgentQuickLog fields={fields} />

      <section className="space-y-4 rounded-3xl border border-stone-200 bg-[#FAF7F2] p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2">
            <label className="space-y-2 text-base font-extrabold text-stone-800 lg:text-lg">
              কৃষি মৌসুম
              <select value={season} onChange={(event) => setSeason(event.target.value)} className="select select-bordered min-h-14 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 text-base font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15 lg:text-lg">
                {SEASON_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-base font-extrabold text-stone-800 lg:text-lg">
              ফসলের অবস্থা
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="select select-bordered min-h-14 w-full rounded-2xl border-2 border-stone-300 bg-white px-4 text-base font-bold text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-800/15 lg:text-lg">
                {CROP_STATUS_FILTERS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="grid w-full grid-cols-1 gap-1 rounded-xl border border-stone-200 bg-white p-1 sm:grid-cols-3 xl:w-auto" role="tablist" aria-label="মাঠের ভিউ">
            <button type="button" role="tab" aria-selected={view === "map"} onClick={() => setView("map")} className={`btn min-h-12 rounded-xl border-none px-3 text-base font-extrabold lg:text-lg ${view === "map" ? "bg-emerald-800 text-white" : "bg-white text-stone-700"}`}>
              🗺️ মাঠের ম্যাপ ভিউ
            </button>
            <button type="button" role="tab" aria-selected={view === "google"} onClick={() => setView("google")} className={`btn min-h-12 rounded-xl border-none px-3 text-base font-extrabold lg:text-lg ${view === "google" ? "bg-emerald-800 text-white" : "bg-white text-stone-700"}`}>
              <Satellite className="h-5 w-5 shrink-0" /> 🛰️ আসল গুগল ম্যাপ
            </button>
            <button type="button" role="tab" aria-selected={view === "list"} onClick={() => setView("list")} className={`btn min-h-12 rounded-xl border-none px-3 text-base font-extrabold lg:text-lg ${view === "list" ? "bg-emerald-800 text-white" : "bg-white text-stone-700"}`}>
              📋 কৃষক তালিকা ভিউ
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-stone-600">
          <span>{toBanglaNum(visibleFields.length)}টি জমি দেখানো হচ্ছে</span>
          <span className="hidden items-center gap-2 sm:inline-flex"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-600" /> স্থানীয় কৃষক তথ্য</span>
        </div>

        {visibleFields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-lg font-extrabold text-stone-900">এই ফিল্টারে কোনো জমির তথ্য নেই</p>
            <p className="mt-1 text-stone-600">মৌসুম বা ফসলের অবস্থা বদলে দেখুন।</p>
          </div>
        ) : view === "map" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
            <FieldMap fields={visibleFields} selectedId={selectedField?.id} onSelect={selectField} />
            <FarmerInspector field={selectedField} />
          </div>
        ) : view === "google" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
            <GoogleSatelliteMap field={selectedField} />
            <FarmerInspector field={selectedField} />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div className="divide-y divide-stone-100">
                {visibleFields.map((field) => {
                  const cropVisual = getCropVisual(field.crop);
                  return (
                    <article key={field.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${selectedField?.id === field.id ? "bg-emerald-50 ring-2 ring-inset ring-emerald-700" : ""}`}>
                      <button type="button" onClick={() => selectField(field.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-4xl ${cropVisual.color}`} aria-hidden="true">{cropVisual.emoji}</span>
                        <span className="min-w-0">
                          <span className="block text-xl font-black text-stone-900">{field.farmerName} <span className="text-base font-semibold text-stone-600">• {field.village}</span></span>
                          <span className="mt-1 block text-base font-semibold text-stone-700 lg:text-lg">{field.crop} • {formatNumber(field.areaBigha)} বিঘা • {formatNumber(field.estimatedMaund)} মণ সম্ভাব্য</span>
                          <span className="mt-2 block">{statusBadge(field)}</span>
                        </span>
                      </button>
                      <BanglaAudioButton field={field} compact />
                    </article>
                  );
                })}
              </div>
            </div>
            <FarmerInspector field={selectedField} />
          </div>
        )}
      </section>
      <FarmerDirectHub />
      <p className="pb-2 text-center text-xs text-stone-500">তথ্য মালিকের ERP-তে সংরক্ষিত স্থানীয় মাঠ-রেকর্ড থেকে দেখানো হচ্ছে • যোগাযোগ: +{APP_CONFIG.whatsappNumber}</p>
    </main>
  );
}
