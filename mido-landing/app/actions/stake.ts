// actions/stake.ts
"use server";
import client from "@/db";
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const MINT_ADDRESS = process.env.MINT_ADDRESS || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

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

  const ataAddress = await getAssociatedTokenAddress(
    new PublicKey(MINT_ADDRESS),
    new PublicKey(walletAddress)
  );
  const ataAccountInfo = await getAccount(connection, ataAddress);

  const stakedAmount = Number(ataAccountInfo.amount) / 1_000_000_000;

  const pointsPerSol = 500;
  const points = stakedAmount * pointsPerSol;

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
