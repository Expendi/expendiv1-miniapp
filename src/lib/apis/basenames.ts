import {
  Address,
  ContractFunctionParameters,
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  namehash,
  parseUnits,
  formatUnits,
  isAddress,
} from 'viem';
import { base, mainnet } from 'viem/chains';
import L2ResolverAbi from '../abis/L2ResolverAbi';

// Base ENS L2 Resolver contract address
export const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD' as const;

// Create public client for Base network
const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// Type for Base ENS names
export type Basename = `${string}.base.eth`;
export type BaseName = string;

// Text record keys for metadata
export enum BasenameTextRecordKeys {
  Description = 'description',
  Keywords = 'keywords',
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
  Github = 'com.github',
  Twitter = 'com.twitter',
  Farcaster = 'xyz.farcaster',
  Lens = 'xyz.lens',
  Telegram = 'org.telegram',
  Discord = 'com.discord',
  Avatar = 'avatar',
}

export const textRecordsKeysEnabled = [
  BasenameTextRecordKeys.Description,
  BasenameTextRecordKeys.Keywords,
  BasenameTextRecordKeys.Url,
  BasenameTextRecordKeys.Github,
  BasenameTextRecordKeys.Email,
  BasenameTextRecordKeys.Phone,
  BasenameTextRecordKeys.Twitter,
  BasenameTextRecordKeys.Farcaster,
  BasenameTextRecordKeys.Lens,
  BasenameTextRecordKeys.Telegram,
  BasenameTextRecordKeys.Discord,
  BasenameTextRecordKeys.Avatar,
];

