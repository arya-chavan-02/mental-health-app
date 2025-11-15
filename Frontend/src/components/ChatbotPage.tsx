// ChatbotPage.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Send,
  User,
  Bot,
  MessageSquare,
  Plus,
  Menu,
  X
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  emotion?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  isTemporary?: boolean;
}

interface ChatbotPageProps {
  onNavigateToProfile?: () => void;
}

export const ChatbotPage = ({ onNavigateToProfile }: ChatbotPageProps) => {
  const { user, logout } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const API_URL = "http://127.0.0.1:8000/chat";

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // ----------------------------
  // UTILITIES
  // ----------------------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // ----------------------------
  // LOAD ALL SESSIONS FROM DB ON MOUNT
  // ----------------------------
  const token = localStorage.getItem("token");
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        setChatSessions(
          data.map((s: any) => ({
            id: s.session_id,
            title: s.title || "New Conversation",
            messages: [],
            lastUpdated: new Date(s.last_updated),
            isTemporary: false
          }))
        );

        if (data.length > 0) {
          setActiveSessionId(data[0].session_id);
        }
      } catch (err) {
        console.error("Failed loading sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, []);

  const loadChatHistory = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_URL}/history/${sessionId}`);
      const data = await res.json();

      const msgs = data.messages.map((m: any) => ({
        id: String(m.id),
        content: m.content,
        sender: m.role === 'user' ? 'user' : 'bot',
        timestamp: m.created_at,
        emotion: m.emotion || undefined
      }));

      setChatSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, messages: msgs } : s
        )
      );
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  useEffect(() => {
    if (!activeSessionId) return;

    const session = chatSessions.find(s => s.id === activeSessionId);
    if (!session || session.isTemporary) return;

    loadChatHistory(activeSessionId);
  }, [activeSessionId]);

  const createNewChat = () => {
    const tempId = "temp-" + Date.now();

    const newSession: ChatSession = {
      id: tempId,
      title: "New Conversation",
      messages: [],
      lastUpdated: new Date().toISOString(),
      isTemporary: true
    };

    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(tempId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSessionId) return;

    const userText = inputMessage.trim();

    // Optimistic user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setChatSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    );

    setInputMessage('');
    setIsTyping(true);

    try {
      let sessionToSend: string | null = activeSessionId;
      const currentSession = chatSessions.find(s => s.id === activeSessionId);

      if (currentSession?.isTemporary) {
        sessionToSend = null; // backend will create a session
      }

      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify({
          user_message: userText,
          session_id: sessionToSend
        })
      });

      const data = await res.json();
      const realSessionId = data.session_id;
      const newTitle = data.title;

      // Replace temporary session with real session
      if (currentSession?.isTemporary) {
        setChatSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? { ...s, title: newTitle, id: realSessionId, isTemporary: false }
              : s
          )
        );

        setActiveSessionId(realSessionId);
      }

      const botReply = data.reply;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        emotion: data.emotion
      };

      // Append bot message
      setChatSessions(prev =>
        prev.map(s =>
          s.id === (currentSession?.isTemporary ? realSessionId : activeSessionId)
            ? { ...s, messages: [...s.messages, botMessage] }
            : s
        )
      );

      // TITLE = summarized first bot reply
      const sessionAfter = chatSessions.find(s =>
        s.id === (currentSession?.isTemporary ? realSessionId : activeSessionId)
      );

      if (sessionAfter?.messages.length === 1) {
        const summary = botReply.slice(0, 40) + (botReply.length > 40 ? "..." : "");
        setChatSessions(prev =>
          prev.map(s =>
            s.id === (currentSession?.isTemporary ? realSessionId : activeSessionId)
              ? { ...s, title: summary }
              : s
          )
        );
      }

    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ----------------------------
  // UI MARKUP
  // ----------------------------
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-teal-100 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-teal-100">
          <Button
            onClick={createNewChat}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">

            {chatSessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left px-3 py-3 rounded-lg ${session.id === activeSessionId
                  ? 'bg-teal-50 border border-teal-200'
                  : 'hover:bg-teal-50'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-teal-900 truncate">{session.title}</p>
                    <p className="text-xs text-teal-500">{formatTime(session.lastUpdated)}</p>
                  </div>
                </div>
              </button>
            ))}

          </div>
        </ScrollArea>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-teal-100 px-6 py-3 shadow-sm 
     flex items-center gap-3 sticky top-0 z-40">
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-teal-700"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>

          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-teal-900">MindCare Assistant</h1>
            <p className="text-sm text-teal-600">Always here to listen</p>
          </div>
        </div>

        {/* MESSAGES */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">

            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={msg.sender === 'user' ? 'bg-teal-500' : 'bg-cyan-500'}>
                  <AvatarFallback>
                    {msg.sender === 'user' ? <User className="text-white" /> : <Bot className="text-white" />}
                  </AvatarFallback>
                </Avatar>

                <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'bg-white text-teal-900 border border-teal-100'
                  }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="bg-cyan-500">
                  <AvatarFallback>
                    <Bot className="text-white" />
                  </AvatarFallback>
                </Avatar>

                <div className="bg-white px-4 py-3 rounded-2xl border border-teal-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-150" />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* TEXT INPUT */}
        <div className="bg-white border-t border-teal-100 px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none border-teal-200"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-teal-500 to-cyan-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
