import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ hasNewAnswerNotification }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };
    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            <span className="font-mono tracking-widest">StackIt</span>
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/ask"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                            Ask Question
                        </Link>
                        
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {/* Notifications Bell */}
                                <div className="relative">
                                    <button className="text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 relative">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {hasNewAnswerNotification && (
                                            <span className="absolute top-0 right-0 h-3 w-3 bg-red-600 rounded-full border-2 border-white block" />
                                        )}
                                    </button>
                                </div>

                                {/* User Avatar and Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {/* User Avatar */}
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="hidden md:block text-sm font-medium">
                                            {user?.username || 'User'}
                                        </span>
                                       
                                        
                                    </button>

                                   
                                    
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link 
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
