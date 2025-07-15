import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Napoleon AI - Working Test Page",
  description: "A working test page to verify deployment functionality.",
};

export default function WorkingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-burgundy mb-8">
            🎉 Napoleon AI is Working!
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Deployment Successful ✅
            </h2>
            <p className="text-green-700">
              This page confirms that Napoleon AI is fully operational and ready for users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Core Features</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✅ Next.js 15 App Router</li>
                <li>✅ Tailwind CSS Styling</li>
                <li>✅ Vercel Deployment</li>
                <li>✅ Production Build</li>
                <li>✅ API Endpoints</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">User Journey</h3>
              <div className="text-left space-y-2">
                <a href="/sign-up" className="block text-brand-burgundy hover:underline">
                  → Sign Up Process
                </a>
                <a href="/onboarding" className="block text-brand-burgundy hover:underline">
                  → Onboarding Flow
                </a>
                <a href="/api/health" className="block text-brand-burgundy hover:underline">
                  → API Health Check
                </a>
                <a href="/simple" className="block text-brand-burgundy hover:underline">
                  → Simple Test Page
                </a>
              </div>
            </div>
          </div>

          <div className="bg-brand-burgundy text-white rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Ready for Production</h3>
            <p className="mb-4">
              Napoleon AI is now deployed and accessible to users worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="bg-white text-brand-burgundy px-4 py-2 rounded-lg font-medium">
                Luxury Design ✓
              </span>
              <span className="bg-white text-brand-burgundy px-4 py-2 rounded-lg font-medium">
                Fast Performance ✓
              </span>
              <span className="bg-white text-brand-burgundy px-4 py-2 rounded-lg font-medium">
                Executive Ready ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}