import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, LogOut, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Message {
  id: string;
  text?: string;
  sender: "me" | "them" | "system";
  timestamp: Date;
}

interface ChatPageProps {
  ws: WebSocket;
  partnerName: string;
  onLeave: () => void;
  onFindNew: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ ws, partnerName, onLeave, onFindNew }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      text: "You are now connected with a random stranger. Say Hi!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // --- WebSocket message listener ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "random:new_message") {
          const newMsg: Message = {
            id: Date.now().toString(),
            text: data.content,
            sender: "them",
            timestamp: new Date(data.timestamp),
          };
          setMessages((prev) => [...prev, newMsg]);
          // Clear typing indicator when message arrives
          setIsPartnerTyping(false);
        }

        if (data.type === "random:partner_typing") {
          setIsPartnerTyping(true);
          // Auto-hide typing indicator after 3s
          if (partnerTypingTimeoutRef.current) {
            clearTimeout(partnerTypingTimeoutRef.current);
          }
          partnerTypingTimeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3000);
        }

        if (data.type === "random:partner_stop_typing") {
          setIsPartnerTyping(false);
          if (partnerTypingTimeoutRef.current) {
            clearTimeout(partnerTypingTimeoutRef.current);
          }
        }

        if (data.type === "random:partner_left") {
          setPartnerLeft(true);
          setIsPartnerTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: "partner_left",
              sender: "system",
              text: "User has left the chat.",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error("[RandomChat] Parse error:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

  // --- Send typing indicator (debounced) ---
  const sendTyping = useCallback(() => {
    const now = Date.now();
    // Throttle typing events to max once per 500ms
    if (now - lastTypingSentRef.current < 500) return;
    lastTypingSentRef.current = now;

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "random:typing" }));
    }

    // Schedule stop_typing after 2s of no input
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "random:stop_typing" }));
      }
    }, 2000);
  }, [ws]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim() && !partnerLeft) {
      sendTyping();
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || partnerLeft) return;

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "random:message",
          content: inputValue.trim(),
        })
      );
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "me",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Clear typing timeout and send stop_typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "random:stop_typing" }));
    }
  };

  const handleLeaveChat = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "random:leave" }));
    }
    ws.close();
    onLeave();
  };

  const handleFindNew = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    onFindNew();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#101318] relative overflow-hidden md:max-w-4xl md:mx-auto md:h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-slate-800 md:shadow-2xl md:mt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm border border-slate-600">
              {partnerName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${partnerLeft ? "bg-red-500" : "bg-green-500"} border-2 border-[#161b22] rounded-full`}
            ></span>
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-sm">{partnerName || "Anonymous"}</h3>
            <AnimatePresence mode="wait">
              <motion.p
                key="status"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-xs flex items-center gap-1 ${partnerLeft ? "text-red-400" : "text-green-400"}`}
              >
                {partnerLeft ? "Disconnected" : "Online"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLeaveChat}
            className="ml-2 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: "radial-gradient(circle at center, #1c2128 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}
          >
            {msg.sender === "system" ? (
              <span className="bg-slate-800/80 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                {msg.text}
              </span>
            ) : (
              <div
                className={`max-w-[80%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "me"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-[#1c2128] text-slate-200 border border-slate-700 rounded-tl-none"
                }`}
              >
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                <p
                  className={`text-[10px] mt-1 text-right ${msg.sender === "me" ? "text-indigo-200" : "text-slate-500"}`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        {/* WhatsApp-style typing indicator bubble */}
        <AnimatePresence>
          {isPartnerTyping && !partnerLeft && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="bg-[#1c2128] border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-slate-400 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Partner left actions */}
      {partnerLeft && (
        <div className="px-4 py-3 bg-[#161b22] border-t border-slate-800 flex items-center justify-center gap-3">
          <button
            onClick={handleFindNew}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            Find New Chat
          </button>
          <button
            onClick={handleLeaveChat}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>
      )}

      {/* Input Area */}
      {!partnerLeft && (
        <div className="p-4 bg-[#101318] border-t border-slate-800">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-[#1c2128] rounded-[24px] border border-slate-700 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all flex items-end min-h-[48px]">
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-4 py-3 focus:outline-none resize-none max-h-32"
                style={{ minHeight: "48px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>

            {inputValue.trim() && (
              <button
                onClick={handleSendMessage}
                className="p-3 bg-white text-black rounded-full hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/10 cursor-pointer"
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
