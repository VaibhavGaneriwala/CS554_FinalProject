import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({email, password});
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login Failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-container">
            <div className='auth-split'>
                <div className='auth-image-side'>
                    <div className='auth-overlay'>
                        <h1 className='auth-tagline'>Track your Progress, <br />Achieve Your Goals</h1>
                    </div>
                </div>
                <div className='auth-form-side'>
                    <div className='auth-form-container'>
                        <h2 className='auth-title'>Welcome Back!</h2>
                        <p className='auth-subtitle'>Don't have an account? <Link to="/register" className='auth-link'>Sign up</Link></p>
                        {error && (<div className='auth-error'>{error}</div>)}
                        <form onSubmit={handleSubmit} className='auth-form'>
                            <div className='form-group'>
                                <label htmlFor="email">Email</label>
                                <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' required className='form-input' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="password">Password</label>
                                <div className='password-input-wrapper'>
                                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' required className='form-input' />
                                <button type='button' className='password-toggle' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                            </div>
                            <button type='submit' disabled={loading} className='auth-button'>{loading ? 'Logging in...' : 'Login'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;