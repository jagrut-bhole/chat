import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Radio } from "lucide-react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

interface MatchingPageProps {
  userId: string;
  username: string;
  onMatched: (ws: WebSocket, partnerName: string) => void;
  onCancel: () => void;
}

const MatchingPage: React.FC<MatchingPageProps> = ({ userId, username, onMatched, onCancel }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "waiting" | "matched">("connecting");

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[Random] WebSocket connected, joining queue...");
      setStatus("waiting");
      ws.send(
        JSON.stringify({
          type: "random:join",
          userId,
          username,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "random:waiting") {
          setStatus("waiting");
        }

        if (data.type === "random:matched") {
          console.log(`[Random] Matched with ${data.partnerName}`);
          setStatus("matched");
          // Pass the live WebSocket and partner name to the parent
          onMatched(ws, data.partnerName);
        }

        if (data.type === "error") {
          console.error("[Random] Server error:", data.message);
        }
      } catch (err) {
        console.error("[Random] Parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[Random] WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("[Random] WebSocket error:", err);
    };

    return () => {
      // Only close if we haven't handed off to the chat
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "random:leave" }));
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [userId, username, onMatched]);

  const handleCancel = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "random:leave" }));
      wsRef.current.close();
    }
    wsRef.current = null;
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Pulsing Circles Animation */}
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute border border-white/40 rounded-full"
            initial={{ width: "20%", height: "20%", opacity: 0 }}
            animate={{
              width: ["20%", "100%"],
              height: ["20%", "100%"],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.6,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Center Icon */}
        <div className="relative z-10 w-24 h-24 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center shadow-xl shadow-white/5">
          <Radio size={40} className="text-white animate-pulse" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {status === "connecting"
            ? "Connecting..."
            : status === "matched"
              ? "Match found!"
              : "Finding a match..."}
        </h2>
        <p className="text-zinc-400">
          {status === "connecting"
            ? "Setting up connection..."
            : status === "matched"
              ? "Connecting you to your partner..."
              : "Scanning for anonymous users to connect with."}
        </p>
      </div>

      {status !== "matched" && (
        <button
          onClick={handleCancel}
          className="mt-12 flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group cursor-pointer"
        >
          <X size={18} className="transition-transform" />
          <span>Cancel Search</span>
        </button>
      )}
    </motion.div>
  );
};

export default MatchingPage;
