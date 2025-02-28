// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            CDP Support Agent
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your intelligent assistant for Customer Data Platforms.
            Get instant answers about Segment, mParticle, Lytics, and Zeotap.
          </p>
          
          <Link
            to="/chat"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Start Chatting
          </Link>
          
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <p className="text-gray-600">
                Our AI-powered chatbot analyzes documentation from major CDPs to provide accurate and helpful answers to your "how-to" questions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Supported Platforms</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Segment</li>
                <li>• mParticle</li>
                <li>• Lytics</li>
                <li>• Zeotap</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Example Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                "How do I set up a new source in Segment?"
              </div>
              <div className="bg-gray-100 p-4 rounded">
                "How can I create a user profile in mParticle?"
              </div>
              <div className="bg-gray-100 p-4 rounded">
                "How do I build an audience segment in Lytics?"
              </div>
              <div className="bg-gray-100 p-4 rounded">
                "How can I integrate my data with Zeotap?"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;