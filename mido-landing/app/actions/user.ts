"user server";
import client from "@/db";
import { PublicKey } from '@solana/web3.js';

export async function getUser(walletAddress: string) {
    const user = await client.user.findUnique({
        where: {
            walletAddress
        }
    });

    if (!user) {
       return "User not found";
    }

    return user;
}

export async function createUser(walletAddress: string) {
    try {
        const publicKey = new PublicKey(walletAddress);
    } catch (error) {
        return "Invalid Solana wallet address";
    }

    const existingUser = await client.user.findUnique({
        where: {
            walletAddress
        }
    });
    if (existingUser) {
        return existingUser;
    }

    const newUser = await client.user.create({
        data: {
            walletAddress
        }
    });
    return newUser;
}