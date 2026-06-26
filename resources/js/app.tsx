import { createInertiaApp } from '@inertiajs/react';
import Pusher from 'pusher-js';
import { ThemeProvider } from '@/components/ThemeProvider';

if (typeof window !== 'undefined') {
    import('laravel-echo').then(({ default: Echo }) => {
        const echo = new Echo({
            broadcaster: 'reverb',
            Pusher,
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        (window as unknown as Record<string, unknown>).Echo = echo;
    });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        const root = (
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );

        import('react-dom/client').then(({ createRoot }) => {
            createRoot(el).render(root);
        });
    },
});
