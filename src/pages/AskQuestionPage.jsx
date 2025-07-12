import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { questionsAPI } from '../api';
import { API_CONFIG } from '../config/api';

const AskQuestionPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        tags: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Utility function to strip HTML tags for validation
    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Get plain text length for validation
    const getPlainTextLength = (html) => {
        return stripHtml(html).trim().length;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleBodyChange = (content) => {
        setFormData({
            ...formData,
            body: content
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Process tags - convert comma-separated string to array
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Prepare data for API - using 'description' instead of 'body'
            const questionData = {
                title: formData.title,
                description: formData.body, // API expects 'description' field
                tags: tagsArray
            };

            console.log('Submitting question:', questionData);

            // Use real API
            const response = await questionsAPI.create(questionData);
            console.log('Question submitted successfully:', response.data);
            // Redirect to homepage on success
            navigate('/');
            
        } catch (err) {
            console.error('Error submitting question:', err);
            setError(err.response?.data?.message || 'Failed to submit question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Get help from millions of developers worldwide
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {error && (
                            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Title Input */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                                Title
                            </label>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Be specific and imagine you're asking a question to another person
                            </p>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                                required
                            />
                        </div>

                        {/* Body Input with RichTextEditor */}
                        <div className="space-y-2">
                            <label htmlFor="body" className="block text-sm font-semibold text-gray-900">
                                What are the details of your problem?
                            </label>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Introduce the problem and expand on what you put in the title. Minimum 20 characters.
                            </p>
                            <RichTextEditor
                                value={formData.body}
                                onChange={handleBodyChange}
                                placeholder="Describe your problem in detail..."
                            />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                                <span>
                                    {getPlainTextLength(formData.body)} characters 
                                    {getPlainTextLength(formData.body) < 20 && 
                                        ` (${20 - getPlainTextLength(formData.body)} more needed)`
                                    }
                                </span>
                                <span className="text-xs">
                                    Rich text formatting will be preserved
                                </span>
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-2">
                            <label htmlFor="tags" className="block text-sm font-semibold text-gray-900">
                                Tags
                            </label>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
                            </p>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                placeholder="e.g. javascript, react, html (comma-separated)"
                            />
                            <p className="text-xs text-gray-500">
                                Separate tags with commas. Popular tags: javascript, python, react, html, css
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-200 gap-3 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.title || !formData.body || getPlainTextLength(formData.body) < 20}
                                className={`w-full sm:w-auto px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2 ${
                                    isSubmitting || !formData.title || !formData.body || getPlainTextLength(formData.body) < 20
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                }`}
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                                )}
                                {isSubmitting ? 'Posting Question...' : 'Post Your Question'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Guidelines */}
                <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Writing a good question</h3>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                        <li>• Summarize your problem in a one-line title</li>
                        <li>• Describe your problem in more detail</li>
                        <li>• Describe what you tried and what you expected to happen</li>
                        <li>• Add "tags" which help surface your question to members of the community</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AskQuestionPage;
