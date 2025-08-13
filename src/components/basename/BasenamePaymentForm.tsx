'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import { 
  useBasenamePayment, 
  useBasenameResolution, 
  useBasenameMetadata, 
  useRecipientDisplayName,
  useRecipientValidation 
} from '../../hooks/useBasenamePayment';
import { isValidBasename, normalizeBasename } from '../../lib/apis/basenames';
import { Button } from '../ui/button';
import { Input } from '../form/input/InputField';
import { Label } from '../form/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useSmartAccountContext } from '../../context/SmartAccountContext';
import { useWalletUser } from '../../hooks/useWalletUser';

interface BasenamePaymentFormProps {
  bucketName?: string;
  availableBalance?: bigint;
  currentSpent?: string;
  monthlyLimit?: string;
  onSuccess?: () => void;
}

export function BasenamePaymentForm({
  bucketName,
  availableBalance = BigInt(0),
  currentSpent = '0',
  monthlyLimit = '0',
  onSuccess
}: BasenamePaymentFormProps) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { smartAccountClient } = useSmartAccountContext();
  
  // Get the embedded wallet from Privy
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const address = embeddedWallet?.address;
  
  const { data: walletData } = useWalletUser();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedBucket, setSelectedBucket] = useState(bucketName || '');
  
  // Validation and resolution hooks
  const recipientValidation = useRecipientValidation();
  const basenameResolution = useBasenameResolution(recipient);
  const basenameMetadata = useBasenameMetadata(recipient);
  const recipientDisplayName = useRecipientDisplayName(recipient);
  const basenamePayment = useBasenamePayment();

  // Get available buckets from wallet data
  const availableBuckets = walletData?.realTimeData?.buckets || [];

  // Validation state
  const [validation, setValidation] = useState({
    isValid: false,
    type: 'invalid' as 'address' | 'basename' | 'invalid'
  });

  // Update validation when recipient changes
  useEffect(() => {
    const newValidation = recipientValidation.validateRecipient(recipient);
    setValidation(newValidation);
  }, [recipient, recipientValidation]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated || !embeddedWallet) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedBucket) {
      toast.error('Please select a bucket');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!validation.isValid) {
      toast.error('Please enter a valid recipient address or Base ENS name');
      return;
    }

    if (!smartAccountClient?.account) {
      toast.error('Smart account not available');
      return;
    }

    if (!address) {
      toast.error('Wallet not found');
      return;
    }

    try {
      const result = await basenamePayment.mutateAsync({
        smartAccountClient,
        walletAddress: address as `0x${string}`,
        userAddress: address as `0x${string}`,
        bucketName: selectedBucket,
        amount,
        recipient,
        availableBalance,
        currentSpent,
        monthlyLimit,
      });

      console.log('Payment successful:', result);
      
      // Reset form
      setAmount('');
      setRecipient('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      // Error handling is done in the mutation hook
    }
  };

  // Get recipient display info
  const getRecipientDisplay = () => {
    if (!recipient) return null;
    
    if (validation.type === 'basename' && basenameMetadata.data) {
      return {
        name: normalizeBasename(recipient),
        avatar: basenameMetadata.data.avatar,
        description: basenameMetadata.data.description,
        twitter: basenameMetadata.data.twitter,
        github: basenameMetadata.data.github,
        website: basenameMetadata.data.website,
        email: basenameMetadata.data.email,
      };
    }
    
    if (validation.type === 'address') {
      return {
        name: recipientDisplayName.data || `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        avatar: null,
        description: null,
        twitter: null,
        github: null,
        website: null,
        email: null,
      };
    }
    
    return null;
  };

  const recipientDisplay = getRecipientDisplay();
  const availableBalanceFormatted = formatUnits(availableBalance, 6);
  const currentSpentFormatted = formatUnits(BigInt(currentSpent), 6);
  const monthlyLimitFormatted = formatUnits(BigInt(monthlyLimit), 6);
  const remainingBudget = Math.max(0, parseFloat(monthlyLimitFormatted) - parseFloat(currentSpentFormatted));

  // Show connect wallet state if not authenticated
  if (!authenticated || !embeddedWallet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Send Payment</span>
            <Badge variant="secondary">Base ENS</Badge>
          </CardTitle>
          <CardDescription>
            Connect your wallet to send payments using Base ENS names
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Please connect your wallet to continue
          </p>
          <Button onClick={() => {}} className="inline-flex items-center gap-2" disabled>
            <span>Connect Wallet</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Send Payment</span>
          <Badge variant="secondary">Base ENS</Badge>
        </CardTitle>
        <CardDescription>
          Send USDC to any wallet address or Base ENS name
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bucket Selection */}
          <div className="space-y-2">
            <Label htmlFor="bucket">Select Bucket</Label>
            <select
              id="bucket"
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a bucket...</option>
              {availableBuckets.map((bucket: any) => (
                <option key={bucket.name} value={bucket.name}>
                  {bucket.name} - {formatUnits(BigInt(bucket.balance || '0'), 6)} USDC
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-gray-500">
              Available: {availableBalanceFormatted} USDC | 
              Remaining Budget: {remainingBudget.toFixed(2)} USDC
            </p>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={recipientValidation.getRecipientPlaceholder()}
              className={validation.isValid ? 'border-green-500' : validation.type === 'invalid' && recipient ? 'border-red-500' : ''}
              required
            />
            <p className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {recipientValidation.getRecipientHelperText(recipient)}
            </p>
            
            {/* Loading state for resolution */}
            {recipient && validation.isValid && basenameResolution.isLoading && (
              <p className="text-sm text-blue-600">Resolving recipient...</p>
            )}
          </div>

          {/* Recipient Display */}
          {recipientDisplay && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={recipientDisplay.avatar || undefined} />
                  <AvatarFallback>
                    {recipientDisplay.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{recipientDisplay.name}</p>
                  {recipientDisplay.description && (
                    <p className="text-sm text-gray-600">{recipientDisplay.description}</p>
                  )}
                </div>
                <Badge variant={validation.type === 'basename' ? 'default' : 'secondary'}>
                  {validation.type === 'basename' ? 'Base ENS' : 'Address'}
                </Badge>
              </div>
              
              {/* Social links for Base ENS */}
              {validation.type === 'basename' && (recipientDisplay.twitter || recipientDisplay.github || recipientDisplay.website) && (
                <>
                  <Separator className="my-2" />
                  <div className="flex gap-2 text-sm">
                    {recipientDisplay.twitter && (
                      <a 
                        href={`https://twitter.com/${recipientDisplay.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Twitter
                      </a>
                    )}
                    {recipientDisplay.github && (
                      <a 
                        href={`https://github.com/${recipientDisplay.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {recipientDisplay.website && (
                      <a 
                        href={recipientDisplay.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              basenamePayment.isPending ||
              !validation.isValid ||
              !amount ||
              !selectedBucket ||
              !smartAccountClient?.account ||
              !authenticated ||
              !embeddedWallet
            }
          >
            {basenamePayment.isPending ? 'Sending...' : 'Send Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 