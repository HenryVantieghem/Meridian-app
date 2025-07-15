import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Napoleon AI",
  description: "Your AI Strategic Command Center for email management and productivity insights.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-brand-burgundy">Napoleon AI</h1>
              <span className="ml-3 text-sm text-gray-500">Strategic Command Center</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/onboarding"
                className="text-gray-600 hover:text-brand-burgundy transition-colors"
              >
                Setup
              </a>
              <a
                href="/sign-out"
                className="bg-brand-burgundy text-white px-4 py-2 rounded-lg hover:bg-brand-burgundy/90 transition-colors"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-brand-cream to-white rounded-xl p-8 border border-brand-burgundy/10">
            <h2 className="text-3xl font-bold text-black mb-4">
              Welcome to Your Strategic Command Center
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Transform your communication chaos into strategic clarity with AI-powered insights and luxury productivity tools.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/onboarding"
                className="bg-brand-burgundy text-white px-6 py-3 rounded-lg hover:bg-brand-burgundy/90 transition-colors"
              >
                Complete Setup
              </a>
              <a
                href="/demo/micro-interactions"
                className="bg-white text-brand-burgundy border border-brand-burgundy/20 px-6 py-3 rounded-lg hover:bg-brand-burgundy/5 transition-colors"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Brief */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-black mb-4">Daily Brief</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Email Analysis</h4>
                    <p className="text-sm text-gray-600">AI-powered insights ready</p>
                  </div>
                  <div className="bg-brand-burgundy text-white px-3 py-1 rounded-full text-sm">
                    Ready
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Priority Scoring</h4>
                    <p className="text-sm text-gray-600">Smart prioritization active</p>
                  </div>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Active
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">VIP Detection</h4>
                    <p className="text-sm text-gray-600">Executive contacts monitored</p>
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Monitoring
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/landing"
                  className="block w-full text-left p-3 bg-brand-burgundy/5 hover:bg-brand-burgundy/10 rounded-lg transition-colors"
                >
                  <div className="font-medium text-brand-burgundy">View Landing</div>
                  <div className="text-sm text-gray-600">See main page</div>
                </a>
                <a
                  href="/sign-up"
                  className="block w-full text-left p-3 bg-brand-burgundy/5 hover:bg-brand-burgundy/10 rounded-lg transition-colors"
                >
                  <div className="font-medium text-brand-burgundy">Sign Up Flow</div>
                  <div className="text-sm text-gray-600">Test registration</div>
                </a>
                <a
                  href="/onboarding"
                  className="block w-full text-left p-3 bg-brand-burgundy/5 hover:bg-brand-burgundy/10 rounded-lg transition-colors"
                >
                  <div className="font-medium text-brand-burgundy">Onboarding</div>
                  <div className="text-sm text-gray-600">Setup experience</div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-black mb-6">Executive Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-burgundy mb-2">95%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-burgundy mb-2">10x</div>
                <div className="text-sm text-gray-600">Faster Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-burgundy mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-burgundy mb-2">50k+</div>
                <div className="text-sm text-gray-600">Emails Analyzed</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}