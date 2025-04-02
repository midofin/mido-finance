import client from "@/db";
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, Account } from '@solana/spl-token';
import { calculateRewardPoints } from "@/lib/rewardCalculator";

const MINT_ADDRESS = process.env.MINT_ADDRESS || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function verifyStakingPosition(
    connection: Connection,
    walletAddress: string,
    mintAddress: string
): Promise<number> {
    try {
        const ataAddress = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(walletAddress)
        );

        const ataAccount = await getAccount(connection, ataAddress);
        return Number(ataAccount.amount) / 1_000_000_000; // Convert to SOL
    } catch (error) {
        console.error(`Failed to verify staking position for ${walletAddress}:`, error);
        return 0;
    }
}


// actions/updateRewards.ts
export async function dailyRewardUpdate() {
    if (!MINT_ADDRESS || !SOLANA_RPC_URL) {
        throw new Error("Required environment variables are not defined.");
    }

    const connection = new Connection(SOLANA_RPC_URL);
    const currentTime = new Date();

    // Get all active staking positions
    const activePositions = await client.stakingPosition.findMany({
        where: { isActive: true }
    });

    for (const position of activePositions) {
        try {
            // Verify current staking amount on blockchain
            const currentStakedAmount = await verifyStakingPosition(
                connection,
                position.walletAddress,
                MINT_ADDRESS
            );

            // Handle unstaking scenarios
            if (currentStakedAmount === 0) {
                // Full unstake - mark position as inactive
                await client.stakingPosition.update({
                    where: { id: position.id },
                    data: {
                        isActive: false,
                        stakedAmount: 0,
                        lastVerificationTimestamp: currentTime
                    }
                });
                continue;
            } else if (currentStakedAmount < position.stakedAmount) {
                // Partial unstake - update staked amount
                const newPoints = calculateRewardPoints(
                    position.stakedAmount, // Use old amount for period before verification
                    position.stakingStartTimestamp,
                    position.lastRewardCalculationTimestamp,
                    currentTime
                );

                await client.stakingPosition.update({
                    where: { id: position.id },
                    data: {
                        stakedAmount: currentStakedAmount,
                        lastRewardCalculationTimestamp: currentTime,
                        lastVerificationTimestamp: currentTime,
                        accumulatedPoints: position.accumulatedPoints + newPoints
                    }
                });

                // Update user's total points
                await client.user.update({
                    where: { walletAddress: position.walletAddress },
                    data: {
                        points: { increment: newPoints }
                    }
                });
                continue;
            }

            // Normal reward calculation for unchanged positions
            const newPoints = calculateRewardPoints(
                position.stakedAmount,
                position.stakingStartTimestamp,
                position.lastRewardCalculationTimestamp,
                currentTime
            );

            // Update position
            await client.stakingPosition.update({
                where: { id: position.id },
                data: {
                    lastRewardCalculationTimestamp: currentTime,
                    lastVerificationTimestamp: currentTime,
                    accumulatedPoints: position.accumulatedPoints + newPoints
                }
            });

            // Update user's total points
            await client.user.update({
                where: { walletAddress: position.walletAddress },
                data: {
                    points: { increment: newPoints }
                }
            });
        } catch (error) {
            console.error(`Failed to process rewards for position ${position.id}:`, error);
            continue;
        }
    }
}
