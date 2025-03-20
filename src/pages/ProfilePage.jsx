import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { } from "../styles/ProfilePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import { motion } from "framer-motion";
import { profileService } from '../axios/axios';

function ProfilePage() {
    const [profile, setProfile] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const updateMenuState = useCallback((newState) => {
        setIsOpen(newState);
    }, []);

    useEffect(() => {
        const getProfiles = async () => {
            try {
                const response = await profileService.getProfile();
                if (response && response.data) {
                    setProfile(response.data); // Ana veri nesnesini saklayın
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

    return (
        <div>
            <div>
                <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />

                <div>
                    <motion.div
                        initial={{ scale: 1, x: 0 }}
                        animate={{ scale: isOpen ? 1 : 1, x: isOpen ? 350 : 70 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`${isOpen ? "w-full" : "w-full flex justify-center"}`}
                    >
                        {profile ? (
                            <div>
                                <div className='profile'>
                                    <div className='profile-info'>
                                        <FontAwesomeIcon icon={faAddressCard} size="10x" />
                                        <div className='profile-content'>
                                            <p>{profile.name}</p>
                                            <h3>{profile.roleName}</h3>
                                            <h3>{profile.email}</h3>
                                        </div>
                                    </div>
                                    <div className='profile-buttons'>
                                        <button>cewfwef</button>
                                        <button>cdwefwef</button>
                                    </div>
                                </div>
                                <div>
                                    <p>Şirket Adı</p>
                                    <p>{profile.tenantName}</p>
                                    <p>Tel no {profile.phoneNumber}</p>
                                    <p>Doğum Tarihi{profile.birthDate}</p>
                                    <p>TC{profile.tc}</p>
                                    <p>Kan Grubu{profile.bloodType}</p>
                                    <p>Departman : {profile?.userDepartmentsResponse?.[0]?.departmentName}</p>

                                </div>
                            </div>

                        ) : (
                            <div className='profile-info'>
                                <FontAwesomeIcon icon={faAddressCard} size="10x" />
                                <h3>Kullanıcı bilgisi yükleniyor...</h3>
                            </div>
                        )}

                    </motion.div>

                    <motion.div
                        initial={{ x: 0 }}
                        animate={{
                            x: isOpen ? 100 : 0,
                            width: isOpen ? 'calc(100% - 200px)' : '100%',
                        }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="flex flex-col items-center"
                    >
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;