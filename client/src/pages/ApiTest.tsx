import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState, useEffect } from 'react';

export default function ApiTest() {
  const [testResult, setTestResult] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test the simple API endpoint
      const response = await fetch('/api/test', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed with status: ${response.status}`);
      }

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically run the test on page load
    runTest();
  }, []);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>API Test Page</CardTitle>
          <CardDescription>
            This page tests the API connectivity in your current environment to help diagnose
            deployment issues.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Environment Information</h3>
              <ul className="list-disc pl-5 text-sm">
                <li>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
                <li>
                  Current Host: {typeof window !== 'undefined' ? window.location.host : 'N/A'}
                </li>
                <li>
                  Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {testResult && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
                <p className="font-medium">Test Result:</p>
                <pre className="text-xs mt-2 bg-green-100 p-2 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={runTest} disabled={loading}>
            {loading ? 'Testing...' : 'Run API Test'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
