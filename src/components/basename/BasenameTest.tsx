'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  getAddressFromBasename, 
  getBasename, 
  getBasenameMetadata,
  isValidBasename,
  normalizeBasename,
  resolveRecipient,
  checkBasenameExists,
  testBaseENSResolver,
  KNOWN_BASE_ENS_NAMES
} from '../../lib/apis/basenames';
import { Input } from '../ui/input';

export function BasenameTest() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAddressToBasename = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const basename = await getBasename(input as `0x${string}`);
      setResult({
        type: 'address-to-basename',
        input,
        output: basename,
        success: !!basename
      });
    } catch (error) {
      setResult({
        type: 'address-to-basename',
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testBasenameToAddress = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      // First check if the Base ENS name exists
      const exists = await checkBasenameExists(input);
      console.log('Base ENS name exists:', exists);
      
      const address = await getAddressFromBasename(input);
      setResult({
        type: 'basename-to-address',
        input,
        output: address,
        success: !!address,
        debug: { exists }
      });
    } catch (error) {
      setResult({
        type: 'basename-to-address',
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testBasenameMetadata = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const metadata = await getBasenameMetadata(input);
      setResult({
        type: 'basename-metadata',
        input,
        output: metadata,
        success: !!metadata
      });
    } catch (error) {
      setResult({
        type: 'basename-metadata',
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testResolveRecipient = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const resolved = await resolveRecipient(input);
      setResult({
        type: 'resolve-recipient',
        input,
        output: resolved,
        success: !!resolved
      });
    } catch (error) {
      setResult({
        type: 'resolve-recipient',
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testBasenameExists = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const exists = await checkBasenameExists(input);
      setResult({
        type: 'check-exists',
        input,
        output: exists,
        success: exists
      });
    } catch (error) {
      setResult({
        type: 'check-exists',
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testResolverContract = async () => {
    setLoading(true);
    try {
      const testResult = await testBaseENSResolver();
      setResult({
        type: 'test-resolver',
        input: 'Resolver Contract Test',
        output: testResult,
        success: testResult.contractExists && testResult.supportsAddr
      });
    } catch (error) {
      setResult({
        type: 'test-resolver',
        input: 'Resolver Contract Test',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = isValidBasename(input);
  const normalized = isValid ? normalizeBasename(input) : '';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Base ENS Test</span>
          <Badge variant="secondary">Debug</Badge>
        </CardTitle>
        <CardDescription>
          Test Base ENS resolution and metadata functionality
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Input (Address or Base ENS name)</label>
          <Input
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="0x... or alice.base.eth"
          />
          {input && (
            <div className="text-sm space-y-1">
              <p>Valid Base ENS: <Badge variant={isValid ? 'default' : 'destructive'}>{isValid ? 'Yes' : 'No'}</Badge></p>
              {isValid && <p>Normalized: <code className="bg-gray-100 px-1 rounded">{normalized}</code></p>}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testAddressToBasename} 
            disabled={loading || !input}
            variant="outline"
          >
            Address → Basename
          </Button>
          <Button 
            onClick={testBasenameToAddress} 
            disabled={loading || !input}
            variant="outline"
          >
            Basename → Address
          </Button>
          <Button 
            onClick={testBasenameMetadata} 
            disabled={loading || !input}
            variant="outline"
          >
            Get Metadata
          </Button>
          <Button 
            onClick={testResolveRecipient} 
            disabled={loading || !input}
            variant="outline"
          >
            Resolve Recipient
          </Button>
          <Button 
            onClick={testBasenameExists} 
            disabled={loading || !input}
            variant="outline"
          >
            Check Exists
          </Button>
          <Button 
            onClick={testResolverContract} 
            disabled={loading}
            variant="outline"
          >
            Test Resolver
          </Button>
        </div>

        {/* Known Base ENS Names */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Known Base ENS Names for Testing:</h4>
          <div className="flex flex-wrap gap-2">
            {KNOWN_BASE_ENS_NAMES.map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => setInput(name)}
                className="text-xs"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Result</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Type:</strong> {result.type}</p>
              <p><strong>Input:</strong> <code className="bg-white px-1 rounded">{result.input}</code></p>
              <p><strong>Success:</strong> <Badge variant={result.success ? 'default' : 'destructive'}>{result.success ? 'Yes' : 'No'}</Badge></p>
              
              {result.error && (
                <p><strong>Error:</strong> <span className="text-red-600">{result.error}</span></p>
              )}
              
              {result.output && (
                <div>
                  <p><strong>Output:</strong></p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(result.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-blue-600">Loading...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 