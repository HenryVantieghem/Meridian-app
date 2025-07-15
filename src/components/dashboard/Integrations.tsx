import { featureFlags } from "@/lib/featureFlags";

const Integrations = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Integrations</h2>
      <p>Connect with other services to enhance your workflow.</p>

      {featureFlags.teamsOAuth && (
        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Connect Microsoft Teams / Outlook
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Enterprise SSO with Microsoft 365. Requires admin consent.
          </p>
        </div>
      )}
    </div>
  );
};

export default Integrations;
