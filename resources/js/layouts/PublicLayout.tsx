import type { ReactNode } from 'react';
import Footer from '@/components/public/Footer';
import Navbar from '@/components/public/Navbar';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
