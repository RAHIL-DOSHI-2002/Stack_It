// Mock API data for development
export const mockQuestions = [
    {
        id: 1,
        title: "How to handle state in React functional components?",
        description: "<p>I'm trying to understand how to properly manage state in React functional components using hooks. Can someone explain the best practices?</p><p>I've been working with class components but want to transition to functional components with hooks.</p>",
        author: "John Doe",
        createdAt: "2024-01-15T10:30:00Z",
        tags: ["react", "hooks", "state"],
        votes: 15,
        answerCount: 3
    },
    {
        id: 2,
        title: "What's the difference between let and const in JavaScript?",
        description: "<p>I'm confused about when to use let vs const in JavaScript. Can someone explain the differences and best practices?</p>",
        author: "Jane Smith",
        createdAt: "2024-01-14T14:20:00Z",
        tags: ["javascript", "variables", "es6"],
        votes: 8,
        answerCount: 2
    },
    {
        id: 3,
        title: "How to center a div in CSS?",
        description: "<p>I need to center a div both horizontally and vertically. What are the modern CSS methods to achieve this?</p>",
        author: "Bob Wilson",
        createdAt: "2024-01-13T09:15:00Z",
        tags: ["css", "flexbox", "grid"],
        votes: 12,
        answerCount: 4
    },
    {
        id: 4,
        title: "Best practices for API error handling in JavaScript?",
        description: "<p>What are the best practices for handling errors when making API calls in JavaScript? Should I use try-catch or .catch()?</p>",
        author: "Alice Johnson",
        createdAt: "2024-01-12T16:45:00Z",
        tags: ["javascript", "api", "error-handling"],
        votes: 6,
        answerCount: 1
    }
];

export const mockAnswers = [
    {
        id: 1,
        description: "<p>You can use the <code>useState</code> hook to manage state in functional components. Here's how:</p><pre><code>import React, { useState } from 'react';\n\nfunction MyComponent() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}</code></pre>",
        author: "Jane Smith",
        createdAt: "2024-01-15T14:20:00Z",
        votes: 8
    },
    {
        id: 2,
        description: "<p>Additionally, you can use <code>useEffect</code> for side effects:</p><pre><code>useEffect(() => {\n  // Side effect code here\n  console.log('Component mounted or count changed');\n}, [count]); // Dependency array</code></pre><p>This is similar to componentDidMount and componentDidUpdate in class components.</p>",
        author: "Mike Johnson",
        createdAt: "2024-01-15T16:45:00Z",
        votes: 12
    }
];

export const mockUsers = [
    {
        id: 1,
        username: "demo",
        email: "demo@example.com",
        name: "Demo User"
    }
];

// Mock API functions
export const mockAPI = {
    // Questions
    getQuestions: async (params = {}) => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return {
            data: {
                questions: mockQuestions,
                pagination: {
                    totalQuestions: mockQuestions.length,
                    totalPages: 1,
                    currentPage: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            }
        };
    },
    
    getQuestion: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const question = mockQuestions.find(q => q.id === parseInt(id));
        if (!question) throw new Error('Question not found');
        return { data: question };
    },
    
    getAnswers: async (questionId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: mockAnswers };
    },
    
    // Auth
    login: async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (credentials.username === "demo" && credentials.password === "demo") {
            return {
                data: {
                    token: "mock-jwt-token-" + Date.now(),
                    user: mockUsers[0]
                }
            };
        }
        throw new Error('Invalid credentials');
    },
    
    register: async (userData) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            data: {
                token: "mock-jwt-token-" + Date.now(),
                user: {
                    id: Date.now(),
                    username: userData.username,
                    email: userData.email,
                    name: userData.username
                }
            }
        };
    },
    
    // Vote (just return success)
    vote: async (type, id) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { data: { success: true } };
    },
    
    // Submit question
    createQuestion: async (questionData) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            data: {
                id: Date.now(),
                ...questionData,
                author: "Demo User",
                createdAt: new Date().toISOString(),
                votes: 0,
                answerCount: 0
            }
        };
    },
    
    // Submit answer
    createAnswer: async (answerData) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            data: {
                id: Date.now(),
                description: answerData.content,
                author: "Demo User",
                createdAt: new Date().toISOString(),
                votes: 0
            }
        };
    }
};

export default mockAPI;
