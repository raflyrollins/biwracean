import { Anchor } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-strong border-t border-on-brand/10 py-10">
            <div className="section-container text-center">
                <span className="inline-flex items-center gap-2 text-lg font-bold text-on-brand">
                    <Anchor className="h-5 w-5" />
                    biwracean
                </span>
                <p className="mt-3 text-[13px] text-on-brand-muted">
                    &copy; {new Date().getFullYear()} biwracean. Hak cipta dilindungi.
                </p>
            </div>
        </footer>
    );
}
