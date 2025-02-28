// src/components/Navigation/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">CDP Support Agent</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <Link
              to="/"
              className="px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/chat"
              className="ml-4 px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Chat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;