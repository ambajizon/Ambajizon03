export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Marketing Tools</h1>
            {children}
        </div>
    )
}
