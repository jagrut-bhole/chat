import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, Mic, LogOut, Trash2, Send as SendIcon } from 'lucide-react';
import FileUploadModal from './FileUploadModal';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  audioDuration?: string; // Mock duration for voice notes
  sender: 'me' | 'them' | 'system';
  timestamp: Date;
}

interface ChatPageProps {
  onLeave: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onLeave }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      text: 'You are now connected with a random stranger. Say Hi!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'me',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate reply
    setTimeout(() => {
      if (isLeaving) return;
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's interesting! Tell me more.",
        sender: 'them',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleVoiceSend = () => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      audioDuration: '0:05',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setIsRecording(false);
  };

  const handleFileUpload = (type: 'image' | 'file') => {
    setIsUploadModalOpen(false);
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      imageUrl: type === 'image' ? `https://picsum.photos/seed/${Date.now()}/300/200` : undefined,
      text: type === 'file' ? 'Shared a document' : undefined,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLeaveChat = () => {
    setIsLeaving(true);
    // Add termination message
    setMessages(prev => [...prev, {
      id: 'end',
      sender: 'system',
      text: 'Chat terminated.',
      timestamp: new Date()
    }]);

    // Delay before actual leave to show the message
    setTimeout(() => {
      onLeave();
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <img 
              src="https://ui-avatars.com/api/?name=Stranger&background=random&color=fff" 
              alt="Stranger" 
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#161b22] rounded-full"></span>
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-sm">Stranger</h3>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleLeaveChat}
            disabled={isLeaving}
            className="ml-2 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #1c2128 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            {msg.sender === 'system' ? (
              <span className="bg-slate-800/80 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                {msg.text}
              </span>
            ) : (
              <div 
                className={`max-w-[80%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-[#1c2128] text-slate-200 border border-slate-700 rounded-tl-none'
                }`}
              >
                {/* Image Content */}
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Shared" className="rounded-lg mb-2 max-h-60 object-cover w-full" />
                )}
                
                {/* Audio Content */}
                {msg.audioDuration && (
                  <div className="flex items-center gap-3 min-w-[150px]">
                     <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                       <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5"></div>
                     </button>
                     <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-white"></div>
                     </div>
                     <span className="text-xs font-mono opacity-80">{msg.audioDuration}</span>
                  </div>
                )}

                {/* Text Content */}
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#101318] border-t border-slate-800">
        <AnimatePresence mode="wait">
          {isRecording ? (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="flex items-center gap-3 bg-[#1c2128] p-2 rounded-full border border-red-500/30 shadow-lg shadow-red-900/10"
             >
                <button 
                  onClick={() => setIsRecording(false)}
                  className="p-2.5 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
                <div className="flex-1 flex items-center gap-2 px-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-slate-200 font-mono text-sm">0:05</span>
                   <div className="flex-1 h-8 flex items-center gap-1 justify-center opacity-50">
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-red-400 rounded-full animate-pulse" 
                          style={{ height: Math.random() * 20 + 4 + 'px', animationDelay: i * 0.1 + 's' }}
                        ></div>
                      ))}
                   </div>
                </div>
                <button 
                  onClick={handleVoiceSend}
                  className="p-2.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 shadow-md shadow-indigo-900/30 transition-transform active:scale-95"
                >
                  <SendIcon size={18} className="ml-0.5" />
                </button>
             </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-end gap-2"
            >
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="p-3 bg-[#1c2128] text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                <Plus size={20} />
              </button>

              <div className="flex-1 bg-[#1c2128] rounded-[24px] border border-slate-700 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all flex items-end min-h-[48px]">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  rows={1}
                  className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-4 py-3 focus:outline-none resize-none max-h-32"
                  style={{ minHeight: '48px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>

              {inputValue.trim() ? (
                <button 
                  onClick={handleSendMessage}
                  className="p-3 bg-white text-black rounded-full hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/10"
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsRecording(true)}
                  className="p-3 bg-white text-black rounded-full hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/10"
                >
                  <Mic size={20} strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />
    </div>
  );
};

export default ChatPage;