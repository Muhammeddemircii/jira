import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginService } from '../axios/axios';
import { setUser, setToken } from '../store/slices/authSlice';
import '../styles/Login.css' 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        if (e) e.preventDefault(); 

        if (!email || !password) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const result = await loginService.login(email, password);
            
            if (result.success && result.token) {
                dispatch(setUser(result.user));
                dispatch(setToken(result.token));
                navigate('/HomePage');
            }
        } catch (err) {
            setError(err.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate("/ForgotPasswordPages");
    };

    return (
        <div className="login">
            <h1>LA</h1>
            <div className="login-write">
                <h3>Led Asistan</h3>
                <p>İşleri planlamak ve takip etmek için giriş yapınız.</p>
            </div>
            
            <form className="login-input" onSubmit={handleLogin}>
                <TextField
                    label="E-posta"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!error}
                    InputProps={{
                        sx: {
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }
                    }}
                />
                <TextField
                    label="Şifre"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error}
                    InputProps={{
                        sx: {
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }
                    }}
                />
                
                <div className="giris-yap">
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </Button>
                </div>
                
                {error && <div className="error-message">{error}</div>}
            </form>
            
            <button className='forgot-password-button' onClick={handleForgotPassword}>
                Şifremi Unuttum
            </button>
        </div>
    );
}

export default LoginPage;
