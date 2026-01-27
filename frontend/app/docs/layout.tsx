'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function DocsLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: '/docs/api', label: 'API Reference' },
        { href: '/dashboard/api-keys', label: 'Get API Key' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">Vectix</Link>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className={`text-sm transition-colors ${pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/dashboard" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">Dashboard</Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="sm:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-border px-4 py-3 space-y-3">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                                className={`block py-2 text-sm ${pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-primary font-medium">Dashboard</Link>
                    </div>
                )}
            </nav>
            {children}
        </div>
    );
}
