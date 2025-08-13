import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { 
  resolveRecipient, 
  getRecipientDisplayName, 
  getBasenameMetadata,
  isValidBasename,
  normalizeBasename,
  type BaseName 
} from '../lib/apis/basenames';
import { useSpendFromBucket } from './useSpendFromBucket';
import { getNetworkConfig } from '../lib/contracts/config';
import { BUDGET_WALLET_ABI } from '../lib/contracts/budget-wallet';

interface BasenamePaymentRequest {
  smartAccountClient: any; // Smart account client from permissionless
  walletAddress: `0x${string}`;
  userAddress: `0x${string}`;
  bucketName: string;
  amount: string;
  recipient: string; // Can be address or Base ENS name
  availableBalance: bigint;
  currentSpent: string;
  monthlyLimit: string;
}

interface BasenamePaymentResponse {
  txHash: string;
  resolvedAddress: `0x${string}`;
  displayName: string;
}

interface BasenameMetadataResponse {
  basename: string;
  avatar: string | null;
  description: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  email: string | null;
}

// Hook to resolve Base ENS name to address
export function useBasenameResolution(basename: string | null) {
  return useQuery({
    queryKey: ['basename-resolution', basename],
    queryFn: async (): Promise<`0x${string}` | null> => {
      if (!basename) return null;
      return await resolveRecipient(basename);
    },
    enabled: !!basename && (isAddress(basename) || isValidBasename(basename)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to get Base ENS metadata
export function useBasenameMetadata(basename: string | null) {
  return useQuery({
    queryKey: ['basename-metadata', basename],
    queryFn: async (): Promise<BasenameMetadataResponse | null> => {
      if (!basename || !isValidBasename(basename)) return null;
      return await getBasenameMetadata(basename);
    },
    enabled: !!basename && isValidBasename(basename),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to get display name for recipient
export function useRecipientDisplayName(recipient: string | null) {
  return useQuery({
    queryKey: ['recipient-display-name', recipient],
    queryFn: async (): Promise<string> => {
      if (!recipient) return '';
      return await getRecipientDisplayName(recipient);
    },
    enabled: !!recipient,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Main hook for Base ENS payments
export function useBasenamePayment() {
  const spendFromBucket = useSpendFromBucket();

  const mutation = useMutation({
    mutationFn: async (request: BasenamePaymentRequest): Promise<BasenamePaymentResponse> => {
      const {
        smartAccountClient,
        walletAddress,
        userAddress,
        bucketName,
        amount,
        recipient,
        availableBalance,
        currentSpent,
        monthlyLimit,
      } = request;

      // Validation
      if (!bucketName) {
        throw new Error('Please select a bucket');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!recipient) {
        throw new Error('Please enter a recipient address or Base ENS name');
      }

      if (!smartAccountClient?.account) {
        throw new Error('Smart account not available');
      }

      // Resolve recipient (address or Base ENS name)
      const resolvedAddress = await resolveRecipient(recipient);
      if (!resolvedAddress) {
        if (isValidBasename(recipient)) {
          throw new Error(`Base ENS name "${recipient}" could not be resolved. It may not exist or the resolver contract may be unavailable.`);
        } else {
          throw new Error('Invalid recipient address or Base ENS name');
        }
      }

      // Get display name for the recipient
      const displayName = await getRecipientDisplayName(recipient);

      // Balance checks
      const availableBalanceFormatted = formatUnits(availableBalance, 6);
      const currentSpentFormatted = formatUnits(BigInt(currentSpent), 6);
      const monthlyLimitFormatted = formatUnits(BigInt(monthlyLimit), 6);
      const remainingBudget = parseFloat(monthlyLimitFormatted) - parseFloat(currentSpentFormatted);

      if (parseFloat(amount) > parseFloat(availableBalanceFormatted)) {
        throw new Error(`Insufficient balance in bucket. Available: ${availableBalanceFormatted} USDC`);
      }

      if (parseFloat(amount) > remainingBudget) {
        throw new Error(`Amount exceeds remaining budget. Remaining: ${remainingBudget.toFixed(2)} USDC`);
      }

      // Show initial loading message
      const recipientDisplay = isValidBasename(recipient) ? normalizeBasename(recipient) : displayName;
      toast.info(`Sending ${amount} USDC to ${recipientDisplay}...`);

      // Get network configuration
      const networkConfig = getNetworkConfig();
      const usdcAddress = networkConfig.USDC_ADDRESS as `0x${string}`;
      const parsedAmount = parseUnits(amount, 6); // USDC has 6 decimals

      // Execute the transaction
      const txHash = await smartAccountClient.writeContract({
        address: walletAddress,
        abi: BUDGET_WALLET_ABI,
        functionName: 'spendFromBucket',
        args: [
          userAddress, // user
          bucketName, // bucketName
          parsedAmount, // amount
          resolvedAddress, // recipient (resolved address)
          usdcAddress, // token (USDC)
          '0x' as `0x${string}` // data (empty)
        ],
        account: smartAccountClient.account,
        chain: smartAccountClient.chain
      });

      toast.success(`Successfully sent ${amount} USDC to ${recipientDisplay}!`);
      
      return { 
        txHash, 
        resolvedAddress, 
        displayName: recipientDisplay 
      };
    },
  });

  return mutation;
}

// Hook to validate recipient input (address or Base ENS name)
export function useRecipientValidation() {
  return {
    validateRecipient: (recipient: string): { isValid: boolean; type: 'address' | 'basename' | 'invalid' } => {
      if (!recipient) {
        return { isValid: false, type: 'invalid' };
      }
      
      if (isAddress(recipient)) {
        return { isValid: true, type: 'address' };
      }
      
      if (isValidBasename(recipient)) {
        return { isValid: true, type: 'basename' };
      }
      
      return { isValid: false, type: 'invalid' };
    },
    
    getRecipientPlaceholder: (): string => {
      return 'Enter wallet address or Base ENS name (e.g., alice.base.eth)';
    },
    
    getRecipientHelperText: (recipient: string): string => {
      if (!recipient) {
        return 'Enter a wallet address or Base ENS name';
      }
      
      if (isAddress(recipient)) {
        return 'Valid wallet address';
      }
      
      if (isValidBasename(recipient)) {
        return 'Valid Base ENS name';
      }
      
      return 'Invalid format. Use a wallet address or Base ENS name';
    }
  };
} 