import React, { useState } from 'react';

const Header = ({ username, onSearch, onAddQuestion, onFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <header className="flex items-center px-5 py-2 bg-gray-100 border-b border-gray-300 gap-4">
            <div className="font-bold text-xl text-blue-600 mr-5">
                <span className="font-mono tracking-widest">StackIt</span>
            </div>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-3 py-2 rounded border border-gray-300 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
                className="px-4 py-2 mr-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={onAddQuestion}
            >
                Add Question
            </button>
            <button
                className="px-4 py-2 mr-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={onFilter}
            >
                Filter
            </button>
            <div className="ml-auto font-medium text-gray-700">
                {username ? `Logged in as: ${username}` : 'Not logged in'}
            </div>
        </header>
    );
};

export default Header;
