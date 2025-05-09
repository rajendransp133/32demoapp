"use client";

import { useState, useRef, useEffect } from "react";
import OpenAI from "openai";
import { useAvatarContext } from "../context/AvatarContext";
import ContextualChatInput from "./ContextualChatInput";
import TextExtractionService from "../services/TextExtractionService";

interface Message {
  role: "user" | "bot";
  content: string;
  context?: string;
}

interface ChatbotProps {
  onMessage?: (message: string) => void;
}

const Chatbot = ({ onMessage }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useContextualInput, setUseContextualInput] = useState(false);
  const [latestExtraction, setLatestExtraction] = useState<any>(null);
  const [autoUseExtraction, setAutoUseExtraction] = useState(true);

  const { setReplyText, language, toggleLanguage } = useAvatarContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const extractionService = useRef(TextExtractionService.getInstance());

  // Initialize extraction listener
  useEffect(() => {
    // Function to handle extraction updates
    const handleExtractionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        extractions: any[];
        latestExtraction: any;
      }>;

      if (customEvent.detail && customEvent.detail.latestExtraction) {
        setLatestExtraction(customEvent.detail.latestExtraction);

        // If auto-use is enabled, populate the input field with the extracted text
        if (autoUseExtraction && !isLoading) {
          // Extract just the first 150 characters to avoid overwhelming the input
          const regionText =
            customEvent.detail.latestExtraction.regionText || "";
          const truncatedText = regionText.substring(0, 150);
          setInput(truncatedText);
        }
      }
    };

    // Add event listener
    window.addEventListener("extraction-updated", handleExtractionUpdate);

    // Clean up
    return () => {
      window.removeEventListener("extraction-updated", handleExtractionUpdate);
    };
  }, [autoUseExtraction, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async (
    userInput: string = input,
    context?: string
  ) => {
    const messageToSend = userInput || input;

    if (messageToSend.trim() && !isLoading) {
      // If no context was provided but we have a latest extraction and autoUse is enabled
      if (!context && latestExtraction && autoUseExtraction) {
        context = `Screen Context: ${latestExtraction.entireScreen}\nPointed Region: ${latestExtraction.regionText}`;
      }

      const userMessage: Message = {
        content: messageToSend,
        role: "user",
        context,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLatestExtraction(null);
      setIsLoading(true);

      try {
        // Format messages for the API - convert from our Message type to API expected format
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.context
            ? `${msg.content}\n\nContext: ${msg.context}`
            : msg.content,
        }));

        // Send request to the backend with message history
        const response = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: JSON.parse(JSON.stringify(apiMessages)),
            language: language,
          }),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data", data);
        const botResponse = data.message || "Sorry, I couldn't process that.";

        const botMessage: Message = {
          content: botResponse,
          role: "bot",
        };

        setMessages((prev) => [...prev, botMessage]);

        // Update the avatar context with the bot's response
        setReplyText(botResponse);

        // Call the onMessage prop if provided
        if (onMessage) {
          onMessage(botResponse);
        }
      } catch (error) {
        console.error("Error calling chat API:", error);
        const errorMessage: Message = {
          content: "Sorry, I encountered an error. Please try again.",
          role: "bot",
        };
        setMessages((prev) => [...prev, errorMessage]);

        // Update the avatar context with the error message
        setReplyText(errorMessage.content);

        // Call the onMessage prop if provided
        if (onMessage) {
          onMessage(errorMessage.content);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[60vh] mx-auto max-w-[1400px]">
      <div
        className="w-auto relative hidden lg:block"
        style={{ backgroundColor: "#E2E9F1" }}
      ></div>
      <div
        className="w-auto lg:w-[500px] flex flex-col shadow-xl overflow-hidden bg-white rounded-lg chat-container"
        style={{
          minWidth: "380px",
          position: "relative",
          height: "100%",
        }}
      >
        <div className="header-chatbot p-4 flex items-center justify-between bg-gray-800 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="text-xl text-white font-semibold">AI Assistant</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setUseContextualInput(!useContextualInput)}
              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {useContextualInput ? "Standard" : "Contextual"}
            </button>
            <button
              onClick={() => setAutoUseExtraction(!autoUseExtraction)}
              className={`px-3 py-1 ${
                autoUseExtraction
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              } text-white rounded-lg transition-colors`}
              title="Automatically use newly extracted text"
            >
              {autoUseExtraction ? "Auto ✓" : "Auto ✗"}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {language === "english" ? "அ Tamil" : "A English"}
            </button>
          </div>
        </div>

        <div className="flex-1 chatbot-body p-4 flex flex-col bg-gray-50">
          <div className="message-container flex-1 overflow-y-auto space-y-4 px-2 pb-4 pt-2 pr-1 max-h-[calc(60vh-140px)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`message-bubble ${
                    message.role === "user"
                      ? "user-message bg-blue-500 text-white"
                      : "bot-message bg-gray-100"
                  } p-4 rounded-2xl max-w-[85%] shadow-sm transition-all duration-200 hover:shadow-md`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  {message.context && (
                    <div className="mt-1 text-xs opacity-70 italic">
                      Using screen context
                    </div>
                  )}
                  <div
                    className={`timestamp text-right mt-2 text-xs ${
                      message.role === "user"
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {getCurrentTime()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="message-bubble bot-message bg-gray-100 p-4 rounded-2xl max-w-[85%] shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {useContextualInput ? (
            <ContextualChatInput onSendMessage={handleSendMessage} />
          ) : (
            <div className="flex input-chatbot items-center space-x-3 bg-white p-4 rounded-lg shadow-md mt-2 sticky bottom-0 z-10">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    latestExtraction
                      ? "Using latest extracted text..."
                      : "Type a message..."
                  }
                  className={`chat-input w-full p-3 rounded-xl border ${
                    latestExtraction
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  disabled={isLoading}
                />
              </div>
              <button
                className="send-button flex-shrink-0 p-3 bg-blue-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
              >
                <svg
                  className="w-5 h-5 transform rotate-45"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
