import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import {} from '../styles/ForgotPassword.css'

function ForgotPasswordPages() {
    const [loading, setLoading] = useState(false);

    const handleSendMail=()=>{
        alert("Gönderildi")
        setLoading(true)
        useEffect=()=>{
           return setLoading(false)
        }
    }
    return (
        <div className='forgot-password-menu-table'>
            <div className='forgot-password-menu'>
                <h1 className='typing-text'>Şifremi Unuttum</h1>
                <div className='forgot-password-info'>
                <p>Mail adresinizi giriniz.</p>
                <p>Şifrenizi sıfırlamak için bir e-posta gönderilecektir...</p>
                </div>

                <TextField
                    id="outlined-email"
                    label="E-posta"
                    variant="outlined"
                    sx={{ width: '250px' }}
                />
                <div>
                <Button
                        onClick={handleSendMail}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Mail Gönderildi" : "Mail Gönder"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPages