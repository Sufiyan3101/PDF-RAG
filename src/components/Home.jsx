import Header from "./Header";
import { useState, useEffect } from "react";
import "../styles/Home.css";
import { useRef } from "react";
import { RiUploadCloudFill } from "react-icons/ri";
import { getAuth } from "firebase/auth";
import CountdownTimer from "./countdownTimer";
import MessageDialogue from "./messageDialogue";

const API = import.meta.env.VITE_API_URL;

const Home = () => {
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "📄 Hey there! Upload a PDF and I’ll instantly turn into your personal document assistant. Ask me anything about its content once it’s uploaded 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState(null);
  const [response, setResponse] = useState("");
  const [expiry, setExpiry] = useState();
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const token = await user.getIdToken();

        const response = await fetch(`${API}/chat-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((msg) => ({
            role: msg.role === "assistant" ? "bot" : msg.role,
            content: msg.content,
          }));

          setMessages(formatted);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
        setAlertMsg("Failed to load chat history.");
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("docExpiry");

    if (stored) {
      const expiryTime = parseInt(stored);
      setMessages([
        {
          role: "bot",
          content:
            "✅ PDF uploaded successfully! You can now ask me anything about this document.",
        },
      ]);

      if (expiryTime > Date.now()) {
        setExpiry(expiryTime);
      } else {
        localStorage.removeItem("docExpiry");
      }
    }
  }, []);

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setAlertMsg("Wait few seconds, bot is getting ready...");

    if (!file) {
      setAlertMsg("No file selected...");
      return;
    }

    if (file.type !== "application/pdf") {
      setAlertMsg("❌ Only PDF files are allowed. Please upload a valid PDF.");
      e.target.files = null;
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setAlertMsg("User not logged in");
        return;
      }
      const token = await user.getIdToken();
      setToken(token);

      const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      console.log("Server response:", data);

      if (response.ok) {
        setAlertMsg("Bot is ready for your questions...");
        setMessages([
          {
            role: "bot",
            content:
              "✅ PDF uploaded successfully! You can now ask me anything about this document.",
          },
        ]);
        setResponse(data.message);
        localStorage.setItem("docExpiry", data.expiresAt);
        setExpiry(data.expiresAt);
      } else {
        alert("Error: " + data.detail);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setAlertMsg("Upload failed - try after sometime");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      setAlertMsg("Input cannot be empty");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion = input;
    setInput("");

    const auth = getAuth();
    const user = auth.currentUser;
    const token = await user.getIdToken();

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      const data = await response.json();
      setAlertMsg(data.error);
      console.log(data);

      if (!response.ok) {
        console.error("Server error:", data);
        return;
      }

      setMessages((prev) => [...prev, { role: "bot", content: data.answer }]);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <div className="pageWrapper">
      <Header />
      {alertMsg && (
        <MessageDialogue alertMsg={alertMsg} onClose={() => setAlertMsg("")} />
      )}

      <div className="chatMessagesContainer">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="inputContainer">
        <input
          type="file"
          accept=".pdf,application/pdf"
          ref={fileInputRef}
          className="hiddenFileInput"
          onChange={handleFileChange}
        />

        {expiry && expiry > Date.now() ? (
          <CountdownTimer
            className="countdownTimer"
            duration={expiry - Date.now()}
            onExpire={() => {
              setResponse("");
              setExpiry(null);
              localStorage.removeItem("docExpiry");
            }}
          />
        ) : (
          <RiUploadCloudFill className="fileIcon" onClick={handleIconClick} />
        )}

        <input
          className="inputText"
          type="text"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Home;
