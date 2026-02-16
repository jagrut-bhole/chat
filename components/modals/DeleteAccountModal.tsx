"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { deleteAccount } from "@/api-axios/authRequest";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Session not found");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Deleting account...");

    try {
      const response = await deleteAccount({
        password,
        userId: session.user.id,
      });

      if (response.success) {
        toast.success("Account deleted successfully", { id: toastId });

        // Clear all cookies
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        // Sign out and redirect
        await signOut({ redirect: false });
        router.push("/");
      } else {
        toast.error(response.message || "Failed to delete account", {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error?.message || "Failed to delete account", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Delete Account</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-400 font-semibold mb-1">
                  Warning: This action is irreversible
                </p>
                <p className="text-red-300/80 text-sm">
                  All your data, messages, and groups will be permanently deleted.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Confirm your password to continue
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
