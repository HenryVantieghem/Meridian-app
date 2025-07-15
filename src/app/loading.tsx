export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-brand-burgundy/20 rounded-full"></div>

          {/* Animated progress ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-brand-burgundy rounded-full animate-spin"></div>

          {/* Inner circle */}
          <div className="absolute inset-2 bg-brand-burgundy/10 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-brand-burgundy rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-medium text-brand-burgundy">
            Loading Napoleon AI
          </h2>
          <p className="text-sm text-gray-600">
            Preparing your strategic command center...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-48 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-brand-burgundy h-1 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
