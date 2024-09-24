import { NextResponse } from 'next/server';
import client from "@/db";

export const config = {
    runtime: 'edge',
};

export async function GET(request: Request, { params }: { params: { walletAddress: string } }) {
    try {
        const { walletAddress } = params;

        const user = await client.user.findUnique({
            where: {
                walletAddress
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
    }
}