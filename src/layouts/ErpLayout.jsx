import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Store,
  ArrowLeft,
  ShieldCheck,
  Factory,
  Printer,
} from "lucide-react";
import { APP_CONFIG } from "../constants/appConfig";
import { ROUTES } from "../constants/routePaths";

export default function ErpLayout() {
  const location = useLocation();

  const handlePrintPage = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-emerald-950">
      {/* টপ অ্যাডমিন ও ডিজিটাল খাতা নেভবার */}
      <header className="sticky top-0 z-40 border-b-2 border-amber-200 bg-emerald-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* ব্র্যান্ড ও ERP ব্যাজ */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-xl font-extrabold text-emerald-950 shadow">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold leading-none text-amber-400 md:text-xl">
                  {APP_CONFIG.brandName}
                </span>
                <span className="badge badge-sm border-amber-200 bg-emerald-800 font-semibold text-amber-400">
                  মালিকের ডিজিটাল খাতা ERP
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                ব্রাউজার অটো-সেভ সক্রিয় (হাট তহবিল, মিল ও ৭ দোকান লেজার)
              </p>
            </div>
          </div>

          {/* ডানপাশের অ্যাকশন বাটনসমূহ */}
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={handlePrintPage}
              whileTap={{ scale: 0.96 }}
              className="btn btn-sm hidden border-amber-200 bg-emerald-800 text-white hover:bg-emerald-700 sm:inline-flex"
            >
              <Printer className="h-4 w-4 text-amber-400" /> খাতা প্রিন্ট
            </motion.button>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to={ROUTES.WHOLESALE}
                className="btn btn-sm hidden border-amber-200 bg-emerald-800 text-amber-400 hover:bg-emerald-700 md:inline-flex"
              >
                <Factory className="w-4 h-4" /> পাইকারি পোর্টাল
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to={ROUTES.HOME}
                className="btn btn-sm border-none bg-amber-500 font-bold text-emerald-950 hover:bg-amber-400"
              >
                <ArrowLeft className="w-4 h-4" /> ক্রেতা ওয়েবসাইটে ফিরুন
              </Link>
            </motion.div>
          </div>
        </div>

        {/* সাব-নেভিগেশন স্ট্যাটাস বার */}
        <div className="border-t border-emerald-700 bg-emerald-800 px-4 py-1.5 text-xs text-emerald-100">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 sm:px-2 lg:px-4">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              বর্তমান পাথ: <strong className="text-white">{location.pathname}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-amber-400" />
              নিয়মিত তেল সরবরাহ: হাবিল, সাহেবআলী, সর্বেশ, সোনামিয়া, সোবেদআলী, আয়বুল্লা ও কামরুল
            </span>
          </div>
        </div>
      </header>

      {/* ERP মেইন কন্টেন্ট এরিয়া */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ফুটার */}
      <footer className="border-t border-amber-200 bg-emerald-950 py-4 text-center text-sm text-emerald-100">
        {APP_CONFIG.brandEnglish} — ডিজিটাল হিসাবরক্ষণ ও মিল ব্যবস্থাপনা সিস্টেম
      </footer>
    </div>
  );
}