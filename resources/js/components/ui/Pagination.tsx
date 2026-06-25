import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (links.length <= 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    const currentPage = pages.findIndex((p) => p.active) + 1;
    const lastPage = pages.length;

    const visible: (PaginationLink | 'ellipsis')[] = [];

    if (lastPage <= 7) {
        visible.push(...pages);
    } else {
        visible.push(pages[0]);

        if (currentPage > 3) {
            visible.push('ellipsis');
        }

        const start = Math.max(1, currentPage - 1);
        const end = Math.min(lastPage, currentPage + 1);

        for (let i = start; i <= end; i++) {
            visible.push(pages[i - 1]);
        }

        if (currentPage < lastPage - 2) {
            visible.push('ellipsis');
        }

        visible.push(pages[lastPage - 1]);
    }

    return (
        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[13px] text-body-subtle">
                Menampilkan {from}–{to} dari {total}
            </span>
            <div className="flex items-center gap-1">
                {prev.url ? (
                    <Link
                        href={prev.url}
                        className="rounded-md px-2 py-1.5 text-[13px] text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading"
                        dangerouslySetInnerHTML={{ __html: prev.label }}
                    />
                ) : (
                    <span className="rounded-md px-2 py-1.5 text-[13px] text-body-subtle opacity-40" dangerouslySetInnerHTML={{ __html: prev.label }} />
                )}

                {visible.map((item, i) => {
                    if (item === 'ellipsis') {
                        return <span key={`e${i}`} className="px-1 py-1.5 text-[13px] text-body-subtle">...</span>;
                    }

                    return item.active ? (
                        <span key={i} className="rounded-md bg-brand-strong px-3 py-1.5 text-[13px] text-white" dangerouslySetInnerHTML={{ __html: item.label }} />
                    ) : (
                        <Link key={i} href={item.url!} className="rounded-md px-3 py-1.5 text-[13px] text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading" dangerouslySetInnerHTML={{ __html: item.label }} />
                    );
                })}

                {next.url ? (
                    <Link
                        href={next.url}
                        className="rounded-md px-2 py-1.5 text-[13px] text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading"
                        dangerouslySetInnerHTML={{ __html: next.label }}
                    />
                ) : (
                    <span className="rounded-md px-2 py-1.5 text-[13px] text-body-subtle opacity-40" dangerouslySetInnerHTML={{ __html: next.label }} />
                )}
            </div>
        </div>
    );
}
