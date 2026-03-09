"use client";
import { motion, AnimatePresence } from "framer-motion";

// Props add karein taake Layout ise control kare
export default function MemberAccessPopup({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-md w-full mx-4 text-center border border-gray-100 relative"
          >
            <h2 className="text-2xl font-light tracking-[0.4em] uppercase mb-4 text-black">Exclusive Access</h2>
            <div className="h-[1px] w-12 bg-black mx-auto mb-6"></div>
            <p className="text-gray-500 text-[11px] tracking-[0.2em] uppercase mb-10 leading-relaxed">
              Please login to view our premium collection.
            </p>
            <div className="space-y-4">
               <a href="/login" className="block w-full bg-[#1a1a1a] text-white py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black">
                Login / Register
              </a>
              <button onClick={onClose} className="text-[9px] tracking-[0.2em] uppercase text-gray-400 hover:text-black">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}