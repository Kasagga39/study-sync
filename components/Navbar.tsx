"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export const Navbar: React.FC<{ user?: { name: string } | null }> = ({ user }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/courses", label: "Courses" },
    ];

    return (
        <header className="bg-brand-navy text-brand-bg sticky top-0 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="font-black text-2xl tracking-tight text-white flex items-center gap-2">
                        <span className="bg-brand-accent text-brand-navy px-2 py-0.5 rounded-lg text-lg">SS</span>
                        StudySync
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-brand-accent font-bold" : "text-gray-300 hover:text-white"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <span className="text-xs bg-brand-primary px-3 py-1.5 rounded-full border border-brand-accent/20">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-300 hover:text-red-300 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-medium bg-brand-accent text-brand-navy px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-gray-300 hover:text-white p-2"
                        aria-label="Toggle navigation menu"
                    >
                        ≡
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-brand-navy border-t border-brand-primary/50 px-4 pt-2 pb-4 space-y-2">
                    {user ? (
                        <>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-brand-primary"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-brand-primary"
                            >
                                Logout ({user.name})
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-200 hover:bg-brand-primary"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium bg-brand-accent text-brand-navy rounded-lg text-center"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};