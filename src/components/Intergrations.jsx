import { useState, useEffect } from "react";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import {
  getUserSettings,
  connectWhatsApp,
  disconnectWhatsApp,
  connectMeta,
  disconnectMeta,
} from "../services/settingsService";

const Integrations = ({ userId }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { success, settings } = await getUserSettings(userId);
      if (success) setSettings(settings);
      setLoading(false);
    };
    fetchSettings();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // WhatsApp connect
  const handleConnectWhatsApp = async () => {
    const { businessId, accessToken } = formData;
    const res = await connectWhatsApp(userId, businessId, accessToken);
    if (res.success) {
      const { settings } = await getUserSettings(userId);
      setSettings(settings);
      setShowWhatsAppForm(false);
      setFormData({});
    }
  };

  // Meta connect
  const handleConnectMeta = async () => {
    const { appId, appSecret, accessToken, webhookToken, pageId } = formData;
    const res = await connectMeta(
      userId,
      appId,
      appSecret,
      accessToken,
      webhookToken,
      pageId
    );
    if (res.success) {
      const { settings } = await getUserSettings(userId);
      setSettings(settings);
      setShowMetaForm(false);
      setFormData({});
    }
  };

  if (loading) return <p>Loading integrations...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Integrations</h2>

      {/* WhatsApp */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaWhatsapp className="text-green-500 text-3xl" />
          <span className="text-lg font-medium">WhatsApp Business</span>
          {/* ✅ Status badge */}
          {settings?.integrations?.whatsapp?.connected ? (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              ✅ Connected
            </span>
          ) : (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              ❌ Not Connected
            </span>
          )}
        </div>
        {settings?.integrations?.whatsapp?.connected ? (
          <button
            onClick={() =>
              disconnectWhatsApp(userId).then(() =>
                getUserSettings(userId).then(({ settings }) =>
                  setSettings(settings)
                )
              )
            }
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => setShowWhatsAppForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Connect
          </button>
        )}
      </div>

      {showWhatsAppForm && (
        <div className="mb-6 border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Setup WhatsApp Integration</h3>
          <input
            type="text"
            name="businessId"
            placeholder="Business ID"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="accessToken"
            placeholder="Access Token"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleConnectWhatsApp}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFacebook className="text-blue-600 text-3xl" />
          <span className="text-lg font-medium">Meta (Facebook/Instagram)</span>
          {/* ✅ Status badge */}
          {settings?.integrations?.meta?.connected ? (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              ✅ Connected
            </span>
          ) : (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              ❌ Not Connected
            </span>
          )}
        </div>
        {settings?.integrations?.meta?.connected ? (
          <button
            onClick={() =>
              disconnectMeta(userId).then(() =>
                getUserSettings(userId).then(({ settings }) =>
                  setSettings(settings)
                )
              )
            }
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => setShowMetaForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Connect
          </button>
        )}
      </div>

      {showMetaForm && (
        <div className="mb-6 border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Setup Meta Integration</h3>
          <input
            type="text"
            name="appId"
            placeholder="App ID"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="appSecret"
            placeholder="App Secret"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="accessToken"
            placeholder="Access Token"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="webhookToken"
            placeholder="Webhook Verify Token"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="pageId"
            placeholder="Page ID"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleConnectMeta}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Integrations;
