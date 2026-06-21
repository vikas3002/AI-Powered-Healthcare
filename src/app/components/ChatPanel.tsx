import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, X, Bot, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import { ChatMessage, Patient } from "../types";
import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatPanelProps {
  patient: Patient | null;
  userType: "doctor" | "patient";
  onClose: () => void;
}

const BACKEND_URL = "http://localhost:5000";
let socket: Socket;

export default function ChatPanel({ patient, userType, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "human">(userType === "patient" ? "ai" : "human");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [language, setLanguage] = useState<"en-IN" | "hi-IN">("en-IN");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        // AUTO-SEND FEATURE: No need to press enter
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language, patient]); // React to language changes

  useEffect(() => {
    if (!patient?.id) return;
    socket = io(BACKEND_URL);
    socket.emit("join_room", patient.id);
    socket.on("chat_history", (history: ChatMessage[]) => setMessages(history));
    socket.on("receive_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => { socket.disconnect(); };
  }, [patient?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported in this browser.");
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakText = (text: string) => {
    if (!isAudioEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  // Modified to optionally take auto-text from voice
  const handleSendMessage = async (autoText?: string) => {
    const textToSend = autoText || inputMessage;
    if (!textToSend.trim() || !patient?.id) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: userType,
      message: textToSend,
      timestamp: new Date().toISOString(),
      patientId: patient.id,
    };

    if (chatMode === "human") {
      socket.emit("send_message", newMessage);
      if (!autoText) setInputMessage("");
    } else if (chatMode === "ai" && userType === "patient") {
      setMessages((prev) => [...prev, newMessage]);
      if (!autoText) setInputMessage("");

      try {
        const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend, patientData: patient }),
        });
        
        const data = await response.json();
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          message: data.reply,
          timestamp: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, aiResponse]);
        speakText(data.reply);
      } catch (error) {
        console.error("AI Error:", error);
      }
    }
  };

  if (!patient && userType === "doctor") {
    return <div className="h-full flex items-center justify-center text-gray-500"><p>Select a patient to start chatting</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {userType === "patient" && chatMode === "ai" ? (
            <>
              <Avatar className="bg-purple-600"><AvatarFallback className="text-white"><Bot className="w-5 h-5" /></AvatarFallback></Avatar>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-gray-500">Auto Voice Active</p>
              </div>
            </>
          ) : (
            <>
              <Avatar><AvatarFallback>{userType === "doctor" ? (patient?.name?.charAt(0) || "P") : "Dr"}</AvatarFallback></Avatar>
              <div>
                <h3 className="font-semibold">{userType === "doctor" ? patient?.name : "Dr. Smith"}</h3>
                <p className="text-sm text-gray-500">Live Chat</p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {userType === "patient" && chatMode === "ai" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === "en-IN" ? "hi-IN" : "en-IN")} title={`Switch Language`}>
                <Globe className="w-4 h-4 mr-1" /> {language === 'en-IN' ? 'EN' : 'HI'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsAudioEnabled(!isAudioEnabled)}>
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </>
          )}
          {userType === "patient" && (
            <Button variant="outline" size="sm" onClick={() => setChatMode(chatMode === "ai" ? "human" : "ai")}>
              {chatMode === "ai" ? "Talk to Doctor" : "Talk to AI"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.filter(msg => chatMode === "ai" ? msg.sender === "ai" || msg.sender === userType : msg.sender !== "ai").map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === userType ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === userType ? "bg-blue-600 text-white" : msg.sender === "ai" ? "bg-purple-100 text-purple-900" : "bg-gray-100 text-gray-900"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={toggleRecording} className="shrink-0">
            {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            placeholder={isRecording ? "Listening... (auto sends when you stop)" : "Type a message..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={() => handleSendMessage()} className="shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}