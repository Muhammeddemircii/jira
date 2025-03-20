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
  faBuilding
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
    const [activePage, setActivePage] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setName(localStorage.getItem("user-name") || "Misafir");
        setTenantName(localStorage.getItem("tenant-name") || "Yükleniyor...");
        setRoleName(localStorage.getItem("user-role") || "Yükleniyor...");
        

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
        }
    }, [location]);

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

    const handleProfile = () => {
        navigate("/ProfilePage")
    }
    const toggleTasksDropdown = () => setTasksDropdownOpen(!tasksDropdownOpen);
    const toggleTaskSettingsDropdown = () => setTaskSettingsDropdownOpen(!taskSettingsDropdownOpen);
    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    
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

                <motion.div 
                    custom={3} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="icon-dropdown-container"
                    onClick={toggleTasksDropdown}
                >
                    <FontAwesomeIcon icon={faTasks} />
                    <h5>Görevler</h5>
                    <FontAwesomeIcon icon={faChevronDown} className={`chevron-icon ${tasksDropdownOpen ? "open" : ""}`} />
                </motion.div>

                <AnimatePresence>
                    {tasksDropdownOpen && (
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="dropdown-content"
                        >
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Departman Görevleri
                            </motion.div>
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Personel Görevleri
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <motion.div 
                    custom={4} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="icon-dropdown-container"
                    onClick={toggleTaskSettingsDropdown}
                >
                    <FontAwesomeIcon icon={faCog} />
                    <h5>Görev Ayarları</h5>
                    <FontAwesomeIcon icon={faChevronDown} className={`chevron-icon ${taskSettingsDropdownOpen ? "open" : ""}`} />
                </motion.div>

                <AnimatePresence>
                    {taskSettingsDropdownOpen && (
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="dropdown-content"
                        >
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Kategoriler
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <motion.div 
                    custom={5} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="icon-dropdown-container"
                    onClick={toggleProfileDropdown}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                    <h5>Profil</h5>
                    <FontAwesomeIcon icon={faChevronDown} className={`chevron-icon ${profileDropdownOpen ? "open" : ""}`} />
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
                            <motion.div variants={dropdownItemVariants} className="dropdown-item" onClick={handleProfile}>
                                Profilim
                            </motion.div>
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Yıllık İzinler
                            </motion.div>
                            <motion.div variants={dropdownItemVariants} className="dropdown-item">
                                Mesailer
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <motion.div 
                    custom={6} 
                    variants={navItemsVariants}
                    initial="hidden"
                    animate={isOpen ? "visible" : "hidden"}
                    className="icon-pano-container"
                >
                    <FontAwesomeIcon icon={faBell} />
                    <h5>Bildirim ayarları</h5>
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