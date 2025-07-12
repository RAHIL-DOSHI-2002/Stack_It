import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { questionsAPI } from '../api';
import { API_CONFIG } from '../config/api';

const HomePage = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const questionsPerPage = 10;

    // Dropdown states
    const [showSortDropdown, setShowSortDropdown] = useState(false);
   
    const [selectedSort, setSelectedSort] = useState('newest');
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Refs for dropdown management
    const sortDropdownRef = useRef(null);
   

    // Dropdown options
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'most-answers', label: 'Most Answers' },
        { value: 'least-answers', label: 'Least Answers' }
    ];

    

   
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
                setShowMoreDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notification state
    const [hasNewAnswerNotification, setHasNewAnswerNotification] = useState(false);

    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user || !user._id) {
                setHasNewAnswerNotification(false);
                return;
            }
            try {
                const res = await axiosInstance.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const notifications = res.data || [];
                // If any notification is unread, show the red dot
                const hasUnread = notifications.some(n => n.isRead === false);
                setHasNewAnswerNotification(hasUnread);
            } catch (err) {
                setHasNewAnswerNotification(false);
            }
        };
        fetchNotifications();
    }, [user]);

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null);
                // Use real API
                const response = await questionsAPI.getAll({
                    page: currentPage,
                    limit: questionsPerPage,
                    sort: selectedSort,
                    filter: selectedFilter,
                    search: searchTerm
                });
                const fetchedQuestions = response.data;
                setQuestions(fetchedQuestions);
                setFilteredQuestions(fetchedQuestions);
                setTotalPages(1);
                setTotalQuestions(fetchedQuestions.length);
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to fetch questions. Please try again.');
                setQuestions([]);
                setFilteredQuestions([]);
                setTotalPages(1);
                setTotalQuestions(0);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [currentPage, selectedSort, selectedFilter, searchTerm, user]);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when searching
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Handle dropdown selections
    const handleSortChange = (sortValue) => {
        setSelectedSort(sortValue);
        setCurrentPage(1);
        setShowSortDropdown(false);
    };

   

    // Handle search input
    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // Handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter questions locally if needed (for mock data)
    useEffect(() => {
        let filtered = [...questions];

       
       
filtered.sort((a, b) => {
            switch (selectedSort) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'most-answers':
                    return b.answerCount - a.answerCount;
                case 'least-answers':
                    return a.answerCount - b.answerCount;
                default:
                    return 0;
            }
        });

        setFilteredQuestions(filtered);
        setTotalQuestions(filtered.length);
    }, [questions, searchTerm, selectedSort, selectedFilter, user]);

    // Dropdown component
    const Dropdown = ({ label, options, selectedValue, onSelect, isOpen, onToggle, dropdownRef }) => (
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full sm:w-auto space-x-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
                <span className="truncate">{options.find(opt => opt.value === selectedValue)?.label || label}</span>
                <svg 
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                selectedValue === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} hasNewAnswerNotification={hasNewAnswerNotification} />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Questions</h1>
                    <Link
                        to="/ask"
                        className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
                    >
                        Ask New Question
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Sort by:</span>
                        <Dropdown
                            label="Sort"
                            options={sortOptions}
                            selectedValue={selectedSort}
                            onSelect={handleSortChange}
                            isOpen={showSortDropdown}
                            onToggle={() => setShowSortDropdown(!showSortDropdown)}
                            dropdownRef={sortDropdownRef}
                        />
                    </div>
                    
                   
                    
                    
                </div>

                {/* Questions Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <div className="text-lg text-gray-600">Loading questions...</div>
                                <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest questions</div>
                            </div>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-lg text-gray-600">
                                {searchTerm ? 'No questions found matching your search.' : 'No questions available.'}
                            </div>
                        </div>
                    ) : (
                        filteredQuestions.map((question) => (
                            <QuestionCard 
                                key={question._id || question.id}
                                id={question._id || question.id}
                                title={question.title}
                                description={question.description || question.body}
                                tags={question.tags}
                                author={question.authorId?.username || question.author || 'Unknown'}
                                answerCount={question.answerCount || 0}
                            />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg ${
                                    currentPage === 1
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 rounded-lg ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg ${
                                    currentPage === totalPages
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default HomePage;
