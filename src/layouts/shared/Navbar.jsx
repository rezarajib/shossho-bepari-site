import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Factory,
  MapPinned,
  Search,
  ShoppingBag,
  Truck,
  Wheat,
} from "lucide-react";
import { APP_CONFIG } from "../../constants/appConfig";
import { ROUTES } from "../../constants/routePaths";
import products from "../../data/products.json";
import { useCart } from "../../hooks/useCart";
import { formatTaka, toBanglaNum } from "../../utils/formatBanglaNumber";

const commodityCategories = [
  { id: "all", label: "সব শস্য ও পণ্য", icon: "🌾" },
  { id: "oil-seeds", label: "খাঁটি সরিষার তেল ও বীজ", icon: "🟡" },
  { id: "grains", label: "ধান, চাল ও গম", icon: "🌾" },
  { id: "livestock-feed", label: "খামারি গোখাদ্য", icon: "🌽" },
  { id: "pulses-cash-crops", label: "ডাল ও অর্থকরী ফসল", icon: "🫘" },
];

const getCategoryCount = (categoryId) => categoryId === "all"
  ? products.length
  : products.filter((product) => product.category === categoryId).length;

export default function Navbar() {
  const { cart, totalAmount, setIsDrawerOpen } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 20);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const isHome = pathname === ROUTES.HOME;
  const isWholesale = pathname === ROUTES.WHOLESALE;
  const isErp = pathname === ROUTES.ERP;
  const isCropMap = pathname === ROUTES.CROP_MAP;

  const focusCatalogSearch = () => {
    if (!isHome) {
      navigate(`${ROUTES.HOME}#catalog`);
      window.setTimeout(() => {
        document.getElementById("catalog-search")?.focus();
      }, 250);
      return;
    }

    document.getElementById("catalog-search")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.setTimeout(() => document.getElementById("catalog-search")?.focus(), 250);
  };

  const activeLinkClasses = "relative flex h-full items-center";
  const linkClasses = "relative whitespace-nowrap rounded-xl px-4 py-2.5 text-base font-extrabold text-stone-800 transition-all hover:bg-emerald-50/80 hover:text-emerald-900 2xl:text-[17px]";

  return (
    <>
      <div className="sticky top-0 z-50 overflow-x-clip">
        <motion.div
          animate={{
            boxShadow: isScrolled ? "0 6px 20px rgba(28, 25, 23, 0.10)" : "0 0 0 rgba(28, 25, 23, 0)",
            borderColor: isScrolled ? "rgba(231, 229, 228, 1)" : "rgba(231, 229, 228, 0)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="border-b border-stone-200/80 bg-[#FAF7F2]/95 text-stone-900 shadow-sm backdrop-blur-lg"
        >
          <div className="flex h-20 w-full flex-nowrap items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8 lg:h-24 lg:gap-6 lg:px-12 xl:gap-10 xl:px-16">
            <Link to={ROUTES.HOME} className="flex min-w-0 shrink items-center gap-3" aria-label={`${APP_CONFIG.brandName} - হোম`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-800 to-emerald-950 text-amber-300 shadow-md">
                <Wheat className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-2xl font-black leading-none text-emerald-950 sm:text-2xl lg:text-3xl">
                  {APP_CONFIG.brandName}
                </span>
                <span className="mt-1 hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-stone-600 sm:flex">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                  নিজস্ব মিল ও আড়ত
                </span>
              </span>
            </Link>

            <nav aria-label="প্রধান নেভিগেশন" className="hidden h-full min-w-0 items-center gap-1 2xl:flex 2xl:gap-2">
              <div
                ref={categoryMenuRef}
                className="relative flex h-full items-center"
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                <Link
                  to={`${ROUTES.HOME}#products`}
                  className={`${linkClasses} inline-flex items-center gap-1`}
                  aria-haspopup="true"
                  aria-expanded={categoryMenuOpen}
                  onFocus={() => setCategoryMenuOpen(true)}
                  onClick={() => setCategoryMenuOpen((open) => !open)}
                >
                  {isHome && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-xl bg-emerald-100"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">🌾 বাজার ও পণ্য</span>
                  <ChevronDown className={`relative z-10 h-4 w-4 transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`} />
                </Link>

                <AnimatePresence>
                  {categoryMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 top-[calc(100%-0.5rem)] z-50 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl"
                      role="menu"
                    >
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-500">পণ্য বিভাগ</p>
                      {commodityCategories.map((category) => (
                        <button
                          key={category.id}
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            setCategoryMenuOpen(false);
                            navigate(`${ROUTES.HOME}?category=${encodeURIComponent(category.id)}#products`);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-stone-800 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                        >
                          <span className="text-lg" aria-hidden="true">{category.icon}</span>
                          <span className="flex-1">{category.label}</span>
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-extrabold text-stone-600">{toBanglaNum(getCategoryCount(category.id))}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to={ROUTES.WHOLESALE} className={`${activeLinkClasses} ${linkClasses}`}>
                {isWholesale && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl bg-emerald-100"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative z-10">🐄 পাইকারি ও খামারি</span>
              </Link>
              <Link to={`${ROUTES.WHOLESALE}#industrial-procurement`} className={`${activeLinkClasses} ${linkClasses}`}>
                {isWholesale && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl bg-emerald-100"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative z-10">🏭 ইন্ডাস্ট্রিয়াল বাল্ক</span>
              </Link>
              <Link to={ROUTES.CROP_MAP} className={`${activeLinkClasses} ${linkClasses}`}>
                {isCropMap && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl bg-emerald-100"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  🗺️ লাইভ ফসল ম্যাপ
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  </span>
                </span>
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                to={`${ROUTES.HOME}#products`}
                aria-label="বাজার ও পণ্য"
                title="বাজার ও পণ্য"
                className="btn btn-square hidden h-12 min-h-0 w-12 rounded-xl border border-stone-300 bg-white text-emerald-900 hover:bg-emerald-50 lg:inline-flex 2xl:hidden"
              >
                <Wheat className="h-5 w-5" />
              </Link>
              <Link
                to={ROUTES.WHOLESALE}
                aria-label="পাইকারি ও খামারি"
                title="পাইকারি ও খামারি"
                className="btn btn-square hidden h-12 min-h-0 w-12 rounded-xl border border-stone-300 bg-white text-emerald-900 hover:bg-emerald-50 lg:inline-flex 2xl:hidden"
              >
                <Truck className="h-5 w-5" />
              </Link>
              <Link
                to={`${ROUTES.WHOLESALE}#industrial-procurement`}
                aria-label="ইন্ডাস্ট্রিয়াল বাল্ক প্রোকিউরমেন্ট ডেস্ক"
                title="ইন্ডাস্ট্রিয়াল বাল্ক প্রোকিউরমেন্ট ডেস্ক"
                className="btn btn-square h-12 min-h-0 w-10 rounded-xl border border-stone-300 bg-white text-emerald-900 hover:bg-emerald-50 sm:w-12 2xl:hidden"
              >
                <Factory className="h-5 w-5" />
              </Link>
              <Link
                to={ROUTES.CROP_MAP}
                aria-label="লাইভ ফসল ম্যাপ"
                title="লাইভ ফসল ম্যাপ"
                className={`btn btn-square h-12 min-h-0 w-10 rounded-xl border sm:w-12 2xl:hidden ${isCropMap ? "border-emerald-800 bg-emerald-800 text-white" : "border-stone-300 bg-white text-emerald-900 hover:bg-emerald-50"}`}
              >
                <MapPinned className="h-5 w-5" />
              </Link>
              <motion.button
                type="button"
                onClick={focusCatalogSearch}
                whileTap={{ scale: 0.94 }}
                aria-label="পণ্য খুঁজুন"
                className="btn btn-square btn-ghost hidden h-12 min-h-0 w-12 rounded-xl border border-stone-300 bg-white text-stone-700 transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 sm:inline-flex 2xl:hidden"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to={ROUTES.ERP}
                  className={`btn h-12 min-h-0 whitespace-nowrap rounded-xl border px-3 text-base font-extrabold transition-all hover:-translate-y-0.5 hover:bg-amber-50 sm:px-4 ${isErp ? "border-amber-500 bg-amber-100 text-stone-900" : "border-stone-300 bg-white/80 text-stone-800 hover:border-amber-300"}`}
                >
                  <span className="hidden sm:inline">📒 মালিকের খাতা (ERP)</span>
                  <span className="sm:hidden">খাতা</span>
                </Link>
              </motion.div>

              <a
                href="tel:+8801700000000"
                className="hidden h-12 items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-800 bg-emerald-800 px-4 text-base font-extrabold text-white transition-colors hover:bg-emerald-900 xl:inline-flex"
              >
                <span aria-hidden="true">📞</span> সরাসরি কল
              </a>

              <motion.button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                whileTap={{ scale: 0.95 }}
                aria-label={`অর্ডার ব্যাগ, ${toBanglaNum(cart.length)}টি পণ্য, ${formatTaka(totalAmount)}`}
                className="btn h-12 min-h-0 whitespace-nowrap rounded-xl border-amber-500 bg-amber-500 px-2.5 text-base font-bold text-stone-950 transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-400 sm:px-3 lg:text-lg"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <motion.span
                  key={cart.length}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="badge badge-sm border-none bg-white font-bold text-stone-950"
                >
                  {toBanglaNum(cart.length)}
                </motion.span>
                <span className="hidden xl:inline">অর্ডার ব্যাগ</span>
                {totalAmount > 0 && <span className="hidden 2xl:inline">{formatTaka(totalAmount)}</span>}
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </>
  );
}
