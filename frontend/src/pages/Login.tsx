import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const errorRef = useRef<string>('');
    const formRef = useRef<HTMLFormElement>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Keep error ref in sync with error state
    useEffect(() => {
        errorRef.current = error;
    }, [error]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) {
            return;
        }
        
        // Clear previous error
        setError('');
        errorRef.current = '';
        setLoading(true);
        
        try {
            await login({email, password});
            // Only navigate on success - clear error if successful
            setError('');
            navigate('/dashboard');
        } catch (err: any) {
            // Extract error message
            let errorMessage = 'Login Failed';
            if (err?.message) {
                errorMessage = err.message;
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                errorMessage = err.response.data.errors.join(', ');
            }
            
            // Set error in both state and ref
            setError(errorMessage);
            errorRef.current = errorMessage;
            
            // Force a small delay to ensure state update
            setTimeout(() => {
                if (errorRef.current) {
                    setError(errorRef.current);
                }
            }, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Don't clear error on input change - let user see the error until they submit again
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        // Don't clear error on input change - let user see the error until they submit again
    };
    return (
        <div className="auth-container">
            <h1 className="auth-page-title">Fitness and Calorie Tracker</h1>
            <div className='auth-split'>
                <div className='auth-image-side'>
                    <div className='auth-overlay'>
                        <img src="/logo_app.png" alt="Fitness and Calorie Tracker" className='auth-logo' />
                        <h1 className='auth-tagline'>Track your Progress, <br />Achieve Your Goals</h1>
                    </div>
                </div>
                <div className='auth-form-side'>
                    <div className='auth-form-container'>
                        <h2 className='auth-title'>Welcome Back!</h2>
                        <p className='auth-subtitle'>Don't have an account? <Link to="/register" className='auth-link'>Sign up</Link></p>
                        {error && (
                            <div 
                                key={error} 
                                className='auth-error'
                                style={{ display: 'block', visibility: 'visible' }}
                            >
                                {error}
                            </div>
                        )}
                        <form ref={formRef} onSubmit={handleSubmit} className='auth-form' noValidate>
                            <div className='form-group'>
                                <label htmlFor="email">Email <span className="required-asterisk">*</span></label>
                                <input id='email' type='email' value={email} onChange={handleEmailChange} placeholder='Enter your email' required className='form-input' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="password">Password <span className="required-asterisk">*</span></label>
                                <div className='password-input-wrapper'>
                                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} placeholder='Enter your password' required className='form-input' />
                                <button type='button' className='password-toggle' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                            </div>
                            <button 
                                type='submit' 
                                disabled={loading} 
                                className='auth-button'
                                onClick={(e) => {
                                    // Additional safeguard
                                    if (loading) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;