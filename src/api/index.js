import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
};

export const questionsAPI = {
    getAll: (params = {}) => api.get('/questions', { params }),
    getById: (id) => api.get(`/questions/${id}`),
    create: (questionData) => api.post('/questions', questionData),
    update: (id, questionData) => api.put(`/questions/${id}`, questionData),
    delete: (id) => api.delete(`/questions/${id}`),
    vote: (id, voteType) => api.post(`/questions/${id}/vote`, { voteType }),
};

export const answersAPI = {
    getByQuestionId: (questionId) => api.get(`/answers?questionId=${questionId}`),
    create: (answerData) => api.post('/answers', answerData),
    update: (id, answerData) => api.put(`/answers/${id}`, answerData),
    delete: (id) => api.delete(`/answers/${id}`),
    vote: (id, voteType) => api.post(`/answers/${id}/vote`, { voteType }),
};

export const tagsAPI = {
    getAll: () => api.get('/tags'),
    getPopular: () => api.get('/tags/popular'),
};

export const searchAPI = {
    questions: (query, filters = {}) => api.get('/search/questions', { 
        params: { q: query, ...filters } 
    }),
    users: (query) => api.get('/search/users', { params: { q: query } }),
};

export default api;
