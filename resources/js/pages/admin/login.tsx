import { Head, Link, useForm } from '@inertiajs/react';
import { Anchor, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Login Admin" />

            <div className="flex min-h-screen items-center justify-center bg-neutral-secondary-soft p-4">
                <div className="w-full max-w-[420px]">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-brand">
                            <Anchor className="h-7 w-7 text-on-brand" />
                        </div>
                        <h1 className="text-[24px] font-bold text-heading">biwracean</h1>
                        <p className="mt-1 text-[14px] text-body">Panel Administrasi</p>
                    </div>

                    <div className="card p-8">
                        <h2 className="mb-6 text-[20px] font-semibold text-heading">Masuk</h2>

                        {errors.email && (
                            <div className="mb-5 border border-border-danger bg-danger-soft p-4">
                                <p className="text-[14px] text-fg-danger-strong">{errors.email}</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <Input
                                label="Email"
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                icon={<Mail className="h-4 w-4" />}
                                placeholder="admin@biwracean.com"
                                autoFocus
                            />

                            <Input
                                label="Kata Sandi"
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                icon={<Lock className="h-4 w-4" />}
                                endIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                }
                                placeholder="••••••••"
                            />

                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 accent-brand"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 text-[14px] text-body"
                                >
                                    Ingat saya
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                        >
                            &larr; Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
