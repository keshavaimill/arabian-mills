import { Navigation } from "@/components/Navigation";
import { ChatWindow } from "../floating-bot/ChatWindow";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  console.log("Chat route rendered");
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Embedded, full-page chat experience */}
        <ChatWindow
          isOpen={true}
          onClose={() => navigate(-1)}
          variant="page"
        />
      </main>
    </div>
  );
};

export default Chat;

