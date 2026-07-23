import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useInstall } from '../context/InstallContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const { getCartCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const { isInstalled, deferredPrompt, isIOS, setShowBanner } = useInstall();

    const primaryLinks = [
        { name: 'Home', path: '/' },
        { name: 'Menu', path: '/menu' },
        { name: 'About Us', path: '/about' },
    ];

    const secondaryLinks = [
        { name: 'History', path: '/about#history' },
        { name: "Today's Special", path: '/#today-special' },
        { name: 'Gallery', path: '/#gallery' },
        { name: 'Reviews', path: '/#reviews' },
        { name: 'FAQs', path: '/about#faqs' },
        { name: 'Contact', path: '/about#contact' },
    ];

    const isActiveLink = (linkPath) => {
        if (linkPath.includes('#')) {
            return location.pathname === '/' && location.hash === linkPath.slice(linkPath.indexOf('#'));
        }

        return location.pathname === linkPath;
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    return (
        <nav className="w-full bg-dark/80 backdrop-blur-md text-light sticky top-0 z-50 shadow-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <h1 className="text-xl md:text-2xl font-bold text-primary font-serif tracking-wider">
                            Amma's Kitchen
                        </h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:block flex-1">
                        <div className="ml-10 flex items-center gap-8">
                            {primaryLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={clsx(
                                        'px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 whitespace-nowrap',
                                        isActiveLink(link.path)
                                            ? 'text-primary'
                                            : 'text-gray-300 hover:text-secondary'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            {/* Secondary Links Dropdown */}
                            <div className="relative group">
                                <button className="px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-secondary transition-colors whitespace-nowrap">
                                    More
                                </button>
                                <div className="absolute left-0 mt-0 w-48 bg-dark rounded-lg shadow-xl py-2 border border-gray-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                                    {secondaryLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-secondary transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tablet Menu - Hidden on mobile and large screens */}
                    <div className="hidden md:block lg:hidden">
                        <div className="ml-10 flex items-center gap-4">
                            {primaryLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={clsx(
                                        'px-2 py-2 rounded-md text-sm font-medium transition-colors duration-300 whitespace-nowrap',
                                        isActiveLink(link.path)
                                            ? 'text-primary'
                                            : 'text-gray-300 hover:text-secondary'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            {/* Secondary Links Dropdown for Tablet */}
                            <div className="relative group">
                                <button className="px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-secondary transition-colors whitespace-nowrap">
                                    More
                                </button>
                                <div className="absolute left-0 mt-0 w-40 bg-dark rounded-lg shadow-xl py-2 border border-gray-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                                    {secondaryLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className="block px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 hover:text-secondary transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cart & User Menu */}
                    <div className="flex items-center gap-6">
                        {/* Install App Button */}
                        {!isInstalled && (
                            <button
                                onClick={() => setShowBanner(true)}
                                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-md"
                            >
                                <Download size={18} />
                                <span className="text-sm font-medium">Install App</span>
                            </button>
                        )}

                        <Link to="/cart" className="relative p-2 text-gray-300 hover:text-secondary transition-colors">
                            <ShoppingCart size={24} />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-primary rounded-full animate-pulse">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <User size={20} />
                                    <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-dark-lighter rounded-lg shadow-xl py-2 border border-gray-700"
                                        >
                                            <Link
                                                to="/admin"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/10"
                                            >
                                                <User size={18} />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/10"
                                            >
                                                <User size={18} />
                                                <span>My Profile</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-500/10"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-primary hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-dark border-b border-gray-700"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {primaryLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        'block px-3 py-2 rounded-md text-base font-medium',
                                        isActiveLink(link.path)
                                            ? 'text-primary bg-gray-900'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="border-t border-gray-700 my-2"></div>

                            {secondaryLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        'block px-3 py-2 rounded-md text-sm font-medium',
                                        isActiveLink(link.path)
                                            ? 'text-primary bg-gray-900'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        Admin Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium bg-primary hover:bg-red-700"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                            {/* Mobile Install Button */}
                            {!isInstalled && (
                                <button
                                    onClick={() => {
                                        setShowBanner(true);
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                                >
                                    <Download size={18} />
                                    <span>Install App</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
