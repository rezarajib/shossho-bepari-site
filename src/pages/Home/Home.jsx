import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Mic, Search, X } from "lucide-react";
import { fetchProducts, fetchCategories } from "../../services/productService";
import { useCart } from "../../hooks/useCart";
import { toBanglaNum } from "../../utils/formatBanglaNumber";
import { matchesSupplyModel, SUPPLY_MODEL_FILTERS } from "../../utils/businessModels";
import HeroSection from "../../components/home/HeroSection";
import ProductCard from "../../common/Card/ProductCard";
import FarmFeedCalculator from "../../components/home/FarmFeedCalculator";
import FarmerDirectHub from "../../components/home/FarmerDirectHub";
import LiveMillBatchCard from "../../components/home/LiveMillBatchCard";
import WeeklyRateSubscription from "../../components/home/WeeklyRateSubscription";
import BatchTraceability from "../../components/home/BatchTraceability";
import MarketTrendBoard from "../../components/shared/MarketTrendBoard";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category") || "all";
  const selectedCategory = requestedCategory;
  const [search, setSearch] = useState("");
  const [supplyModel, setSupplyModel] = useState("all");
  const { addToCart } = useCart();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (requestedCategory !== "all") {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    } else if (requestedCategory === "all" && window.location.hash === "#products") {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [requestedCategory]);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "all", ""],
    queryFn: () => fetchProducts({ category: "all", search: "" }),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory, search],
    queryFn: () => fetchProducts({ category: selectedCategory, search }),
  });

  const productCounts = useMemo(
    () => Object.fromEntries([
      ["all", allProducts.length],
      ...categories
        .filter((cat) => cat.id !== "all")
        .map((cat) => [cat.id, allProducts.filter((product) => product.category === cat.id).length]),
    ]),
    [allProducts, categories],
  );
  const visibleProducts = useMemo(
    () => products.filter((product) => matchesSupplyModel(product, supplyModel)),
    [products, supplyModel],
  );
  const supplyModelCounts = useMemo(
    () => Object.fromEntries(SUPPLY_MODEL_FILTERS.map((filter) => [
      filter.id,
      allProducts.filter((product) => matchesSupplyModel(product, filter.id)).length,
    ])),
    [allProducts],
  );

  const selectCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId === "all") nextParams.delete("category");
    else nextParams.set("category", categoryId);
    setSearchParams(nextParams, { replace: true });
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert("এই ব্রাউজারে বাংলা ভয়েস সার্চ চালু নেই। দয়া করে লিখে পণ্য খুঁজুন।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setSearch(transcript);
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        window.alert("ভয়েস সার্চে সমস্যা হয়েছে। মাইক্রোফোনের অনুমতি যাচাই করুন অথবা লিখে খুঁজুন।");
      }
    };
    recognition.start();
  };

  return (
    <div>
      <HeroSection />
      <LiveMillBatchCard onOrder={() => {
        selectCategory("oil-seeds");
        window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 0);
      }} />
      <BatchTraceability onOrder={(categoryId) => {
        selectCategory(categoryId);
        window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 0);
      }} />
      <MarketTrendBoard />

      <section id="products" className="scroll-mt-24 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <span id="catalog" className="relative -top-24 block h-0" aria-hidden="true" />
        <div className="mb-6 flex flex-col items-start justify-between gap-5 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-emerald-950/5 px-3.5 py-1 text-sm font-bold tracking-wide text-emerald-900">
              ✨ সরাসরি মিল ও হাটের লাইভ মূল্যতালিকা
            </span>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 lg:text-4xl">
              আজকের হাট ও মিলের তাজা পণ্যসমূহ
            </h2>
            <p className="mt-2 text-base text-stone-600 lg:text-lg">
              খুচরা (কেজি/লিটার) অথবা পাইকারি (মণ/জার) নির্বাচন করে তাৎক্ষণিক বিল দেখুন
            </p>
          </div>
          <div className="catalog-search-shell flex items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-emerald-800 focus-within:ring-4 focus-within:ring-emerald-900/10 lg:flex-none">
            <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-stone-500" />
            <input
              id="catalog-search"
              type="text"
              placeholder="সরিষার তেল, তিল, ভুট্টা বা বীজ খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400 focus:outline-none lg:text-lg"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              aria-label="বাংলায় মুখে বলে পণ্য খুঁজুন"
              title="বাংলায় মুখে বলুন"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-800 px-3 text-sm font-bold text-white transition hover:bg-emerald-900"
            >
              <Mic className="h-4 w-4" /> <span className="hidden sm:inline">মুখে বলুন</span>
            </button>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="সার্চ মুছুন"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ক্যাটাগরি ফিল্টার */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200/90 bg-[#F3EFE6]/80 p-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              whileTap={{ scale: 0.97 }}
              className={`relative inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all sm:text-base lg:text-lg ${
                selectedCategory === cat.id
                  ? "border-transparent text-amber-300 shadow-md"
                  : "border-stone-200/80 bg-white text-stone-800 shadow-2xs hover:border-amber-400 hover:bg-amber-50/80"
              }`}
            >
              {selectedCategory === cat.id && (
                <motion.span
                  layoutId="activeCatalogCategory"
                  className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-900 to-teal-900"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{cat.icon} {cat.label}</span>
              <span className={`relative z-10 rounded-full px-2 py-0.5 text-xs font-extrabold ${selectedCategory === cat.id ? "bg-white/15 text-amber-100" : "bg-stone-100 text-stone-600"}`}>
                {toBanglaNum(productCounts[cat.id] ?? 0)}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="সরবরাহ মডেল অনুযায়ী ফিল্টার">
          <span className="mr-1 text-sm font-bold text-stone-600">সরবরাহ মডেল:</span>
          <button
            type="button"
            aria-pressed={supplyModel === "all"}
            onClick={() => setSupplyModel("all")}
            className={`rounded-full border px-3.5 py-2 text-sm font-bold transition ${supplyModel === "all" ? "border-emerald-800 bg-emerald-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-emerald-500"}`}
          >
            সব মডেল ({toBanglaNum(products.length)})
          </button>
          {SUPPLY_MODEL_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={supplyModel === filter.id}
              onClick={() => setSupplyModel(filter.id)}
              className={`rounded-full border px-3.5 py-2 text-sm font-bold transition ${supplyModel === filter.id ? "border-emerald-800 bg-emerald-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-emerald-500"}`}
            >
              {filter.label} ({toBanglaNum(supplyModelCounts[filter.id] ?? 0)})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 text-center"><span className="loading loading-spinner loading-lg text-emerald-800"></span></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
            {!visibleProducts.length && <p className="col-span-full rounded-2xl border border-stone-200 bg-white p-8 text-center font-semibold text-stone-600">এই ক্যাটাগরিতে নির্বাচিত সরবরাহ মডেলের কোনো পণ্য নেই।</p>}
          </div>
        )}
      </section>

      <FarmFeedCalculator />
      <WeeklyRateSubscription />
      <FarmerDirectHub />
    </div>
  );
}