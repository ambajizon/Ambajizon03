import StoreSetupWizard from '@/components/StoreSetupWizard'

export default function SetupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Ambajizon</h1>
                    <p className="mt-2 text-gray-600">Let's set up your store in just a few steps.</p>
                </div>
                <StoreSetupWizard />
            </div>
        </div>
    )
}
