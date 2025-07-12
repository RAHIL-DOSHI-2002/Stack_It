import React, { useState } from 'react';

const AnswerForm = ({ questionId, onSubmit }) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                questionId,
                body: answer,
                createdAt: new Date().toISOString()
            });
            setAnswer('');
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Write your answer here..."
                        required
                    />
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Use clear, concise language and provide examples where possible.
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !answer.trim()}
                        className={`px-6 py-2 rounded-md font-medium ${
                            isSubmitting || !answer.trim()
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Post Answer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnswerForm;
