"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as anchor from "@project-serum/anchor";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import idl from "@/app/sol_staking.json";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { toast } from "@/hooks/use-toast";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Dynamically import the chart component with SSR disabled
const RewardsChart = dynamic(() => import("@/components/RewardsChart"), {
  ssr: false,
});

const RewardsCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
}) => (
  <Card className="flex-1">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowUpRight className="h-4 w-4 rotate-180" />
            )}
            <span className="text-sm font-medium">+2.5%</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Rewards: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [rewardsData, setRewardsData] = useState({
    totalRewards: 0,
    claimableRewards: 0,
    currentApy: 6.2,
    nextRewardTime: Date.now() + 24 * 60 * 60 * 1000,
  });
  const [rewardsHistory, setRewardsHistory] = useState<
    Array<{ date: string; amount: number }>
  >([]);

  const programId = useMemo(() => {
    if (!idl.metadata || !idl.metadata.address) {
      console.error("IDL metadata.address is missing");
      toast({
        title: "Configuration Error",
        description: "Program ID is not set in the IDL file.",
        variant: "destructive",
      });
      return null;
    }
    return new PublicKey(idl.metadata.address);
  }, [idl.metadata]);

  const anchorProvider = useMemo(() => {
    if (anchorWallet && programId) {
      return new AnchorProvider(
        connection,
        anchorWallet,
        AnchorProvider.defaultOptions()
      );
    }
    return null;
  }, [connection, anchorWallet, programId]);

  const program = useMemo(() => {
    if (anchorProvider && programId) {
      return new Program(idl as anchor.Idl, programId, anchorProvider);
    }
    return null;
  }, [anchorProvider, programId]);

  const stakingPoolPublicKey = useMemo(
    () => new PublicKey("C6iSFRBLsPwCZ3JZy376UHC8FPpy978iQukRMpM8ugdU"),
    []
  );

  const mintPublicKey = useMemo(
    () => new PublicKey("DHWAnFMCS7nFYdVeiCNqmhANFfDrLMzLfPEVkfQM78Mh"),
    []
  );

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(
      num
    );
  };

  const formatTimeUntilNextReward = (timestamp: number): string => {
    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return "Available now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Fetch user's staking data and calculate rewards
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!publicKey || !program) return;

      try {
        // Derive user's PDA
        const [userPda] = await PublicKey.findProgramAddress(
          [Buffer.from("user"), publicKey.toBuffer()],
          program.programId
        );

        // Get user's miSOL account
        const userMsolAccount = await getAssociatedTokenAddress(
          mintPublicKey,
          publicKey
        );

        // Fetch user's staking data
        const userAccount = await program.account.user.fetch(userPda);
        const msolAccountInfo = await connection.getTokenAccountBalance(
          userMsolAccount
        );
        const stakedAmount = msolAccountInfo.value.uiAmount || 0;

        // Calculate rewards based on staking amount and time
        const stakingTime =
          Date.now() - userAccount.stakeTime.toNumber() * 1000;
        const daysStaked = stakingTime / (1000 * 60 * 60 * 24);
        const apy = 6.2; // This should come from the contract
        const totalRewards = (stakedAmount * apy * daysStaked) / 365;
        const claimableRewards =
          totalRewards - (userAccount.claimedRewards || 0);

        // Calculate next reward time (24 hours from last claim)
        const lastClaimTime = userAccount.lastClaimTime?.toNumber() || 0;
        const nextRewardTime = lastClaimTime * 1000 + 24 * 60 * 60 * 1000;

        setRewardsData({
          totalRewards,
          claimableRewards,
          currentApy: apy,
          nextRewardTime,
        });

        // Fetch rewards history from events
        if (!programId) {
          throw new Error("Program ID is not set");
        }

        const stakeEvents = await connection.getParsedProgramAccounts(
          programId,
          {
            filters: [
              {
                memcmp: {
                  offset: 8, // Adjust this offset based on your account structure
                  bytes: publicKey.toBase58(),
                },
              },
            ],
          }
        );

        const history = stakeEvents.map((account) => {
          if (!Buffer.isBuffer(account.account.data)) {
            throw new Error("Account data is not a buffer");
          }
          const data = account.account.data;
          const amount = new anchor.BN(data.slice(8, 16), "le");
          return {
            date: new Date().toLocaleDateString(), // You might want to store the actual date in your account data
            amount: amount.toNumber() / LAMPORTS_PER_SOL,
          };
        });

        setRewardsHistory(history);
      } catch (error) {
        console.error("Error fetching staking data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch staking data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchStakingData();
    // Set up interval to refresh data every minute
    const interval = setInterval(fetchStakingData, 60000);
    return () => clearInterval(interval);
  }, [publicKey, program, connection, mintPublicKey]);

  const handleClaimRewards = async () => {
    if (!publicKey || !program) {
      toast({
        title: "Error",
        description: "Please connect your wallet to claim rewards.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Derive user's PDA
      const [userPda] = await PublicKey.findProgramAddress(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId
      );

      // Create claim rewards transaction
      const tx = await program.methods
        .claimRewards()
        .accounts({
          stakingPool: stakingPoolPublicKey,
          user: userPda,
          userMsolAccount: await getAssociatedTokenAddress(
            mintPublicKey,
            publicKey
          ),
          treasury: await program.account.stakingPool
            .fetch(stakingPoolPublicKey)
            .then((pool) => pool.treasury),
          mint: mintPublicKey,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Rewards claimed successfully!",
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast({
        title: "Error",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Rewards</h1>
        <p className="text-muted-foreground">
          Track and claim your staking rewards
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <RewardsCard
          title="Total Rewards"
          value={`${formatNumber(rewardsData.totalRewards)} SOL`}
          icon={Award}
          trend="up"
        />
        <RewardsCard
          title="Claimable Rewards"
          value={`${formatNumber(rewardsData.claimableRewards)} SOL`}
          icon={TrendingUp}
        />
        <RewardsCard
          title="Current APY"
          value={`${rewardsData.currentApy}%`}
          icon={TrendingUp}
        />
        <RewardsCard
          title="Next Reward"
          value={formatTimeUntilNextReward(rewardsData.nextRewardTime)}
          icon={Clock}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rewards History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RewardsChart data={rewardsHistory} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Claimable Rewards</span>
                  <span className="font-medium">
                    {formatNumber(rewardsData.claimableRewards)} SOL
                  </span>
                </div>
                <Progress
                  value={
                    (rewardsData.claimableRewards / rewardsData.totalRewards) *
                    100
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleClaimRewards}
                disabled={isLoading || rewardsData.claimableRewards <= 0}
              >
                {isLoading ? "Claiming..." : "Claim Rewards"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;
