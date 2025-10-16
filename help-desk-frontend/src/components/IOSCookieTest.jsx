import React, { useState, useEffect } from 'react';
import { debugCookies } from '../utils/cookieDebug';
import { testIOSCookies } from '../utils/iosCookieHelper';
import { apiFetch } from '../api/http';

export default function IOSCookieTest() {
  const [cookieTest, setCookieTest] = useState(null);
  const [cookieInfo, setCookieInfo] = useState({});
  const [backendTest, setBackendTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Testa cookies na montagem do componente
    const testResult = testIOSCookies();
    setCookieTest(testResult);
    
    const cookies = debugCookies();
    setCookieInfo(cookies);
  }, []);

  const testBackendCookies = async () => {
    setLoading(true);
    try {
      // Primeiro define um cookie de teste
      const testResponse = await apiFetch('/cookie-test/test', { method: 'POST' });
      
      // Aguarda um pouco e depois verifica
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const verifyResponse = await apiFetch('/cookie-test/verify');
      
      setBackendTest({
        testResponse,
        verifyResponse,
        success: verifyResponse.success
      });
    } catch (error) {
      setBackendTest({
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTest = () => {
    const testResult = testIOSCookies();
    setCookieTest(testResult);
    
    const cookies = debugCookies();
    setCookieInfo(cookies);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">iOS Cookie Test</h2>
      
      <div className="space-y-6">
        <div>
          <strong>Client-Side Cookie Test:</strong> 
          <span className={`ml-2 px-2 py-1 rounded ${cookieTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {cookieTest ? '✅ Working' : '❌ Failed'}
          </span>
        </div>
        
        <div>
          <strong>Backend Cookie Test:</strong>
          <div className="mt-2">
            <button 
              onClick={testBackendCookies}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Backend Cookies'}
            </button>
          </div>
          {backendTest && (
            <div className="mt-2">
              <span className={`px-2 py-1 rounded ${backendTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {backendTest.success ? '✅ Backend cookies working' : '❌ Backend cookies failed'}
              </span>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(backendTest, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div>
          <strong>Detected Cookies:</strong>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>User Agent:</strong>
          <div className="text-xs mt-1 p-2 bg-gray-100 rounded break-all">
            {navigator.userAgent}
          </div>
        </div>
        
        <button 
          onClick={refreshTest}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Refresh Client Test
        </button>
      </div>
    </div>
  );
}