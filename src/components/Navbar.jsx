import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { faBars, faClipboardUser, faSolarPanel } from '@fortawesome/free-solid-svg-icons';
import { } from '../styles/Navbar.css';
import { } from '../styles/Cards.css';
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Navbar({setIsOpen, isOpen}) {
    const [name, setName] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setName(localStorage.getItem("user-name") || "Misafir");
        setTenantName(localStorage.getItem("tenant-name") || "Yükleniyor...");
        setRoleName(localStorage.getItem("user-role") || "Yükleniyor...");
        setShowWelcome(true);
    }, []);

    const handlePanel = () => {
        navigate("/HomePage")
    }
    
    const handleStaff = () => {
        navigate("/StaffPage")
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleDepartment = () =>{
        navigate("/DepartmentPage")
    }
    return (
        <div>
            <div className="navbar">
                <div className={`navbar-toggle ${isOpen ? "open" : ""}`}>
                    <motion.div
                        onClick={toggleMenu}
                        initial={{ scale: 1, x: 0 }}
                        animate={{ scale: isOpen ? 1.1 : 1, x: isOpen ? 200 : 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <FontAwesomeIcon icon={faBars} className="navbar-toogle-fontawesomeicon" />
                    </motion.div>

                    <motion.nav
                        initial={{ x: "-100%" }}
                        animate={{ x: isOpen ? "0%" : "-100%" }}
                        transition={{ type: "tween", duration: 0.1 }}
                        className={`navbar-nav ${isOpen ? "open" : ""}`}
                    >
                        <motion.ul
                            initial={{ opacity: 0, y: -110 }}
                            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -50 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
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
                        </motion.ul>

                        <hr />
                        <div className="icon-pano-container" onClick={handlePanel}>
                            <FontAwesomeIcon icon={faSolarPanel} />
                            <h5>Pano</h5>
                        </div>

                        <div className="icon-pano-container" onClick={handleStaff}>
                            <FontAwesomeIcon icon={faClipboardUser} />
                            <h5>Personeller</h5>
                        </div>
                        
                        <div className="icon-pano-container" onClick={handleDepartment}>
                            <FontAwesomeIcon icon={faClipboardUser} />
                            <h5>Departman</h5>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="contained"
                            color="error"
                        >
                            Çıkış Yap
                        </Button>
                    </motion.nav>

                    <motion.div
                        initial={{ scale: 1, x: 0 }}
                        animate={{ scale: isOpen ? 1 : 1, x: isOpen ? 315 : 15 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className={`navbar-toggle ${isOpen ? "open" : ""}`}
                    >
                    </motion.div>
                </div>

                <motion.div
                    className={`welcome-info ${showWelcome ? "show" : ""}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: showWelcome ? 1 : 0, y: showWelcome ? 0 : 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p>LedAsistan'a Hoşgeldiniz, {name}</p>
                </motion.div>
            </div>
        </div>
    );
}

export default Navbar;