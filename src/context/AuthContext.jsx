import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api';

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
    LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload.error,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOAD_USER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOAD_USER_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user from localStorage on app start
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                try {
                    const response = await authAPI.getProfile();
                    dispatch({
                        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                        payload: { user: response.data },
                    });
                } catch (error) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    dispatch({
                        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                    });
                }
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                });
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });
            
            const response = await authAPI.login(credentials);
            const { user, token } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user },
            });
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: { error: errorMessage },
            });
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.REGISTER_START });
            
            const response = await authAPI.register(userData);
            const { user, token } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            dispatch({
                type: AUTH_ACTIONS.REGISTER_SUCCESS,
                payload: { user },
            });
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: { error: errorMessage },
            });
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    const value = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
