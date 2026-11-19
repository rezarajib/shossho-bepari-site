import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Scale, ShoppingBag, BookOpen } from "lucide-react";
import { ROUTES } from "../../constants/routePaths";
import { useCart } from "../../hooks/useCart";
import { toBanglaNum } from "../../utils/formatBanglaNumber";

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart, setIsDrawerOpen } = useCart();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200 bg-emerald-950 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:hidden">
      <div className="grid grid-cols-4 h-16 items-center text-[11px] font-semibold">
        {/* ১. হোম / বাজার */}
        <Link
          to={ROUTES.HOME}
          className={`flex flex-col items-center justify-center gap-1 h-full transition ${
            isActive(ROUTES.HOME)
              ? "border-t-2 border-amber-200 bg-emerald-900 text-amber-400"
              : "text-emerald-100 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>বাজার</span>
        </Link>

        {/* ২. পাইকারি (মণ/টন) */}
        <Link
          to={ROUTES.WHOLESALE}
          className={`flex flex-col items-center justify-center gap-1 h-full transition ${
            isActive(ROUTES.WHOLESALE)
              ? "border-t-2 border-amber-200 bg-emerald-900 text-amber-400"
              : "text-emerald-100 hover:text-white"
          }`}
        >
          <Scale className="w-5 h-5" />
          <span>পাইকারি</span>
        </Link>

        {/* ৩. অর্ডার ব্যাগ (Cart Drawer ট্রিগার) */}
        <motion.button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          whileTap={{ scale: 0.96 }}
          className="relative flex h-full flex-col items-center justify-center gap-1 text-emerald-100 transition hover:text-amber-400"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            {cart.length > 0 && (
              <span className="badge badge-xs absolute -right-2.5 -top-1.5 border-none bg-amber-500 px-1.5 font-extrabold text-emerald-950">
                {toBanglaNum(cart.length)}
              </span>
            )}
          </div>
          <span>অর্ডার ব্যাগ</span>
        </motion.button>

        {/* ৪. মালিকের ডিজিটাল খাতা (ERP) */}
        <Link
          to={ROUTES.ERP}
          className={`flex flex-col items-center justify-center gap-1 h-full transition ${
            isActive(ROUTES.ERP)
              ? "border-t-2 border-amber-200 bg-emerald-900 text-amber-400"
              : "text-emerald-100 hover:text-white"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>ডিজিটাল খাতা</span>
        </Link>
      </div>
    </nav>
  );
}