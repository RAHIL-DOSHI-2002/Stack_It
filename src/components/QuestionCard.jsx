import React from 'react';
import { Link } from 'react-router-dom';

const QuestionCard = ({ id, title, description, tags = [], author, answerCount = 0 }) => {
    // Truncate description to 150 characters
    const truncatedDescription = description && description.length > 150 
        ? `${description.substring(0, 150)}...` 
        : description;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex flex-row sm:flex-col items-center sm:text-center min-w-[80px] justify-center sm:justify-start">
                    <div className="text-lg font-semibold text-gray-700 mr-2 sm:mr-0">{answerCount}</div>
                    <div className="text-sm text-gray-500">
                        {answerCount === 1 ? 'answer' : 'answers'}
                    </div>
                </div>
                
                <div className="flex-1">
                    <Link 
                        to={`/question/${id}`}
                        className="text-lg sm:text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block leading-tight"
                    >
                        {title}
                    </Link>
                    
                    {description && (
                        <p className="text-gray-700 mb-3 text-sm sm:text-base">
                            {truncatedDescription}
                        </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                        {tags.map((tag, index) => (
                            <span 
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs sm:text-sm hover:bg-gray-200 cursor-pointer"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-500">
                        Asked by {author}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
