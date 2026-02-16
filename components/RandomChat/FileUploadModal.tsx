import React from "react";
import { X, FolderOpen, Camera, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (source: "storage" | "camera") => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#1c2128] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100">Share Content</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Options Grid */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <button
                  onClick={() => onUpload("storage")}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#0d1117] border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                    <FolderOpen size={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Gallery / Files</span>
                </button>

                <button
                  onClick={() => onUpload("camera")}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-[#0d1117] border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Camera</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileUploadModal;
