import { Head } from '@inertiajs/react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
];

export default function SettingsIndex({ auth }: { auth: { user: AuthUser } }) {
    const { theme, setTheme } = useTheme();

    return (
        <AdminLayout
            auth={auth}
            title="Pengaturan"
            subtitle="Kelola pengaturan sistem"
        >
            <Head title="Pengaturan" />

            <div className="card p-6">
                <h3 className="mb-1 text-[18px] font-semibold text-heading">Tampilan</h3>
                <p className="mb-5 text-[13px] text-body-subtle">
                    Pilih tema tampilan yang Anda inginkan.
                </p>

                <div className="flex flex-wrap gap-3">
                    {themes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setTheme(value)}
                            className={cn(
                                'flex min-w-[140px] flex-col items-center gap-2 rounded-md border-2 p-5 transition-all',
                                theme === value
                                    ? 'border-brand bg-brand-softer'
                                    : 'border-border-default hover:border-border-default-strong',
                            )}
                        >
                            <Icon className={cn(
                                'h-6 w-6',
                                theme === value ? 'text-brand' : 'text-body',
                            )} />
                            <span className={cn(
                                'text-[14px] font-medium',
                                theme === value ? 'text-brand' : 'text-heading',
                            )}>
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
