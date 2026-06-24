import { Link, router } from '@inertiajs/react';
import { Anchor, LayoutDashboard, Ship, Route, Building2, Users, Settings, LogOut } from 'lucide-react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface SidebarProps {
    auth: { user: AuthUser };
    onClose: () => void;
}

const items = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', active: true },
    { icon: Ship, label: 'Data Kapal', href: '#' },
    { icon: Route, label: 'Rute', href: '#' },
    { icon: Building2, label: 'Pelabuhan', href: '#' },
    { icon: Users, label: 'Pengguna', href: '#' },
    { icon: Settings, label: 'Pengaturan', href: '#' },
];

export default function Sidebar({ auth, onClose }: SidebarProps) {
    const handleLogout = () => {
        router.post('/admin/logout');
    };

    return (
        <aside className="flex h-full w-64 flex-col border-r border-border-default bg-neutral-primary-soft">
            <div className="flex items-center justify-between border-b border-border-default px-5 py-5">
                <div className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-fg-brand" />
                    <span className="text-[16px] font-bold text-heading">biwracean</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="flex flex-col gap-1">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-colors ${
                                    item.active
                                        ? 'bg-neutral-secondary-strong text-fg-brand-strong'
                                        : 'text-body hover:bg-neutral-secondary-medium hover:text-heading'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-border-default px-3 py-4">
                <div className="mb-3 px-3">
                    <p className="text-[14px] font-medium text-heading">{auth.user.name}</p>
                    <p className="text-[12px] text-body-subtle">{auth.user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-fg-danger transition-colors hover:bg-danger-soft"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
