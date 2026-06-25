import { Link } from '@inertiajs/react';
import { Anchor, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

const navLinks = [
    { href: '/jadwal', label: 'Jadwal', internal: true },
    { href: '#about', label: 'Tentang', internal: false },
    { href: '#services', label: 'Layanan', internal: false },
    { href: '#contact', label: 'Kontak', internal: false },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white/70 py-4 backdrop-blur-lg max-md:bg-white max-md:shadow-sm md:bg-transparent lg:py-0">
            <div className="section-container flex items-center justify-between pt-4 pb-3 md:pt-6 md:pb-4">
                <span className="flex items-center gap-2 text-lg font-bold max-md:text-heading md:text-on-brand">
                    <Anchor className="h-5 w-5" />
                    biwracean
                </span>

                <div className="hidden items-center gap-10 md:flex">
                    {navLinks.map((l) =>
                        l.internal ? (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="text-sm font-medium text-on-brand-muted/80 transition-colors hover:text-on-brand"
                            >
                                {l.label}
                            </Link>
                        ) : (
                            <a
                                key={l.href}
                                href={l.href}
                                className="text-sm font-medium text-on-brand-muted/80 transition-colors hover:text-on-brand"
                            >
                                {l.label}
                            </a>
                        )
                    )}
                    <Link
                        href="/admin/login"
                        className="btn btn-white !px-6 !py-2.5 text-sm"
                    >
                        Login
                    </Link>
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden"
                    aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                >
                    {mobileOpen ? (
                        <X className="h-6 w-6 text-heading" />
                    ) : (
                        <Menu className="h-6 w-6 text-heading" />
                    )}
                </button>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
                    mobileOpen
                        ? 'max-h-[400px] opacity-100'
                        : 'max-h-0 opacity-0'
                }`}
            >
                <div className="border-t border-on-brand/15 bg-white px-6 pt-6 pb-8">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((l) =>
                            l.internal ? (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-[15px] font-medium text-heading"
                                >
                                    {l.label}
                                </Link>
                            ) : (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-[15px] font-medium text-heading"
                                >
                                    {l.label}
                                </a>
                            )
                        )}
                        <Link
                            href="/admin/login"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Button
                                variant="brand"
                                className="w-full !px-6 !py-3 text-sm"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
