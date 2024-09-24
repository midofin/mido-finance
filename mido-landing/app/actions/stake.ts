"use server"
import client from "@/db";
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const MINT_ADDRESS = '9Fe45EXDuNNqMbQtDj2CyiSp1CG8j4twuiqztsr9Jqo1';

export async function allotPoints(walletAddress: string) {
    const user = await client.user.findUnique({
      where: {
        walletAddress,
      },
    });

    if (!user) {
      return "User not found";
    }

    const connection = new Connection('https://api.devnet.solana.com');

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

    return updatedUser
}