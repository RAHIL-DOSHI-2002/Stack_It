import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AnswerForm from '../components/AnswerForm';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { questionsAPI, answersAPI } from '../api';
import { API_CONFIG } from '../config/api';

const QuestionDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [votingStates, setVotingStates] = useState({});
    // Local state for votes
    const [questionVotes, setQuestionVotes] = useState(null);
    const [answerVotes, setAnswerVotes] = useState({});
    // Remove unused answerContent and isSubmittingAnswer
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    useEffect(() => {
        const fetchQuestionDetails = async () => {
            try {
                setLoading(true);
                setError('');
                // Use real API
                const questionResponse = await questionsAPI.getById(id);
                const fetchedQuestion = questionResponse.data;
                // Fetch answers for this question
                const answersResponse = await answersAPI.getByQuestionId(id);
                const fetchedAnswers = answersResponse.data;
                setQuestion(fetchedQuestion);
                setAnswers(fetchedAnswers);
                setQuestionVotes(fetchedQuestion.votes);
                // Set answerVotes as a map of answerId: votes
                const answerVotesMap = {};
                fetchedAnswers.forEach(ans => {
                    answerVotesMap[ans._id] = ans.votes;
                });
                setAnswerVotes(answerVotesMap);
            } catch (err) {
                console.error('Error fetching question details:', err);
                setError('Failed to load question details.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionDetails();
    }, [id]);

    // New voting logic using useState for local vote value
    const handleVote = async (type, answerId = null) => {
        if (!user) {
            setShowLoginPopup(true);
            return;
        }
        try {
            const voteKey = answerId ? `answer-${answerId}` : `question-${id}`;
            setVotingStates(prev => ({ ...prev, [voteKey]: true }));
            if (answerId) {
                setAnswerVotes(prev => {
                    const current = prev[answerId] ?? 0;
                    const delta = type === 'upvote' ? 1 : -1;
                    return { ...prev, [answerId]: Math.max(0, current + delta) };
                }); console.log("before")
                await answersAPI.vote(answerId, type);
                console.log("after")
            } else {
                setQuestionVotes(prev => {
                    const current = typeof prev === 'number' && isFinite(prev) ? prev : 0;
                    const delta = type === 'upvote' ? 1 : -1;
                    return Math.max(0, current + delta);
                });
                await questionsAPI.vote(id, type);
            }
        } catch (err) {
            console.error('Error voting:', err);
            if (err.response?.status === 409) {
                setError('You have already voted on this item.');
            } else if (err.response?.status === 401) {
                setShowLoginPopup(true);
            } else {
                setError('Unable to register your vote at this time. Please refresh the page or try again later.');
            }
        } finally {
            const voteKey = answerId ? `answer-${answerId}` : `question-${id}`;
            setVotingStates(prev => ({ ...prev, [voteKey]: false }));
        }
    };

    // New handler for AnswerForm
    const handleAnswerFormSubmit = async ({ questionId, body }) => {
        // Check if user is logged in
        if (!user) {
            setShowLoginPopup(true);
            throw new Error('Not logged in');
        }
        // Validate answer content
        if (!body || body.trim().length < 10) {
            setError('Answer must be at least 10 characters long.');
            throw new Error('Answer too short');
        }
        setError('');
        try {
            const response = await answersAPI.create({ questionId, content: body });
            const newAnswer = response.data;
            setAnswers(prev => [...prev, newAnswer]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
            throw err;
        }
    };

    const handleLoginPopupClose = () => {
        setShowLoginPopup(false);
        setError(''); // Clear any voting-related errors
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar user={user} />
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-lg text-gray-600">Loading question details...</div>
                    <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the question and answers</div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar user={user} />
                <div className="flex items-center justify-center py-20">
                    <div className="text-lg text-gray-600">Question not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-4xl">
                {/* Breadcrumbs */}
                <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <span className="mx-2">&gt;</span>
                    <span className="text-gray-400">Question</span>
                    <span className="mx-2">&gt;</span>
                    <span className="text-gray-900 font-medium truncate max-w-xs inline-block">
                        {question.title}
                    </span>
                </nav>
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                {/* Question */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Question Vote Buttons */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-4 sm:space-x-0 sm:space-y-2 order-2 sm:order-1">
                            <button
                                onClick={() => handleVote('upvote')}
                                disabled={votingStates[`question-${id}`]}
                                title={!user ? "Login to vote" : "Upvote this question"}
                                className={`p-2 rounded-full transition-colors disabled:opacity-50 relative ${
                                    !user 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                }`}
                            >
                                {votingStates[`question-${id}`] ? (
                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-gray-300 border-t-blue-600"></div>
                                ) : (
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                )}
                            </button>
                            <span className="text-lg sm:text-xl font-semibold text-gray-700">{typeof questionVotes === 'number' ? questionVotes : question.votes}</span>
                            <button
                                onClick={() => handleVote('downvote')}
                                disabled={votingStates[`question-${id}`]}
                                title={!user ? "Login to vote" : "Downvote this question"}
                                className={`p-2 rounded-full transition-colors disabled:opacity-50 relative ${
                                    !user 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                }`}
                            >
                                {votingStates[`question-${id}`] ? (
                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-gray-300 border-t-blue-600"></div>
                                ) : (
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {/* Question Content */}
                        <div className="flex-1 order-1 sm:order-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
                            {/* Question Description - Render HTML */}
                            <div 
                                className="prose prose-sm max-w-none mb-4 text-gray-700 text-sm sm:text-base"
                                dangerouslySetInnerHTML={{ __html: question.description }}
                            />
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                                {question.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {/* Author and Date */}
                            <div className="text-xs sm:text-sm text-gray-500">
                                Asked by <span className="font-medium">{question.author}</span> on {new Date(question.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {answers.length === 0 ? (
                            <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
                                No answers yet. Be the first to answer!
                            </div>
                        ) : (
                            answers.map((answer) => (
                                <div key={answer._id} className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Answer Vote Buttons */}
                                        <div className="flex flex-col items-center space-y-2">
                                            <button
                                                onClick={() => handleVote('upvote', answer._id)}
                                                disabled={votingStates[`answer-${answer._id}`]}
                                                title={!user ? "Login to vote" : "Upvote this answer"}
                                                className={`p-2 rounded-full transition-colors disabled:opacity-50 relative ${
                                                    !user 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                            >
                                                {votingStates[`answer-${answer._id}`] ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            <span className="text-lg font-medium text-gray-700">{typeof answerVotes[answer._id] === 'number' ? answerVotes[answer._id] : answer.votes}</span>
                                            <button
                                                onClick={() => handleVote('downvote', answer._id)}
                                                disabled={votingStates[`answer-${answer._id}`]}
                                                title={!user ? "Login to vote" : "Downvote this answer"}
                                                className={`p-2 rounded-full transition-colors disabled:opacity-50 relative ${
                                                    !user 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                }`}
                                            >
                                                {votingStates[`answer-${answer._id}`] ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {/* Answer Content */}
                                        <div className="flex-1">
                                            <div 
                                                className="prose prose-sm max-w-none mb-4 text-gray-700"
                                                dangerouslySetInnerHTML={{ __html: answer.content }}
                                            />
                                            <div className="text-sm text-gray-500">
                                                Answered by <span className="font-medium">{answer.authorId?.username || 'Unknown'}</span> on {new Date(answer.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Answer Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
                    {user ? (
                        <AnswerForm questionId={id} onSubmit={handleAnswerFormSubmit} />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">You need to be logged in to post an answer.</p>
                            <button
                                onClick={() => setShowLoginPopup(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Login to Answer
                            </button>
                        </div>
                    )}
                </div>

                {/* Login Popup */}
                {showLoginPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
                                <button
                                    onClick={handleLoginPopupClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">
                                You need to be logged in to post answers and vote on questions.
                            </p>
                            <div className="flex space-x-4">
                                <Link
                                    to="/login"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={handleLoginPopupClose}
                                >
                                    Login
                                </Link>
                                <button
                                    onClick={handleLoginPopupClose}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetailPage;
