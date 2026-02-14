'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function AICropAdvisor({ farmContext }: { farmContext?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Crop Advisor. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: farmContext }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] md:w-96 h-[450px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-scale-in">
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-icons">auto_awesome</span>
              <span className="font-bold text-sm">AI Crop Advisor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="material-icons text-white/80 hover:text-white transition-colors">close</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your crops..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white"
            />
            <button type="submit" className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
              <span className="material-icons">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300"></div>
        <span className="material-icons text-3xl relative z-10">{isOpen ? 'chat' : 'auto_awesome'}</span>
      </button>
    </div>
  );
}
