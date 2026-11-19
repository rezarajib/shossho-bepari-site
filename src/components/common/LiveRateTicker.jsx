import { useEffect, useRef } from "react";
import { useAnimate } from "framer-motion";
import products from "../../data/products.json";
import { formatTaka } from "../../utils/formatBanglaNumber";

const productIcons = {
  "mustard-oil": "🟡",
  "mustard-cake": "🐄",
  "yellow-mustard": "🌼",
  "sesame-til": "🫘",
  "miniket-chal": "🌾",
  "wheat-gom": "🌾",
  "maize-vutta": "🌽",
  "pulses-mix": "🫘",
  "paddy-seed": "🌱",
  "seasonal-veg": "🥬",
  "pure-milk": "🥛",
};

function RateItems() {
  return products.map((product) => (
    <span
      key={product.id}
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-bold text-amber-50 lg:text-base"
    >
      <span aria-hidden="true">{productIcons[product.id] ?? "🌾"}</span>
      <span>{product.name}:</span>
      <span className="text-amber-300">
        {formatTaka(product.retailPrice)}/{product.retailUnit}
      </span>
      <span className="text-emerald-300" aria-hidden="true">|</span>
      <span className="text-white">
        {formatTaka(product.wholesalePrice)}/{product.wholesaleUnit}
      </span>
      <span className="px-3 text-amber-500" aria-hidden="true">◆</span>
    </span>
  ));
}

export default function LiveRateTicker() {
  const [scope, animate] = useAnimate();
  const animationControls = useRef(null);

  useEffect(() => {
    animationControls.current = animate(
      scope.current,
      { x: ["0%", "-50%"] },
      { repeat: Infinity, ease: "linear", duration: 90 },
    );

    return () => animationControls.current?.stop();
  }, [animate, scope]);

  const pauseTicker = () => animationControls.current?.pause();
  const resumeTicker = () => animationControls.current?.play();

  return (
    <div className="flex w-full items-center overflow-hidden border-b border-amber-500/30 bg-emerald-950 py-2.5 text-amber-50">
      <div className="z-10 flex shrink-0 items-center gap-2 border-r border-amber-500/30 bg-emerald-950 px-4 font-bold sm:px-8 lg:px-12">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-emerald-950" />
        </span>
        <span className="whitespace-nowrap text-sm lg:text-base">🔴 আজকের লাইভ বাজার দর</span>
      </div>

      <div
        className="min-w-0 flex-1 overflow-hidden"
        onMouseEnter={pauseTicker}
        onMouseLeave={resumeTicker}
        onFocus={pauseTicker}
        onBlur={resumeTicker}
        aria-label="আজকের খুচরা ও পাইকারি বাজার দর"
      >
        <div ref={scope} className="flex w-max items-center">
          <div className="flex shrink-0 items-center">
            <RateItems />
          </div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            <RateItems />
          </div>
        </div>
      </div>
    </div>
  );
}
