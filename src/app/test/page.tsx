export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">
          Napoleon AI Test Page
        </h1>
        <p className="text-xl text-gray-600">
          This is a simple test page to verify deployment works
        </p>
        <div className="mt-8 bg-brand-burgundy text-white p-4 rounded">
          Deployment Status: Working ✅
        </div>
      </div>
    </div>
  );
}
