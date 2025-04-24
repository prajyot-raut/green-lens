"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaCameraRetro, // Example icon for Upload
  FaHome, // Example icon for Home
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false); // Close menu on logout
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle logout error (e.g., show a notification)
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Placeholder for role-based links - adapt when roles are available
  // const isAdmin = user?.role === 'admin'; // Example check

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-green-600">
              GreenLens
            </Link>
          </div>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:bg-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
            >
              <FaHome /> Home
            </Link>
            {user && (
              <>
                <Link
                  href="/upload"
                  className="text-gray-700 hover:bg-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <FaCameraRetro /> Upload
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:bg-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <FaUserCircle /> Profile
                </Link>
                {/* Add role-specific links here if needed */}
                {/* {isAdmin && <Link href="/admin">Admin</Link>} */}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:bg-red-100 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                className="text-gray-700 hover:bg-gray-100 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
              >
                <FaSignInAlt /> Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-40"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="text-gray-700 hover:bg-gray-100 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/upload"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:bg-gray-100 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:bg-gray-100 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Profile
                </Link>
                {/* Add role-specific links here if needed */}
                {/* {isAdmin && <Link href="/admin" onClick={closeMobileMenu}>Admin</Link>} */}
                <button
                  onClick={handleLogout} // handleLogout already closes the menu
                  className="w-full text-left text-gray-700 hover:bg-red-100 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:bg-gray-100 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
