import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { useSettings } from '../store/useSettings';
import { 
  verifyMetaConnection, 
  getFacebookPages, 
  getInstagramAccounts,
  postToFacebook,
  postToInstagram,
  getFacebookInsights,
  getInstagramInsights
} from '../services/metaService';

const MetaAPITest = () => {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});
  const [testData, setTestData] = useState({
    message: 'Test post from Tari Connect!',
    imageUrl: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Tari+Connect'
  });

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    setResults(prev => ({ ...prev, [testName]: { loading: true } }));
    
    try {
      const result = await testFunction();
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          loading: false, 
          success: result.success, 
          data: result.success ? result : null,
          error: result.success ? null : result.error 
        } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          loading: false, 
          success: false, 
          error: error.message 
        } 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const tests = [
    {
      name: 'connection',
      label: 'Verify Connection',
      icon: <FaCheck />,
      function: () => verifyMetaConnection(settings)
    },
    {
      name: 'pages',
      label: 'Get Facebook Pages',
      icon: <FaFacebook />,
      function: () => getFacebookPages(settings)
    },
    {
      name: 'instagram',
      label: 'Get Instagram Account',
      icon: <FaInstagram />,
      function: () => getInstagramAccounts(settings)
    },
    {
      name: 'fbPost',
      label: 'Post to Facebook',
      icon: <FaFacebook />,
      function: () => postToFacebook(settings, testData.message)
    },
    {
      name: 'igPost',
      label: 'Post to Instagram',
      icon: <FaInstagram />,
      function: () => postToInstagram(settings, testData.imageUrl, testData.message)
    },
    {
      name: 'fbInsights',
      label: 'Facebook Insights',
      icon: <FaFacebook />,
      function: () => getFacebookInsights(settings)
    },
    {
      name: 'igInsights',
      label: 'Instagram Insights',
      icon: <FaInstagram />,
      function: () => getInstagramInsights(settings)
    }
  ];

  const getStatusIcon = (testName) => {
    const result = results[testName];
    if (result?.loading) return <FaSpinner className="animate-spin text-blue-500" />;
    if (result?.success) return <FaCheck className="text-green-500" />;
    if (result?.success === false) return <FaTimes className="text-red-500" />;
    return null;
  };

  const isMetaConnected = settings?.integrations?.meta?.connected;

  if (!isMetaConnected) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaTimes className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Meta API Not Connected
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Please connect your Meta API in the Integrations settings before testing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Meta API Test Suite</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Test your Meta API integration with Facebook and Instagram
        </p>
      </div>

      {/* Test Data Configuration */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Test Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Message
            </label>
            <input
              type="text"
              value={testData.message}
              onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
              placeholder="Enter test message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Image URL
            </label>
            <input
              type="url"
              value={testData.imageUrl}
              onChange={(e) => setTestData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
              placeholder="Enter image URL"
            />
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {tests.map((test) => (
          <button
            key={test.name}
            onClick={() => runTest(test.name, test.function)}
            disabled={isLoading}
            className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {test.icon}
              <span className="text-sm font-medium dark:text-white">{test.label}</span>
            </div>
            {getStatusIcon(test.name)}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {Object.entries(results).map(([testName, result]) => {
          const test = tests.find(t => t.name === testName);
          if (!result || result.loading) return null;

          return (
            <div
              key={testName}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                  : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {test?.icon}
                <h4 className={`font-medium ${
                  result.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {test?.label}
                </h4>
                {result.success ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )}
              </div>
              
              {result.success ? (
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p className="font-medium">Success!</p>
                  {result.data && (
                    <pre className="mt-2 p-2 bg-green-100 dark:bg-green-800 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">Error:</p>
                  <p>{result.error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connection Status */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Connection Status</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p><strong>App ID:</strong> {settings?.integrations?.meta?.appId ? '✓ Configured' : '✗ Missing'}</p>
          <p><strong>App Secret:</strong> {settings?.integrations?.meta?.appSecret ? '✓ Configured' : '✗ Missing'}</p>
          <p><strong>Access Token:</strong> {settings?.integrations?.meta?.accessToken ? '✓ Configured' : '✗ Missing'}</p>
          <p><strong>Page ID:</strong> {settings?.integrations?.meta?.pageId ? '✓ Configured' : '✗ Optional'}</p>
          <p><strong>Webhook Token:</strong> {settings?.integrations?.meta?.webhookToken ? '✓ Configured' : '✗ Optional'}</p>
        </div>
      </div>
    </div>
  );
};

export default MetaAPITest;