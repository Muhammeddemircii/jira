import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { } from "../styles/ProfilePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faUser, faEnvelope, faBriefcase, faBuilding, faPhone, faBirthdayCake, faIdCard, faDroplet, faSitemap } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { profileService } from '../axios/axios';

function ProfilePage() {
    const [profile, setProfile] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const updateMenuState = useCallback((newState) => {
        setIsOpen(newState);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const getProfiles = async () => {
            try {
                const response = await profileService.getProfile();
                if (response && response.data) {
                    setProfile(response.data);
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.log("Profil çekilirken hata oluştu", error);
                setProfile(null);
            }
        };

        getProfiles();
    }, []);

    // Determine margin based on screen size and sidebar state
    const getMarginLeft = () => {
        if (windowWidth <= 768) {
            return "0px";
        }
        return isOpen ? "250px" : "70px";
    };

    return (
        <div className="profile-page-container">
            <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />

            <AnimatePresence>
                <motion.div
                    className="profile-content-wrapper"
                    initial={{ marginLeft: getMarginLeft() }}
                    animate={{ 
                        marginLeft: getMarginLeft(),
                        width: windowWidth <= 768 ? "100%" : `calc(100% - ${getMarginLeft()})`
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }}
                >
                    {profile ? (
                        <div className="profile">
                            <div className="profile-info">
                                <FontAwesomeIcon icon={faAddressCard} size="6x" style={{ color: "#20b494" }}/>
                                <div className="profile-content">
                                    <p>{profile.name}</p>
                                    <h3><FontAwesomeIcon icon={faBriefcase} /> {profile.roleName}</h3>
                                    <h3><FontAwesomeIcon icon={faEnvelope} /> {profile.email}</h3>
                                </div>
                                <div className="profile-buttons">
                                    <button>Profil Düzenle</button>
                                    <button>Şifre Değiştir</button>
                                </div>
                            </div>
                            
                            <div className="profile-details">
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faBuilding} /> Şirket Adı
                                    </span>
                                    <span className="detail-value">{profile.tenantName || "Belirtilmemiş"}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faPhone} /> Telefon Numarası
                                    </span>
                                    <span className="detail-value">{profile.phoneNumber || "Belirtilmemiş"}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faBirthdayCake} /> Doğum Tarihi
                                    </span>
                                    <span className="detail-value">{profile.birthDate || "Belirtilmemiş"}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faIdCard} /> TC Kimlik No
                                    </span>
                                    <span className="detail-value">{profile.tc || "Belirtilmemiş"}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faDroplet} /> Kan Grubu
                                    </span>
                                    <span className="detail-value">{profile.bloodType || "Belirtilmemiş"}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FontAwesomeIcon icon={faSitemap} /> Departman
                                    </span>
                                    <span className="detail-value">{profile?.userDepartmentsResponse?.[0]?.departmentName || "Belirtilmemiş"}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="profile">
                            <div className="profile-info">
                                <FontAwesomeIcon icon={faAddressCard} size="6x" style={{ color: "#20b494" }}/>
                                <h3>Kullanıcı bilgisi yükleniyor...</h3>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default ProfilePage;