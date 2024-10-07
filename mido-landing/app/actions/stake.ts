// actions/stake.ts
"use server";
import client from "@/db";
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const MINT_ADDRESS = process.env.MINT_ADDRESS || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';


async function fetchAccountWithRetry(connection: Connection, ataAddress: PublicKey, retries: number = 200, delay: number = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const ataAccountInfo = await getAccount(connection, ataAddress);
      return ataAccountInfo;
    } catch (error: any) {
      console.log(`ATA not found. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to fetch ATA after multiple retries.");
}

export async function allotPoints(walletAddress: string) {
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
  let ataAddress = await getAssociatedTokenAddress(
      new PublicKey(MINT_ADDRESS),
      new PublicKey(walletAddress)
    );

  const ataAccountInfo = await fetchAccountWithRetry(connection, ataAddress);

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
