import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
    threshold?: number;
    triggerOnce?: boolean;
    rootMargin?: string;
}

export default function useInView<T extends HTMLElement = HTMLDivElement>(
    options: UseInViewOptions = {},
) {
    const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options;
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                    if (entry.isIntersecting) {
                        setInView(true);

                        if (triggerOnce) {
                        observer.unobserve(el);
                    }
                } else if (!triggerOnce) {
                    setInView(false);
                }
            },
            { threshold, rootMargin },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold, triggerOnce, rootMargin]);

    return { ref, inView };
}
