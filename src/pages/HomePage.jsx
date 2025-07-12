import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { mockAPI } from '../api/mockAPI';
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
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [selectedSort, setSelectedSort] = useState('newest');
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Refs for dropdown management
    const sortDropdownRef = useRef(null);
    const filterDropdownRef = useRef(null);
    const moreDropdownRef = useRef(null);

    // Dropdown options
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'most-votes', label: 'Most Votes' },
        { value: 'least-votes', label: 'Least Votes' },
        { value: 'most-answers', label: 'Most Answers' },
        { value: 'least-answers', label: 'Least Answers' }
    ];

    const filterOptions = [
        { value: 'all', label: 'All Questions' },
        { value: 'unanswered', label: 'Unanswered' },
        { value: 'answered', label: 'Answered' },
        { value: 'my-questions', label: 'My Questions' }
    ];

    const moreOptions = [
        { value: 'trending', label: 'Trending' },
        { value: 'recent-activity', label: 'Recent Activity' },
        { value: 'featured', label: 'Featured' },
        { value: 'bounty', label: 'Bounty' }
    ];

    // Close dropdowns when clicking outside
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

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Use mock API by default for demo
                const response = await mockAPI.getQuestions({
                    page: currentPage,
                    limit: questionsPerPage,
                    sort: selectedSort,
                    filter: selectedFilter,
                    search: searchTerm
                });
                
                const { questions: fetchedQuestions, pagination } = response.data;
                
                setQuestions(fetchedQuestions);
                setFilteredQuestions(fetchedQuestions);
                setTotalPages(pagination.totalPages);
                setTotalQuestions(pagination.totalQuestions);
                
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to fetch questions. Please try again.');
                
                // Ultimate fallback - empty state
                setQuestions([]);
                setFilteredQuestions([]);
                setTotalPages(1);
                setTotalQuestions(0);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [currentPage, selectedSort, selectedFilter, searchTerm]);

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

    const handleFilterChange = (filterValue) => {
        setSelectedFilter(filterValue);
        setCurrentPage(1);
        setShowFilterDropdown(false);
    };

    const handleMoreAction = (action) => {
        // Handle more dropdown actions
        console.log('More action selected:', action);
        setShowMoreDropdown(false);
        // Add specific logic for each action as needed
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

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(question =>
                question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                question.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply filter
        if (selectedFilter === 'unanswered') {
            filtered = filtered.filter(question => question.answerCount === 0);
        } else if (selectedFilter === 'answered') {
            filtered = filtered.filter(question => question.answerCount > 0);
        } else if (selectedFilter === 'my-questions' && user) {
            filtered = filtered.filter(question => question.author === user.username);
        }

        // Apply sort
        filtered.sort((a, b) => {
            switch (selectedSort) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'most-votes':
                    return b.votes - a.votes;
                case 'least-votes':
                    return a.votes - b.votes;
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
            <Navbar user={user} />
            
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
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Filter:</span>
                        <Dropdown
                            label="Filter"
                            options={filterOptions}
                            selectedValue={selectedFilter}
                            onSelect={handleFilterChange}
                            isOpen={showFilterDropdown}
                            onToggle={() => setShowFilterDropdown(!showFilterDropdown)}
                            dropdownRef={filterDropdownRef}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">More:</span>
                        <Dropdown
                            label="More"
                            options={moreOptions}
                            selectedValue=""
                            onSelect={handleMoreAction}
                            isOpen={showMoreDropdown}
                            onToggle={() => setShowMoreDropdown(!showMoreDropdown)}
                            dropdownRef={moreDropdownRef}
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
                                key={question.id} 
                                id={question.id}
                                title={question.title}
                                description={question.body}
                                tags={question.tags}
                                author={question.author}
                                answerCount={question.answerCount}
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
};

export default HomePage;
