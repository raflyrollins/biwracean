import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Ya, Hapus',
    cancelLabel = 'Batal',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => confirmRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-xl border border-border-default bg-neutral-primary-soft p-6 shadow-xl">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 text-body-subtle hover:text-heading"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                            variant === 'danger' ? 'bg-danger-soft' : 'bg-yellow-100'
                        }`}
                    >
                        <AlertTriangle
                            className={`h-6 w-6 ${
                                variant === 'danger' ? 'text-fg-danger' : 'text-yellow-600'
                            }`}
                        />
                    </div>
                    <h3 className="text-[16px] font-semibold text-heading">{title}</h3>
                    <p className="mt-2 text-[14px] text-body">{message}</p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="btn btn-white flex-1"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        className={`btn flex-1 ${
                            variant === 'danger' ? 'btn-danger' : 'btn-brand'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
