import { NextResponse } from 'next/server';
import client from "@/db";
import { PublicKey } from '@solana/web3.js';

export const config = {
    runtime: 'edge',
};

export async function POST(request: Request) {
    try {
        const { walletAddress } = await request.json();

        try {
            const publicKey = new PublicKey(walletAddress);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid Solana wallet address' }, { status: 400 });
        }

        const existingUser = await client.user.findUnique({
            where: {
                walletAddress
            }
        });
        if (existingUser) {
            return NextResponse.json(existingUser, { status: 200 });
        }

        const newUser = await client.user.create({
            data: {
                walletAddress
            }
        });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }
}