# Base ENS Integration

This document explains how Base ENS (Ethereum Name Service) integration has been implemented in the Expendi application, allowing users to send payments to human-readable Base ENS names instead of complex wallet addresses.

## Overview

Base ENS is a decentralized naming system built on the Base network that allows users to register human-readable names (like `alice.base.eth`) that resolve to wallet addresses. This integration enables users to send USDC payments to Base ENS names, making the payment experience more user-friendly.

## Features

- **Address Resolution**: Convert Base ENS names to wallet addresses
- **Reverse Resolution**: Convert wallet addresses to Base ENS names
- **Metadata Support**: Display avatars, descriptions, and social links from Base ENS profiles
- **Real-time Validation**: Validate Base ENS names and addresses as users type
- **Payment Integration**: Send USDC payments directly to Base ENS names
- **Multichain Support**: Base ENS names work across multiple chains

## Implementation

### Core Files

1. **`src/lib/abis/L2ResolverAbi.ts`** - ABI for the Base ENS L2 Resolver contract
2. **`src/lib/apis/basenames.ts`** - Core API functions for Base ENS resolution
3. **`src/hooks/useBasenamePayment.ts`** - React hooks for Base ENS payment functionality
4. **`src/components/basename/BasenamePaymentForm.tsx`** - Payment form component
5. **`src/components/basename/BasenameTest.tsx`** - Test component for debugging

### Key Functions

#### Address Resolution
```typescript
// Resolve Base ENS name to address
const address = await getAddressFromBasename('alice.base.eth');

// Resolve address to Base ENS name
const basename = await getBasename('0x1234...');
```

#### Metadata Retrieval
```typescript
// Get all metadata for a Base ENS name
const metadata = await getBasenameMetadata('alice.base.eth');
// Returns: { basename, avatar, description, twitter, github, website, email }
```

#### Recipient Resolution
```typescript
// Resolve any recipient (address or Base ENS name)
const resolvedAddress = await resolveRecipient('alice.base.eth');
```

### Integration Points

#### QuickSpendBucket Component
The existing `QuickSpendBucket` component has been updated to support Base ENS names:

- **Enhanced Validation**: Validates both wallet addresses and Base ENS names
- **Smart Payment Routing**: Automatically chooses the appropriate payment method
- **Real-time Feedback**: Shows validation status and recipient information

#### Payment Flow
1. User enters a Base ENS name or wallet address
2. System validates the input format
3. For Base ENS names, resolves to the actual wallet address
4. Retrieves metadata (avatar, description, social links) if available
5. Executes the payment transaction
6. Shows success confirmation with resolved information

## Usage Examples

### Basic Payment to Base ENS Name
```typescript
import { useBasenamePayment } from '@/hooks/useBasenamePayment';

const basenamePayment = useBasenamePayment();

const result = await basenamePayment.mutateAsync({
  smartAccountClient,
  walletAddress: '0x...',
  userAddress: '0x...',
  bucketName: 'groceries',
  amount: '10.50',
  recipient: 'alice.base.eth', // Base ENS name
  availableBalance: BigInt(1000000000), // 1000 USDC
  currentSpent: '0',
  monthlyLimit: '1000',
});
```

### Validation and Resolution
```typescript
import { useRecipientValidation, useBasenameResolution } from '@/hooks/useBasenamePayment';

const validation = useRecipientValidation();
const resolution = useBasenameResolution('alice.base.eth');

// Check if input is valid
const isValid = validation.validateRecipient('alice.base.eth').isValid;

// Get resolved address
const address = resolution.data; // 0x1234...
```

## Configuration

### Base ENS Resolver Contract
- **Address**: `0x8c8F1a1e1bFdb15E7ed562efc84e5A588E68aD73`
- **Network**: Base Mainnet (Chain ID: 8453)
- **ABI**: Complete L2 Resolver ABI included in the codebase

### Wallet Integration
The Base ENS integration is designed to work with **Privy** for wallet connection:
- Uses Privy's embedded wallet for all transactions
- Integrates with the existing SmartAccountContext for gas sponsorship
- Supports both EOA and smart account transactions
- Automatically handles wallet connection states

### Environment Variables
No additional environment variables are required for Base ENS functionality beyond the existing Privy configuration.

## Testing

### Test Component
Use the `BasenameTest` component to test Base ENS functionality:

1. Navigate to `/basename-payment`
2. Scroll down to the "Base ENS Test Tool" section
3. Enter a Base ENS name or wallet address
4. Test different resolution functions

### Example Test Cases
- **Valid Base ENS**: `alice.base.eth`
- **Valid Address**: `0x8c8F1a1e1bFdb15E7ed562efc84e5A588E68aD73`
- **Invalid Input**: `invalid-name`

## Error Handling

The integration includes comprehensive error handling:

- **Invalid Format**: Shows validation errors for malformed inputs
- **Resolution Failures**: Handles cases where Base ENS names don't resolve
- **Network Errors**: Gracefully handles RPC failures
- **User Feedback**: Clear error messages and loading states

## Performance Considerations

- **Caching**: Base ENS resolution results are cached for 5 minutes
- **Debounced Validation**: Input validation is debounced to avoid excessive API calls
- **Lazy Loading**: Metadata is only fetched when needed
- **Error Recovery**: Failed resolutions are retried with exponential backoff

## Security

- **Input Validation**: All inputs are validated before processing
- **Address Verification**: Resolved addresses are verified to be valid Ethereum addresses
- **No Private Key Exposure**: All operations are read-only or use existing wallet connections
- **Rate Limiting**: Built-in rate limiting to prevent abuse

## Future Enhancements

Potential improvements for the Base ENS integration:

1. **ENS Integration**: Support for mainnet ENS names
2. **Batch Resolution**: Resolve multiple names in a single request
3. **Offline Support**: Cache frequently used Base ENS names
4. **Profile Management**: Allow users to set their own Base ENS names
5. **Social Features**: Display mutual connections through Base ENS

## Troubleshooting

### Common Issues

1. **Resolution Fails**
   - Check if the Base ENS name exists
   - Verify network connectivity
   - Ensure the name is properly formatted

2. **Metadata Not Loading**
   - Some Base ENS names may not have metadata set
   - Check if the text records are properly configured

3. **Payment Fails**
   - Verify the resolved address has sufficient balance
   - Check if the Base ENS name is still active
   - Ensure the smart account has sufficient gas

### Debug Tools

Use the `BasenameTest` component to debug Base ENS issues:

```typescript
// Test address to Base ENS resolution
const basename = await getBasename('0x8c8F1a1e1bFdb15E7ed562efc84e5A588E68aD73');

// Test Base ENS to address resolution
const address = await getAddressFromBasename('alice.base.eth');

// Test metadata retrieval
const metadata = await getBasenameMetadata('alice.base.eth');
```

## References

- [Base ENS Documentation](https://docs.base.org/base-account/basenames/basenames-wagmi-tutorial)
- [Base Network](https://base.org/)
- [ENS Documentation](https://docs.ens.domains/)
- [L2 Resolver ABI](https://gist.github.com/hughescoin/adf1c90b67cd9b2b913b984a2cc98de9) 