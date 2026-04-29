"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, User, Mic, MicOff, Volume2 } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function NexoraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi there! I'm Nexora, your personal travel assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any  >(null);
  const { currentItinerary, language } = usePlannerStore();

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Keep listening until manual stop
        recognitionRef.current.interimResults = true; // Show text as you speak
        recognitionRef.current.lang = navigator.language || "en-US";

        recognitionRef.current.onresult = (event: any  ) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInput(prev => prev + (prev ? " " : "") + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any  ) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            alert("Microphone permission denied. Please click the lock icon in your browser address bar and allow 'Microphone'.");
          } else if (event.error === "no-speech") {
            // Silently handle no speech
          } else {
            alert("Voice Error: " + event.error);
          }
        };

        recognitionRef.current.onend = () => {
          // Restart if still marked as listening (for continuous mode)
          if (isListening) recognitionRef.current.start();
        };
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly higher pitch for a friendly persona
      
      // Try to find a good female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English"));
      if (femaleVoice) utterance.voice = femaleVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let tripContext = null;
      if (currentItinerary) {
        tripContext = {
          destination: currentItinerary.user_destination,
          days: currentItinerary.user_duration,
          companions: currentItinerary.user_companions,
          tripTypes: currentItinerary.user_tripTypes,
          budget: currentItinerary.user_budget
        };
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          tripContext,
          language
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages([...newMessages, { role: "model", text: data.message }]);
      } else {
        setMessages([...newMessages, { role: "model", text: "Oops, I encountered a glitch. Could you try asking that again?" }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "model", text: "I seem to have lost connection. Please try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 font-body">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-midnight/90 backdrop-blur-xl border border-cyan-400/20 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-midnight to-[#0a1229]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center relative">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-midnight"></span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ivory text-sm">Nexora</h3>
                  <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">AI Voice Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-ivory/50 hover:text-ivory transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-cyan-400/20 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-amber/20 text-amber" : "bg-cyan-400/20 text-cyan-400"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`relative group max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-amber text-midnight rounded-tr-sm" 
                      : "bg-ivory/10 text-ivory border border-ivory/5 rounded-tl-sm"
                  }`}>
                    {msg.text}
                    {msg.role === "model" && (
                      <button 
                        onClick={() => speakText(msg.text)}
                        className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-ivory/40 hover:text-cyan-400"
                        title="Read aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-ivory/5 border border-ivory/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-cyan-400/20 bg-midnight/50">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Ask Nexora anything..."}
                    className={`w-full bg-ivory/5 border border-ivory/10 rounded-full py-3 pl-4 pr-12 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-cyan-400/50 transition-colors ${isListening ? "border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.2)]" : ""}`}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-cyan-400 text-midnight rounded-full hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:hover:bg-cyan-400"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-ivory/10 text-ivory/60 hover:bg-ivory/20"
                  }`}
                  title={isListening ? "Stop listening" : "Speak to Nexora"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)] relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} className="relative">
              <Bot className="w-7 h-7 text-white" />
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-amber" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
