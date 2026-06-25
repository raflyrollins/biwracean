import { Link, router, usePage } from '@inertiajs/react';
import { Anchor, LayoutDashboard, Ship, Route, Building2, Ticket, CalendarCheck, Navigation2, ShoppingCart, Shield, Users, Settings, LogOut } from 'lucide-react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface SidebarProps {
    auth: { user: AuthUser };
    onClose: () => void;
}

type PageProps = {
    auth: { user: AuthUser; permissions: string[] };
};

type NavItem = {
    icon: typeof LayoutDashboard;
    label: string;
    href: string;
    permission: string;
};

const allItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', permission: 'dashboard' },
    { icon: Ship, label: 'Data Kapal', href: '/admin/ships', permission: 'ships' },
    { icon: Navigation2, label: 'Pelayaran', href: '/admin/sailings', permission: 'sailings' },
    { icon: Route, label: 'Rute', href: '/admin/routes', permission: 'routes' },
    { icon: Building2, label: 'Pelabuhan', href: '/admin/ports', permission: 'ports' },
    { icon: Ticket, label: 'Kelas Tiket', href: '/admin/ticket-classes', permission: 'ticket_classes' },
    { icon: CalendarCheck, label: 'Ketersediaan Tiket', href: '/admin/ticket-availabilities', permission: 'ticket_availabilities' },
    { icon: ShoppingCart, label: 'Penjualan Tiket', href: '/admin/ticket-orders', permission: 'ticket_orders' },
    { icon: Users, label: 'Pengguna', href: '/admin/users', permission: 'users' },
    { icon: Shield, label: 'Role Admin', href: '/admin/roles', permission: 'roles' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings', permission: 'settings' },
];

export default function Sidebar({ auth, onClose }: SidebarProps) {
    const { props, url } = usePage<PageProps>();
    const permissions = props.auth?.permissions ?? [];

    const hasAccess = (permission: string) => {
        return permissions.includes('*') || permissions.includes(permission);
    };

    const items = allItems.filter((item) => hasAccess(item.permission));

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
                        const isActive = url.startsWith(item.href);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors ${
                                    isActive
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
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium text-fg-danger transition-colors hover:bg-danger-soft"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
