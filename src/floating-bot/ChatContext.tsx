import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { sendQuery, type ChatMessage } from "./api";

interface ChatContextValue {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  sendCurrentMessage: () => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
  }, []);

  const sendCurrentMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendQuery(userMessage.content);

      const meta: Record<string, any> = {};
      if (response.email_body) meta.email_body = response.email_body;
      if (response.email_subject) meta.email_subject = response.email_subject;
      if (response.rows_affected !== undefined) meta.rows_affected = response.rows_affected;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.summary || "I couldn't generate a response. Please try again.",
        sql: response.sql,
        data: response.data,
        viz: response.viz,
        mime: response.mime,
        meta: Object.keys(meta).length ? meta : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error    
        
          ? `Error: ${error.message}` 
          : t("chat.error"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, t]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        isLoading,
        setInput,
        sendCurrentMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  // Graceful fallback to avoid runtime crashes if provider isn't mounted yet.
  if (!ctx) {
    return {
      messages: [],
      input: "",
      isLoading: false,
      setInput: () => {},
      sendCurrentMessage: async () => {},
      clearChat: () => {},
    };
  }
  return ctx;
};


