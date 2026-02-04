import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  X,
  Loader2,
  Maximize2,
  Minimize2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * How the chat is displayed:
   * - "floating": fixed bottom-right overlay (default, used by FloatingBot)
   * - "page": embedded in the page layout for /chat route
   */
  variant?: "floating" | "page";
}

type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export const ChatWindow = ({ isOpen, onClose, variant = "floating" }: ChatWindowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
  };

  const sendCurrentMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: LocalMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simple local echo / placeholder assistant response.
    setTimeout(() => {
      const assistantMessage: LocalMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: t("chat.placeholderResponse", {
          defaultValue:
            "This is a demo assistant response. Backend integration is disabled in this environment.",
        }),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage();
    }
  };

  const handleOpenFullPage = () => {
    onClose();
    navigate("/chat");
  };
  const isFloating = variant === "floating";

  return (
    <div
      className={`bg-card border-2 border-primary/20 rounded-xl shadow-2xl flex flex-col backdrop-blur-sm overflow-hidden transition-opacity transition-transform ${
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      } ${
        isFloating
          ? `fixed right-2 sm:right-4 md:right-6 z-50 ${
              isExpanded
                ? "bottom-2 sm:bottom-4 md:bottom-6 w-[calc(100vw-1rem)] sm:w-[min(480px,calc(100vw-2rem))] h-[calc(100vh-1rem)] sm:h-[80vh]"
                : "bottom-20 sm:bottom-24 md:bottom-28 w-[calc(100vw-1rem)] sm:w-96 h-[500px] sm:h-[600px]"
            }`
          : "w-full max-w-3xl mx-auto h-[600px] sm:h-[700px] mt-6"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg border-2 border-primary/20 shrink-0">
            <img
              src="/image.png"
              alt="AI Gennie"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{t("chat.title")}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate hidden sm:block">{t("chat.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="h-8 w-8"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenFullPage}
            className="h-8 w-8"
            aria-label="Open full chat"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="h-8 w-8"
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div className="text-muted-foreground">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-primary text-xl sm:text-2xl">💬</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground">{t("chat.startConversation")}</p>
              <p className="text-[10px] sm:text-xs mt-1 text-muted-foreground">{t("chat.askAboutData")}</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] ${
                message.role === "user"
                  ? "message-bubble-user text-primary-foreground"
                  : "message-bubble-assistant text-foreground"
              }`}
            > 
              <p className="whitespace-pre-wrap break-words text-xs sm:text-sm">
                {message.content}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1.5 sm:mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bubble-assistant rounded-lg p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2">
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
              <span className="text-xs sm:text-sm text-foreground font-medium">{t("chat.processing")}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-border bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
        <div className="flex gap-1.5 sm:gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.askAboutData")}
            disabled={isLoading}
            className="flex-1 text-sm sm:text-base"
          />
          <Button
            onClick={sendCurrentMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

