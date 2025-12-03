import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import './Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        age: undefined,
        height: undefined,
        weight: undefined
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {register} = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'age' || name === 'height' || name === 'weight' ? value ? parseFloat(value): undefined : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Filter out undefined/null/empty optional fields
            const registrationData: RegisterData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };
            // Only include numeric fields if they have valid values
            if (formData.age !== undefined && formData.age !== null && !isNaN(formData.age) && formData.age > 0) {
                registrationData.age = formData.age;
            }
            if (formData.height !== undefined && formData.height !== null && !isNaN(formData.height) && formData.height > 0) {
                registrationData.height = formData.height;
            }
            if (formData.weight !== undefined && formData.weight !== null && !isNaN(formData.weight) && formData.weight > 0) {
                registrationData.weight = formData.weight;
            }
            await register(registrationData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration Failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className='auth-container'>
            <div className='auth-split'>
                <div className='auth-image-side'>
                    <div className='auth-overlay'>
                        <h1 className='auth-tagline'>Start Your Fitness<br />Journey Today</h1>
                    </div>
                </div>
                <div className='auth-form-side'>
                    <div className='auth-form-container'>
                        <h2 className='auth-title'>Create Your Account</h2>
                        <p className='auth-subtitle'>Already have an account? <Link to="/login" className='auth-link'>Login</Link></p>
                        {error && (<div className='auth-error'>{error}</div>)}
                        <form onSubmit={handleSubmit} className='auth-form'>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label htmlFor="name">Name</label>
                                    <input id='name' type="text" name='name' value={formData.name} onChange={handleChange} placeholder='Enter your name' required className='form-input' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="age">Age</label>
                                    <input id='age' type="number" name='age' value={formData.age || ''} onChange={handleChange} placeholder='Enter your age (optional)' className='form-input' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="email">Email</label>
                                    <input id='email' type="email" name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email' required className='form-input' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="password">Password</label>
                                    <div className='password-input-wrapper'>
                                        <input id='password' type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange} placeholder='Enter your password' required className='form-input' />
                                        <button type='button' className='password-toggle' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                                    </div>
                                </div>
                                <div className='form-row'>
                                    <div className='form-group'>
                                        <label htmlFor="height">Height</label>
                                        <input id='height' type="number" name='height' value={formData.height || ''} onChange={handleChange} placeholder='Enter your height (optional) in cm' className='form-input' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor="weight">Weight</label>
                                        <input id='weight' type="number" name='weight' value={formData.weight || ''} onChange={handleChange} placeholder='Enter your weight (optional) in kg' className='form-input' />
                                    </div>
                                </div>
                            </div>
                            <button type='submit' disabled={loading} className='auth-button'>{loading ? 'Registering...' : 'Register'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;