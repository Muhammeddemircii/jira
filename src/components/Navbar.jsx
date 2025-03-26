import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { 
  faBars, 
  faChevronDown, 
  faClipboardUser, 
  faSolarPanel, 
  faUserCircle, 
  faTasks, 
  faCog, 
  faBell, 
  faBuilding,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Navbar.css';
import '../styles/Cards.css';
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Navbar({ setIsOpen, isOpen }) {
    const [name, setName] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);
    const [tasksDropdownOpen, setTasksDropdownOpen] = useState(false);
    const [taskSettingsDropdownOpen, setTaskSettingsDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
    const [activePage, setActivePage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isPersonnel, setIsPersonnel] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setName(localStorage.getItem("user-name") || "Misafir");
        setTenantName(localStorage.getItem("tenant-name") || "Yükleniyor...");
        const userRole = localStorage.getItem("user-role") || "Yükleniyor...";
        setRoleName(userRole);
        setIsPersonnel(userRole.toLowerCase() === "personel");
        

        setTimeout(() => {
            setShowWelcome(true);
        }, 500);
    }, []);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/HomePage")) {
            setActivePage("home");
        } else if (path.includes("/StaffPage")) {
            setActivePage("staff");
        } else if (path.includes("/DepartmentPage")) {
            setActivePage("department");
        } else if (path.includes("/ProfilePage")) {
            setActivePage("profile");
        } else if (path.includes("/AnnualLeavesPage")) {
            setActivePage("annualLeaves");
        } else if (path.includes("/TaskTypePage")) {
            setActivePage("taskType");
        } else if (path.includes("/NotificationsPage")) {
            setActivePage("notifications");
        }
    }, [location]);

    // Redirect if personnel tries to access unauthorized pages
    useEffect(() => {
        if (isPersonnel) {
            const path = location.pathname;
            const authorizedPaths = ["/HomePage", "/StaffPage", "/ProfilePage", "/NotificationsPage"];
            
            // Check if current path is not authorized
            const isAuthorized = authorizedPaths.some(authorizedPath => path.includes(authorizedPath));
            
            if (!isAuthorized && path !== "/") {
                navigate("/HomePage");
            }
        }
    }, [location, isPersonnel, navigate]);

    const handlePanel = () => {
        navigate("/HomePage");
        setActivePage("home");
        if (window.innerWidth < 768) setIsOpen(false);
    }

    const handleStaff = () => {
        navigate("/StaffPage");
        setActivePage("staff");
        if (window.innerWidth < 768) setIsOpen(false);
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleDepartment = () => {
        navigate("/DepartmentPage");
        setActivePage("department");
        if (window.innerWidth < 768) setIsOpen(false);
    }

    const handleTaskType = () => {
        navigate("/TaskTypePage");
        setActivePage("taskType");
        if (window.innerWidth < 768) setIsOpen(false);
    }

    const handleProfile = () => {
        navigate("/ProfilePage");
        setActivePage("profile");
        if (window.innerWidth < 768) setIsOpen(false);
    }
    
    const handleNotifications = () => {
        navigate("/NotificationsPage");
        setActivePage("notifications");
        if (window.innerWidth < 768) setIsOpen(false);
    }
    
    const handleAnnualLeave = () => {
        const id = localStorage.getItem("user-id"); // Kullanıcı ID'sini localStorage'dan al
        if (!id) {
            console.error("Hata: Kullanıcı ID bulunamadı!");
            return;
        }
    
        navigate(`/AnnualLeavesPage/${id}`);
        setActivePage("annualLeaves");
    
        if (window.innerWidth < 768) setIsOpen(false);
    };
    
    const toggleTasksDropdown = () => setTasksDropdownOpen(!tasksDropdownOpen);
    const toggleTaskSettingsDropdown = () => setTaskSettingsDropdownOpen(!taskSettingsDropdownOpen);
    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    const toggleNotificationsDropdown = () => setNotificationsDropdownOpen(!notificationsDropdownOpen);
    
    const navItemsVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.3 + i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };
    
    const dropdownVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { 
            opacity: 1, 
            height: "auto",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };
    
    const dropdownItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3 }
        }
    };
    
    // Function to handle save
    const handleSave = () => {
        // Save changes logic here
        setHasUnsavedChanges(false);
        // You would typically call your API or dispatch an action here
        alert("Changes saved successfully!");
    };
    

    const startEditing = () => {
        setIsEditing(true);
        setHasUnsavedChanges(true);
    };
    

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };
        
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);
    
    return (
        <div>
            <div className="navbar">
                <motion.div
                    className={`welcome-info ${showWelcome ? "show" : ""}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: showWelcome ? 1 : 0, y: showWelcome ? 0 : -10 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p>LedAsistan'a Hoşgeldiniz, {name}</p>
                </motion.div>
                
                {hasUnsavedChanges && (
                    <motion.div 
                        className="save-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        <span>Kaydet</span>
                    </motion.div>
                )}
            </div>

            <motion.nav
                className={`navbar-nav ${isOpen ? "open" : ""}`}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <div className="tenant-name">
                        <h3>{tenantName}</h3>
                    </div>
                    <div className="name">
                        <h4>{name}</h4>
                    </div>
                    <div className="role-name">
                        <p>{roleName}</p>
                    </div>
                </motion.div>

                <hr />
                
                <motion.div 
                    custom={0} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className={`icon-pano-container ${activePage === "home" ? "active" : ""}`}
                    onClick={handlePanel}
                >
                    <FontAwesomeIcon icon={faSolarPanel} />
                    <h5>Pano</h5>
                </motion.div>

                <motion.div 
                    custom={1} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className={`icon-pano-container ${activePage === "staff" ? "active" : ""}`}
                    onClick={handleStaff}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                    <h5>Personeller</h5>
                </motion.div>

                {!isPersonnel && (
                <motion.div 
                    custom={2} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className={`icon-pano-container ${activePage === "department" ? "active" : ""}`}
                    onClick={handleDepartment}
                >
                    <FontAwesomeIcon icon={faBuilding} />
                    <h5>Departman</h5>
                </motion.div>
                )}

                {!isPersonnel && (
                <motion.div 
                    custom={3} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="tasks-dropdown"
                >
                    <div 
                        className="icon-pano-container"
                        onClick={() => setTasksDropdownOpen(!tasksDropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faTasks} />
                            <h5>Görevler</h5>
                        </div>
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`arrow-icon ${tasksDropdownOpen ? 'open' : ''}`}
                        />
                    </div>
                    
                    <AnimatePresence>
                        {tasksDropdownOpen && (
                            <motion.div 
                                className="tasks-dropdown-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faClipboardUser} style={{ marginRight: '8px' }} />
                                    <span>Görevlerim</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                )}

                {!isPersonnel && (
                <motion.div 
                    custom={4} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="tasks-dropdown"
                >
                    <div 
                        className="icon-pano-container"
                        onClick={() => setTaskSettingsDropdownOpen(!taskSettingsDropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faCog} />
                            <h5>Görev Ayarları</h5>
                        </div>
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`arrow-icon ${taskSettingsDropdownOpen ? 'open' : ''}`}
                        />
                    </div>
                    
                    <AnimatePresence>
                        {taskSettingsDropdownOpen && (
                            <motion.div 
                                className="tasks-dropdown-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div 
                                    className={`dropdown-item ${activePage === "taskType" ? "active" : ""}`}
                                    onClick={handleTaskType}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
                                    <span>Kategoriler</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                )}

                <motion.div 
                    custom={5} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="tasks-dropdown"
                >
                    <div 
                        className="icon-pano-container"
                        onClick={toggleProfileDropdown}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faUserCircle} />
                            <h5>Profil</h5>
                        </div>
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`arrow-icon ${profileDropdownOpen ? 'open' : ''}`}
                        />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {profileDropdownOpen && (
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="dropdown-content"
                        >
                            <motion.div variants={dropdownItemVariants} className={`dropdown-item ${activePage === "profile" ? "active" : ""}`} onClick={handleProfile}>
                                Profilim
                            </motion.div>
                            <motion.div variants={dropdownItemVariants} className={`dropdown-item ${activePage === "annualLeaves" ? "active" : ""}`} onClick={handleAnnualLeave}>
                                Yıllık İzinler
                            </motion.div>
                            {!isPersonnel && (
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Mesailer
                            </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Bildirimler kısmı */}
                <motion.div 
                    custom={6} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="tasks-dropdown"
                >
                    <div 
                        className="icon-pano-container"
                        onClick={toggleNotificationsDropdown}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faBell} />
                            <h5>Bildirimler</h5>
                        </div>
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`arrow-icon ${notificationsDropdownOpen ? 'open' : ''}`}
                        />
                    </div>
                    
                    <AnimatePresence>
                        {notificationsDropdownOpen && (
                            <motion.div 
                                className="tasks-dropdown-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div 
                                    className={`dropdown-item ${activePage === "notifications" ? "active" : ""}`}
                                    onClick={handleNotifications}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />
                                    <span>Tüm Bildirimler</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
                <motion.div
                    custom={7}
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    style={{ width: '100%', marginTop: '20px' }}
                >
                    <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="error"
                        fullWidth
                    >
                        Çıkış Yap
                    </Button>
                </motion.div>
            </motion.nav>

            <div className={`navbar-toggle ${isOpen ? "open" : ""}`}>
                <motion.div
                    onClick={toggleMenu}
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                        scale: isOpen ? 1.1 : 1,
                        rotate: isOpen ? 180 : 0
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                    }}
                >
                    <FontAwesomeIcon icon={faBars} className="navbar-toogle-fontawesomeicon" />
                </motion.div>
            </div>
        </div>
    );
}

export default Navbar;