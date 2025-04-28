import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

function ForgotPasswordPages() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSendMail = async (e) => {
        if (e) e.preventDefault();

        if (!email) {
            setError('Lütfen e-posta adresinizi girin');
            return;
        }

        try {
            setLoading(true);
            setError('');
        
            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1500);
            
        } catch (err) {
            setError(err.message || 'Mail gönderilirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/');
    };

    return (
        <div className="login">
            <h1>LA</h1>
            <div className="login-write">
                <h3>Led Asistan</h3>
                <p>Şifrenizi sıfırlamak için e-posta adresinizi giriniz.</p>
            </div>
            
            <form className="login-input" onSubmit={handleSendMail}>
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
                
                <div className="giris-yap">
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || success}
                        fullWidth
                    >
                        {loading ? "Gönderiliyor..." : success ? "Mail Gönderildi" : "Şifre Sıfırlama Maili Gönder"}
                    </Button>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.</div>}
            </form>
            
            <button className='forgot-password-button' onClick={handleBackToLogin}>
                Giriş Sayfasına Dön
            </button>
        </div>
    );
}

export default ForgotPasswordPages;