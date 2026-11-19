import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Factory, Truck, Store, House, MessageCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_CONFIG } from "../../constants/appConfig";
import { ROUTES } from "../../constants/routePaths";
import CustomButton from "../../common/Button/CustomButton";
import { toBanglaNum } from "../../utils/formatBanglaNumber";

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isFarmerFormOpen, setIsFarmerFormOpen] = useState(false);
  const [farmer, setFarmer] = useState({ name: "", village: "", crop: "", quantity: "" });

  const contentVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const contentGroupVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const stepGroupVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const steps = [
    { icon: Store, title: "১. সাপ্তাহিক হাট", desc: "প্রতিদিন হাট থেকে সেরা সরিষা, তিল, গম ও ধান সংগ্রহ" },
    { icon: Factory, title: "২. নিজস্ব মিল", desc: "সপ্তাহে ২ দিন সরিষা ভাঙানো ও নিজস্ব ধান-গম মিলিং" },
    { icon: ShieldCheck, title: "৩. গোডাউন মান যাচাই", desc: "১০০% নির্ভেজাল ও বাছাইকৃত শস্য সংরক্ষণ" },
    { icon: Truck, title: "৪. সরাসরি সরবরাহ", desc: "৭ নিয়মিত দোকান, খামারি ও সরকারি অফিসে ডেলিভারি" },
  ];

  const stepDetails = [
    {
      detail: "আজকের হাট সংগ্রহ: দেশি মাঘী সরিষা (৳৩,৬০০/মণ), তিল (৳৫,৫০০/মণ) ও ধান (৳১,৪৫০/মণ)",
      action: (
        <div className="flex flex-wrap gap-2">
          <Link to="/?category=oil-seeds#catalog" className="btn btn-sm border-emerald-200 bg-white font-bold text-emerald-900 hover:bg-emerald-50">তেল ও তৈলবীজ দেখুন</Link>
          <Link to="/?category=grains#products" className="btn btn-sm border-stone-200 bg-white font-bold text-stone-800 hover:bg-amber-50">ধান-চাল-গম দেখুন</Link>
        </div>
      ),
    },
    {
      detail: "পরবর্তী সরিষা মিলিং: আগামীকাল সকাল ৮টা • খাঁটি সরিষার তেল (৳২৬০/লিটার) ও খৈল (৳৫২/কেজি)",
      action: <a href="#catalog" className="btn btn-sm border-emerald-200 bg-white font-bold text-emerald-900 hover:bg-emerald-50">আজকের পণ্য দেখুন</a>,
    },
    {
      detail: "ডিজিটাল পাল্লায় ১ মণ = ৪০ কেজি নিশ্চিত ও আর্দ্রতা যাচাইকৃত শুকনো শস্য",
      action: <Link to={ROUTES.WHOLESALE} className="btn btn-sm border-emerald-200 bg-white font-bold text-emerald-900 hover:bg-emerald-50">পাইকারি অর্ডার দেখুন</Link>,
    },
    {
      detail: "নিয়মিত দোকান ও খামারে সরাসরি ডেলিভারি সুবিধা",
      action: (
        <a
          href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent("আসসালামু আলাইকুম, দোকান/খামারে সরাসরি ডেলিভারি সম্পর্কে জানতে চাই।")}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm border-none bg-emerald-800 font-bold text-white hover:bg-emerald-900"
        >
          <MessageCircle className="h-4 w-4" /> ডেলিভারি নিয়ে কথা বলুন
        </a>
      ),
    },
  ];

  const handleFarmerSubmit = (event) => {
    event.preventDefault();
    const quantity = Number(farmer.quantity);
    if (!farmer.name.trim() || !farmer.village.trim() || !farmer.crop.trim() || !Number.isFinite(quantity) || quantity <= 0) return;
    const message = [
      `আসসালামু আলাইকুম, আমি ${farmer.name.trim()}।`,
      `গ্রাম/এলাকা: ${farmer.village.trim()}`,
      `ফসল: ${farmer.crop.trim()}`,
      `পরিমাণ: ${toBanglaNum(quantity)} মণ`,
      "বাড়ি থেকে সরাসরি ফসল সংগ্রহ ও ন্যায্য দামের বিষয়ে যোগাযোগ করতে চাই।",
    ].join("\n");
    window.open(`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setIsFarmerFormOpen(false);
  };

  return (
    <section className="border-b border-stone-200 bg-linear-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#E8EFEA] py-12 text-stone-900 sm:py-16">
      <div className="grid w-full items-center gap-10 px-4 sm:px-8 lg:grid-cols-2 lg:px-12 xl:px-16">
        <motion.div
          variants={contentGroupVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={contentVariants} className="badge mb-4 border-amber-300 bg-amber-100 p-3 text-base font-extrabold text-amber-950 lg:text-lg">
            🌾 কৃষকের উঠান ও নিজস্ব মিল থেকে সরাসরি
          </motion.span>
          <motion.h1 variants={contentVariants} className="text-4xl font-black leading-[1.15] text-stone-900 sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
            ভেজালমুক্ত খাঁটি সরিষার তেল ও বাছাইকৃত শস্য—{" "}
            <span className="text-emerald-800 underline decoration-amber-500 decoration-4 underline-offset-8">সরাসরি আমাদের মিল থেকে</span>
          </motion.h1>
          <motion.p variants={contentVariants} className="mt-5 text-xl leading-relaxed text-stone-700 md:text-2xl lg:text-3xl">
            বাজারের পুরনো বা ভেজাল তেল-শস্য আর নয়। প্রতি সপ্তাহে ২ দিন নিজস্ব ঘানিতে ভাঙানো তাজা সরিষার তেল, চাল-ডাল থেকে শুরু করে খামারের জন্য সেরা মানের ভুট্টা, গম ও সরিষার খৈল—সবই পাচ্ছেন মধ্যস্বত্বভোগী ছাড়া ন্যায্য দামে। ঘরের জন্য খুচরা হোক কিংবা দোকান ও খামারের জন্য মণ হিসেবে পাইকারি—আজই অর্ডার করুন।
          </motion.p>
          <motion.div variants={contentVariants} className="mt-6 flex flex-wrap gap-3">
            <motion.a href="#catalog" whileTap={{ scale: 0.96 }}>
              <CustomButton variant="gold" className="px-7 py-4 text-lg font-extrabold lg:text-xl">পণ্য ও পাইকারি রেট দেখুন</CustomButton>
            </motion.a>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link to={ROUTES.ERP}>
                <CustomButton variant="outline" className="border-emerald-800 px-7 py-4 text-lg font-extrabold text-emerald-900 hover:bg-emerald-800 hover:text-white lg:text-xl">
                  মালিকের ডিজিটাল খাতা (ERP)
                </CustomButton>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            variants={contentVariants}
            className="mt-7 grid grid-cols-1 gap-3 border-t border-stone-300/80 pt-5 sm:grid-cols-3"
          >
            {[
              ["১৬+", "খাঁটি শস্য ও পণ্য"],
              ["সপ্তাহে ২ দিন", "তাজা মিলিং"],
              ["১০০%", "ভেজালমুক্ত গ্যারান্টি"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/70 px-3 py-3 shadow-sm sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
                <p className="text-lg font-black text-emerald-900 lg:text-xl">{value}</p>
                <p className="text-sm font-semibold text-stone-600 lg:text-base">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div>
          <motion.div
            variants={stepGroupVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            role="tablist"
            aria-label="আমাদের সরবরাহ প্রক্রিয়া"
          >
            {steps.map((s, idx) => (
              <motion.button
                key={idx}
                type="button"
                role="tab"
                aria-selected={activeStep === idx}
                aria-controls="supply-step-detail"
                onClick={() => setActiveStep(idx)}
                variants={contentVariants}
                whileHover={{ y: -4, boxShadow: "0 16px 36px rgba(41, 37, 36, 0.12)" }}
                whileTap={{ scale: 0.99 }}
                className={`rounded-2xl border bg-white p-6 text-left text-base shadow-md transition-all ${
                  activeStep === idx
                    ? "border-emerald-700 ring-2 ring-emerald-800/15"
                    : "border-stone-200 hover:border-amber-300 hover:shadow-lg"
                }`}
              >
                <span className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${activeStep === idx ? "bg-emerald-100" : "bg-emerald-50"}`}>
                  <s.icon className="h-7 w-7 text-emerald-800" />
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 lg:text-2xl">{s.title}</h3>
                <p className="mt-1 text-lg text-stone-600 lg:text-xl">{s.desc}</p>
              </motion.button>
            ))}
          </motion.div>
          <motion.div
            key={activeStep}
            id="supply-step-detail"
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-base font-semibold leading-relaxed text-stone-800 lg:text-lg">{stepDetails[activeStep].detail}</p>
            {stepDetails[activeStep].action}
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-4 mt-10 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:mx-8 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:mx-12 xl:mx-16"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <House className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 lg:text-2xl">
              কৃষকের বাড়ি থেকে সরাসরি সংগ্রহ
            </h2>
            <p className="mt-1 text-lg leading-relaxed text-stone-600">
              আপনিও আপনার উৎপাদিত ফসল ন্যায্য দামে আমাদের কাছে বিক্রি করতে সরাসরি যোগাযোগ করুন।
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsFarmerFormOpen(true)}
          className="btn shrink-0 border-none bg-emerald-800 px-5 text-lg font-extrabold text-white hover:bg-emerald-900"
        >
          <MessageCircle className="h-5 w-5" />
          ফসল বিক্রির কথা বলুন
        </button>
      </motion.div>

      <AnimatePresence>
        {isFarmerFormOpen && (
          <motion.div
            className="fixed inset-0 z-70 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsFarmerFormOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="farmer-quick-sell-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-xl rounded-3xl border border-stone-200 bg-[#FAF7F2] p-5 shadow-2xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 id="farmer-quick-sell-title" className="text-2xl font-black text-stone-900">ফসল বিক্রির তথ্য দিন</h2>
                  <p className="mt-1 text-sm text-stone-600">তথ্য পূরণ করলে WhatsApp-এ প্রস্তুত বার্তা খুলবে।</p>
                </div>
                <button type="button" onClick={() => setIsFarmerFormOpen(false)} aria-label="ফর্ম বন্ধ করুন" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-600 hover:bg-stone-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleFarmerSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5 text-sm font-bold text-stone-700">
                    কৃষকের নাম
                    <input required autoFocus value={farmer.name} onChange={(event) => setFarmer({ ...farmer, name: event.target.value })} className="input input-bordered w-full border-stone-300 bg-white text-base" placeholder="আপনার নাম" />
                  </label>
                  <label className="block space-y-1.5 text-sm font-bold text-stone-700">
                    গ্রাম / এলাকা
                    <input required value={farmer.village} onChange={(event) => setFarmer({ ...farmer, village: event.target.value })} className="input input-bordered w-full border-stone-300 bg-white text-base" placeholder="গ্রাম বা এলাকার নাম" />
                  </label>
                  <label className="block space-y-1.5 text-sm font-bold text-stone-700">
                    ফসলের নাম
                    <input required value={farmer.crop} onChange={(event) => setFarmer({ ...farmer, crop: event.target.value })} className="input input-bordered w-full border-stone-300 bg-white text-base" placeholder="যেমন: সরিষা, ধান, ভুট্টা" />
                  </label>
                  <label className="block space-y-1.5 text-sm font-bold text-stone-700">
                    পরিমাণ (মণ)
                    <input required type="number" min="0.01" step="0.01" value={farmer.quantity} onChange={(event) => setFarmer({ ...farmer, quantity: event.target.value })} className="input input-bordered w-full border-stone-300 bg-white text-base" placeholder="যেমন: ১০" />
                  </label>
                </div>
                <button type="submit" className="btn w-full border-none bg-emerald-800 text-base font-extrabold text-white shadow-lg hover:bg-emerald-900">
                  <MessageCircle className="h-5 w-5" /> WhatsApp-এ ফসল বিক্রির প্রস্তাব পাঠান
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}