// src/components/Chat/ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { chatService } from '../../services/api';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Create a new session or retrieve existing one from localStorage
    const storedSessionId = localStorage.getItem('cdp_chat_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadChatHistory(storedSessionId);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewSession = async () => {
    try {
      const { sessionId: newSessionId } = await chatService.createNewSession();
      setSessionId(newSessionId);
      localStorage.setItem('cdp_chat_session_id', newSessionId);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const loadChatHistory = async (id) => {
    try {
      setIsLoading(true);
      const { history } = await chatService.getChatHistory(id);
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to UI immediately
    const userMessage = {
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Send message to backend
      const { response } = await chatService.sendMessage(message, sessionId);
      
      // Add bot response to UI
      const botMessage = {
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        content: "Sorry, I'm having trouble processing your request. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    await createNewSession();
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">CDP Support Agent</h2>
        <button
          onClick={handleStartNewChat}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-2">Hello! I'm your CDP Support Agent.</p>
            <p>Ask me anything about Segment, mParticle, Lytics, or Zeotap.</p>
            <p className="mt-2 text-sm">For example: "How do I set up a new source in Segment?"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center text-gray-500">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer;