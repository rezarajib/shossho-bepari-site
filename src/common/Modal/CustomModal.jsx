import { motion } from "framer-motion";

export default function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  panelClassName = "max-w-lg rounded-2xl border-2 border-amber-200 bg-white",
  titleClassName = "text-lg font-bold text-emerald-950",
}) {
  if (!isOpen) return null;
  return (
    <dialog open className="modal modal-open bg-black/60 backdrop-blur-xs">
      <div className={`modal-box ${panelClassName}`}>
        <div className="flex justify-between items-center border-b border-amber-200 pb-3 mb-4">
          <h3 className={titleClassName}>{title}</h3>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.96 }}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </motion.button>
        </div>
        {children}
      </div>
    </dialog>
  );
}