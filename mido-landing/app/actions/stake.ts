// actions/stake.ts
"use server";
import client from "@/db";
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, Account } from '@solana/spl-token';

const MINT_ADDRESS = process.env.MINT_ADDRESS || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';


async function fetchAccountWithRetry(connection: Connection, ataAddress: PublicKey, retries: number = 200, delay: number = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const ataAccountInfo = await getAccount(connection, ataAddress);
      return ataAccountInfo;
    } catch (error) {
      console.log(`ATA not found. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to fetch ATA after multiple retries.");
}

export async function allotPoints(walletAddress: string, ataAccount: Account) {
  if (!MINT_ADDRESS) {
    throw new Error("MINT_ADDRESS is not defined in environment variables.");
  }

  console.log(walletAddress, "walletAddress");
  const user = await client.user.findUnique({
    where: {
      walletAddress,
    },
  });

  if (!user) {
    return "User not found";
  }

  const connection = new Connection(SOLANA_RPC_URL);
  const ataAddress = await getAssociatedTokenAddress(
      new PublicKey(MINT_ADDRESS),
      new PublicKey(walletAddress)
  );

  // This won't work on vercel because of compute limit, frontend impl for now. TODO: backend impl
  // const ataAccountInfo = await fetchAccountWithRetry(connection, ataAddress);
  const ataAccountInfo = ataAccount;

  const stakedAmount = Number(ataAccountInfo.amount) / 1_000_000_000;

  const pointsPerSol = 1000;
  const points = Math.round(stakedAmount * pointsPerSol);

  const updatedUser = await client.user.update({
    where: {
      id: user.id,
    },
    data: {
      points: user.points + points,
    },
  });

  return { updatedUser, mSolAccount: stakedAmount, points };
}