// Test function to verify Base ENS resolver contract
export async function testBaseENSResolver(): Promise<{
  contractExists: boolean;
  supportsAddr: boolean;
  resolverAddress: string;
  error?: string;
}> {
  try {
    console.log('🔍 Testing Base ENS resolver contract...');
    
    // Test if we can call a simple function on the contract
    const ens = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'ens',
    });
    
    console.log('✅ Contract exists, ENS address:', ens);
    
    // Test if we can resolve a known Base ENS name
    const testNode = namehash('base.base.eth');
    const testAddress = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'addr',
      args: [testNode],
    });
    
    console.log('✅ Contract works, resolved base.base.eth to:', testAddress);
    
    return {
      contractExists: true,
      supportsAddr: true,
      resolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
    };
  } catch (error) {
    console.error('❌ Error testing Base ENS resolver:', error);
    return {
      contractExists: false,
      supportsAddr: false,
      resolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Known Base ENS names for testing (these should exist)
export const KNOWN_BASE_ENS_NAMES = [
  'base.base.eth',
  'coinbase.base.eth',
  'optimism.base.eth',
  'test.base.eth',
  'demo.base.eth',
  'example.base.eth',
  'alice.base.eth',
  'bob.base.eth',
];

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return "addr";
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 */
export const convertReverseNodeToBytes = (
  address: Address,
  chainId: number
) => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`
  );
  const addressReverseNode = keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode])
  );
  return addressReverseNode;
};

// Debug function to check if a Base ENS name exists
export async function checkBasenameExists(basename: BaseName): Promise<boolean> {
  try {
    const cleanName = basename.endsWith('.base.eth') ? basename : `${basename}.base.eth`;
    const node = namehash(cleanName);
    
    console.log('🔍 Checking if Base ENS name exists:', {
      originalName: basename,
      cleanName,
      node: node,
      resolverAddress: BASENAME_L2_RESOLVER_ADDRESS
    });

    // Use direct contract call to check if name exists
    const address = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'addr',
      args: [node],
    });

    console.log('📋 Resolved address:', address);
    
    const exists = !!(address && address !== '0x0000000000000000000000000000000000000000');
    console.log('✅ Base ENS name exists:', exists);
    
    return exists;
  } catch (error) {
    console.error('❌ Error checking Base ENS name existence:', error);
    return false;
  }
}

export async function getBasename(address: Address) {
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    const basename = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "name",
      args: [addressReverseNode],
    });
    if (basename) {
      return basename as Basename;
    }
  } catch (error) {
    console.error('Error resolving Basename:', error);
  }
  return null;
}

// Function to resolve an address from a Base ENS name
export async function getAddressFromBasename(basename: BaseName): Promise<Address | null> {
  try {
    // Remove .base.eth suffix if present
    const cleanName = basename.endsWith('.base.eth') ? basename : `${basename}.base.eth`;
    const node = namehash(cleanName);
    
    console.log('🔍 Resolving Base ENS name:', {
      originalName: basename,
      cleanName,
      node: node,
      resolverAddress: BASENAME_L2_RESOLVER_ADDRESS
    });

    // Use direct contract call to the resolver
    const address = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'addr',
      args: [node],
    });
    
    console.log('📋 Resolved address:', address);
    
    if (address && address !== '0x0000000000000000000000000000000000000000') {
      return address as Address;
    }
    return null;
  } catch (error) {
    console.error('Error resolving address from Basename:', error);
    return null;
  }
}

export async function getBasenameAvatar(basename: BaseName) {
  try {
    const cleanName = basename.endsWith('.base.eth') ? basename : `${basename}.base.eth`;
    const node = namehash(cleanName);
    
    const avatar = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'text',
      args: [node, BasenameTextRecordKeys.Avatar],
    });

    return avatar || null;
  } catch (error) {
    console.error('Error getting Basename avatar:', error);
    return null;
  }
}

export function buildBasenameTextRecordContract(
  basename: Basename,
  key: BasenameTextRecordKeys
): ContractFunctionParameters {
  return {
    abi: L2ResolverAbi,
    address: BASENAME_L2_RESOLVER_ADDRESS,
    args: [namehash(basename), key],
    functionName: "text",
  };
}

// Get a single TextRecord
export async function getBasenameTextRecord(
  basename: BaseName,
  key: BasenameTextRecordKeys
) {
  try {
    const cleanName = basename.endsWith('.base.eth') ? basename : `${basename}.base.eth`;
    const contractParameters = buildBasenameTextRecordContract(cleanName as Basename, key);
    const textRecord = await baseClient.readContract(contractParameters);
    return textRecord as string;
  } catch (error) {
    console.error(`Error getting Basename text record for ${key}:`, error);
    return null;
  }
}

// Get a all TextRecords
export async function getBasenameTextRecords(basename: Basename) {
  try {
    const readContracts: ContractFunctionParameters[] =
      textRecordsKeysEnabled.map((key) =>
        buildBasenameTextRecordContract(basename, key)
      );
    const textRecords = await baseClient.multicall({
      contracts: readContracts,
    });

    return textRecords;
  } catch (error) {
    console.error('Error getting Basename text records:', error);
    return null;
  }
}

// Function to validate if a string is a valid Base ENS name
export function isValidBasename(name: string): boolean {
  // Basic validation for Base ENS names
  const baseNameRegex = /^[a-zA-Z0-9-]+(\.base\.eth)?$/;
  return baseNameRegex.test(name) && name.length > 0 && name.length <= 63;
}

// Function to normalize Base ENS name (add .base.eth suffix if missing)
export function normalizeBasename(name: string): string {
  if (name.endsWith('.base.eth')) {
    return name;
  }
  return `${name}.base.eth`;
}

// Function to get all metadata for a Basename
export async function getBasenameMetadata(basename: BaseName) {
  try {
    const cleanName = normalizeBasename(basename);
    
    const [avatar, description, twitter, github, website, email] = await Promise.all([
      getBasenameAvatar(cleanName),
      getBasenameTextRecord(cleanName, BasenameTextRecordKeys.Description),
      getBasenameTextRecord(cleanName, BasenameTextRecordKeys.Twitter),
      getBasenameTextRecord(cleanName, BasenameTextRecordKeys.Github),
      getBasenameTextRecord(cleanName, BasenameTextRecordKeys.Url),
      getBasenameTextRecord(cleanName, BasenameTextRecordKeys.Email),
    ]);

    return {
      basename: cleanName,
      avatar,
      description,
      twitter,
      github,
      website,
      email,
    };
  } catch (error) {
    console.error('Error getting Basename metadata:', error);
    return null;
  }
}

// Function to resolve recipient (handles both addresses and Base ENS names)
export async function resolveRecipient(recipient: string): Promise<Address | null> {
  // If it's already a valid address, return it
  if (isAddress(recipient)) {
    return recipient as Address;
  }
  
  // If it looks like a Base ENS name, try to resolve it
  if (isValidBasename(recipient)) {
    console.log('🔍 Resolving Base ENS name to address:', recipient);
    const address = await getAddressFromBasename(recipient);
    if (address) {
      console.log('✅ Successfully resolved to address:', address);
      return address;
    } else {
      console.log('❌ Failed to resolve Base ENS name:', recipient);
      return null;
    }
  }
  
  return null;
}

// Function to get display name for a recipient (address or Base ENS name)
export async function getRecipientDisplayName(recipient: string): Promise<string> {
  // If it's an address, try to get the Base ENS name
  if (isAddress(recipient)) {
    const basename = await getBasename(recipient as Address);
    if (basename) {
      return basename;
    }
    // Return shortened address if no Base ENS name
    return `${recipient.slice(0, 6)}...${recipient.slice(-4)}`;
  }
  
  // If it's a Base ENS name, return it as is
  if (isValidBasename(recipient)) {
    return normalizeBasename(recipient);
  }
  
  // Return as is if it's neither
  return recipient;
} 