// src/pages/ChatPage.jsx
import React from 'react';
import ChatContainer from '../components/Chat/ChatContainer';
import Navbar from '../components/Navigation/Navbar';

const ChatPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </div>
  );
};

export default ChatPage;