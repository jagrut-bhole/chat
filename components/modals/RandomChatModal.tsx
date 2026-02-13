import React from 'react';
import { X, Zap, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RandomChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const RandomChatModal: React.FC<RandomChatModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap size={32} className="text-white" fill="currentColor" fillOpacity={0.2} />
                                </div>

                                <h2 className="text-xl font-bold text-white mb-2">Start Random Chat?</h2>
                                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                    You are about to be connected with a random user anonymously.
                                    Please be respectful and follow our community guidelines.
                                </p>

                                <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 mb-6 flex gap-3 text-left">
                                    <ShieldAlert className="text-white shrink-0" size={20} />
                                    <p className="text-xs text-zinc-300">
                                        Your identity remains hidden, but your IP address is logged for safety purposes.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 shadow-lg shadow-white/5 transition-all active:scale-95"
                                    >
                                        Start Searching
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RandomChatModal;