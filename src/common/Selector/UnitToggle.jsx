import { motion } from "framer-motion";

export default function UnitToggle({ isWholesale, onChange }) {
  return (
    <div className="join grid grid-cols-2 rounded-xl border border-amber-200 bg-amber-100 p-1">
      <motion.button
        type="button"
        onClick={() => onChange(false)}
        whileTap={{ scale: 0.96 }}
        className={`btn btn-sm join-item rounded-lg border-none text-sm font-semibold ${
          !isWholesale ? "bg-emerald-950 text-amber-400 shadow" : "bg-transparent text-emerald-950"
        }`}
      >
        খুচরা (কেজি/লিঃ)
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onChange(true)}
        whileTap={{ scale: 0.96 }}
        className={`btn btn-sm join-item rounded-lg border-none text-sm font-semibold ${
          isWholesale ? "bg-amber-500 text-emerald-950 shadow" : "bg-transparent text-emerald-950"
        }`}
      >
        পাইকারি (মণ/জার)
      </motion.button>
    </div>
  );
}