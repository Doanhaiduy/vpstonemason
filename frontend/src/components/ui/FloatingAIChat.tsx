'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';

export function FloatingAIChat() {
  const siteConfig = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hi there! I am the vpstonemason AI Assistant. How can I help you find the perfect stone today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!siteConfig.aiEnabled) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || 'Sorry, I encounted an error.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white shadow-2xl overflow-hidden flex flex-col border border-stone-200"
            >
              {/* Header */}
              <div className="bg-stone-900 px-4 py-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span className="font-medium text-sm">vpstonemason AI</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-white rounded-l-xl rounded-tr-xl'
                        : 'bg-white border border-stone-200 text-stone-700 rounded-r-xl rounded-tl-xl'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-stone-200 p-3 rounded-r-xl rounded-tl-xl">
                      <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our stones..."
                  className="flex-1 bg-stone-100 border-none outline-none px-4 py-2 text-sm rounded-full focus:ring-1 focus:ring-accent-gold transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-accent-gold text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-stone-900 text-white rounded-full shadow-xl flex items-center justify-center relative hover:bg-stone-800 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isOpen && (
            <span className="absolute flex h-3 w-3 top-0 right-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-gold" />
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
