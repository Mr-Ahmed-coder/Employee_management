import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// const API_URL = 'http://localhost:5000/api';

axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;
axios.defaults.withCredentials = true;

// Configure axios defaults
// axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Set axios auth header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Load user on mount / token change
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('/auth/me');
                    setUser(res.data.data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        const { token: newToken, data } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(data);
        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post('/auth/register', userData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const resetPassword = async (currentPassword, newPassword) => {
        const res = await axios.put('/auth/reset-password', {
            currentPassword,
            newPassword,
        });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        }
        return res.data;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                resetPassword,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
