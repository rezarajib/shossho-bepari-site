import { motion } from "framer-motion";

export default function CustomButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) {
  const styles = {
    primary: "btn border-none bg-emerald-950 text-white hover:bg-emerald-800",
    gold: "btn border-none bg-amber-500 font-bold text-slate-950 shadow-lg shadow-amber-900/20 hover:bg-amber-400",
    outline: "btn btn-outline border-emerald-950 text-emerald-950 hover:bg-emerald-950 hover:text-white",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles[variant]} rounded-xl normal-case ${className}`}
    >
      {children}
    </motion.button>
  );
}