import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { ThemeProvider } from '@/components/ThemeProvider';

configureEcho({
    broadcaster: 'reverb',
});

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
