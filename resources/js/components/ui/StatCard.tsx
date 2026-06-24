interface StatCardProps {
    label: string;
    value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="rounded-none border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <div className="text-[44px] font-bold text-on-brand">{value}</div>
            <div className="mt-1 text-[14px] font-medium text-on-brand-muted">{label}</div>
        </div>
    );
}
