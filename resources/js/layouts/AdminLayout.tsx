import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '@/components/admin/Sidebar';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface AdminLayoutProps {
    children: ReactNode;
    auth: { user: AuthUser };
    title?: string;
    subtitle?: string;
    flash?: { success?: string };
}

export default function AdminLayout({ children, auth, title, subtitle, flash }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(!!flash?.success);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    useEffect(() => {
        if (flash?.success) {
            const timer = setTimeout(() => setShowFlash(false), 5000);

            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-primary-soft">
            {/* Desktop sidebar - always visible */}
            <div className="hidden flex-shrink-0 lg:block">
                <Sidebar auth={auth} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Mobile sidebar overlay */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out lg:hidden ${
                    sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
                <div
                    className={`absolute left-0 top-0 h-full transition-transform duration-300 ease-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <Sidebar auth={auth} onClose={() => setSidebarOpen(false)} />
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {showFlash && flash?.success && (
                    <div className="flex items-center gap-3 border-b border-green-200 bg-green-50 px-6 py-3">
                        <p className="flex-1 text-[14px] text-green-800">{flash.success}</p>
                        <button onClick={() => setShowFlash(false)} className="text-green-600 hover:text-green-800">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <header className="flex items-center gap-3 border-b border-border-default bg-neutral-primary-soft px-6 py-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center justify-center lg:hidden"
                        aria-label="Buka sidebar"
                    >
                        <Menu className="h-5 w-5 text-heading" />
                    </button>
                    <div>
                        {title && <h1 className="text-[20px] font-bold text-heading">{title}</h1>}
                        {subtitle && (
                            <p className="text-[13px] text-body-subtle">{subtitle}</p>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
