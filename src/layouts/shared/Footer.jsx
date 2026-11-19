import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Clock,
  Factory,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { APP_CONFIG } from "../../constants/appConfig";
import { ROUTES } from "../../constants/routePaths";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-300 bg-[#F3EFE6] text-stone-800">
      <div className="grid w-full grid-cols-1 gap-8 px-4 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12 xl:px-16">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl" aria-hidden="true">🌾</span>
            <div>
              <h3 className="text-3xl font-black leading-none text-emerald-900">
                {APP_CONFIG.brandName}
              </h3>
              <p className="mt-1 text-sm font-medium text-stone-600">{APP_CONFIG.brandEnglish}</p>
            </div>
          </div>
          <p className="text-lg leading-relaxed text-stone-700">
            “{APP_CONFIG.tagline}” — সরাসরি সাপ্তাহিক হাট থেকে সংগৃহীত ও নিজস্ব মিলে ভাঙানো ১০০% খাঁটি সরিষার তেল, চাল, আটা, গোখাদ্য ও সরকারি ধানের বীজ সরবরাহকারী প্রতিষ্ঠান।
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-base font-semibold text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-800" /> বিএসটিআই ও মানসম্মত মিল প্রসেসিং
          </div>
        </div>

        <div>
          <h4 className="mb-4 border-b border-stone-300 pb-2 text-xl font-extrabold text-stone-900 lg:text-2xl">
            প্রয়োজনীয় লিংক
          </h4>
          <ul className="space-y-2.5 text-lg">
            <li>
              <Link to={ROUTES.HOME} className="text-stone-700 transition-colors hover:text-emerald-900">
                → আজকের বাজার ও পণ্য ক্যাটালগ
              </Link>
            </li>
            <li>
              <Link to={ROUTES.WHOLESALE} className="text-stone-700 transition-colors hover:text-emerald-900">
                → খামারি ও সরকারি বীজ পোর্টাল
              </Link>
            </li>
            <li>
              <Link to={ROUTES.ERP} className="text-stone-700 transition-colors hover:text-emerald-900">
                → মালিকের ডিজিটাল খাতা (ERP)
              </Link>
            </li>
            <li>
              <Link to={`${ROUTES.HOME}#rate-alert`} className="text-stone-700 transition-colors hover:text-emerald-900">
                → সাপ্তাহিক হাট ও মিলের দর আপডেট
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 border-b border-stone-300 pb-2 text-xl font-extrabold text-stone-900 lg:text-2xl">
            মিল ও সরবরাহ সূচি
          </h4>
          <ul className="space-y-2.5 text-lg text-stone-700">
            <li className="flex items-start gap-2">
              <Factory className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
              <span>সরিষা মিলিং: সপ্তাহে ২ দিন (তাজা তেল ও খৈল উৎপাদন)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
              <span>দোকান ও গোডাউন: প্রতিদিন সকাল ৭টা – রাত ৯টা</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
              <span>নিজস্ব রাইস-গম মিল, সরিষা মিল ও প্রধান গোডাউন</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="mb-4 border-b border-stone-300 pb-2 text-xl font-extrabold text-stone-900 lg:text-2xl">
            সরাসরি অর্ডার ও যোগাযোগ
          </h4>
          <p className="flex items-center gap-2 text-lg text-stone-700">
            <Phone className="h-4 w-4 text-emerald-800" />
            <span>+{APP_CONFIG.whatsappNumber}</span>
          </p>
          <p className="text-lg leading-relaxed text-stone-600">
            পাইকারি মণ/টন অর্ডার বা নিয়মিত দোকানে তেল সরবরাহের জন্য সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন:
          </p>
          <motion.a
            href={`https://wa.me/${APP_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.96 }}
            className="btn w-full border-none bg-emerald-800 text-lg font-extrabold text-white hover:bg-emerald-900"
          >
            <MessageCircle className="h-5 w-5" /> WhatsApp-এ কথা বলুন
          </motion.a>
          <Link
            to={`${ROUTES.HOME}#rate-alert`}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-100 px-4 text-base font-extrabold text-amber-950 transition hover:bg-amber-200"
          >
            📲 সাপ্তাহিক দর আপডেট নিন
          </Link>
        </div>
      </div>

      <div className="border-t border-stone-300 bg-stone-200/70 px-4 py-4 text-center text-sm text-stone-700">
        <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row sm:px-4 lg:px-12 xl:px-16">
          <p>
            © ২০২৬ <span className="font-bold text-emerald-900">{APP_CONFIG.brandEnglish}</span> — সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p>খুচরা (কেজি/লিটার) • পাইকারি (মণ/টন) • ডিজিটাল মিল ব্যবস্থাপনা</p>
        </div>
      </div>
    </footer>
  );
}
