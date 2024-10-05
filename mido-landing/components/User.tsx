/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as anchor from "@project-serum/anchor";
import {
  useConnection,
  useWallet,
  AnchorWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/app/sol_staking.json"; // Ensure this path is correct
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Leaf,
  TrendingUp,
  Lock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dynamic from "next/dynamic";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { toast } from "@/hooks/use-toast"; // Ensure you have a toast/notification system
import { allotPoints } from "@/app/actions/stake"; // Server action to allot points
import { getUser, createUser } from "@/app/actions/user"; // Server actions for user management
import Navbar from "./navbar";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Mock data for the chart (you can replace this with real data)
const stakingHistory = [
  { date: "2023-01-01", amount: 100 },
  { date: "2023-02-01", amount: 150 },
  { date: "2023-03-01", amount: 200 },
  { date: "2023-04-01", amount: 180 },
  { date: "2023-05-01", amount: 250 },
  { date: "2023-06-01", amount: 300 },
];

const UserProfile: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState("overview");

  // Program ID from the IDL
  const programId = useMemo(() => {
    // Ensure idl.metadata.address exists
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
  }, [idl.metadata, toast]);

  // Initialize Anchor provider
  const provider = useMemo(() => {
    if (wallet.publicKey && programId) {
      return new AnchorProvider(
        connection,
        wallet as AnchorWallet,
        AnchorProvider.defaultOptions()
      );
    } else {
      return null;
    }
  }, [connection, wallet, programId]);

  // Initialize the program
  const program = useMemo(() => {
    if (provider && programId) {
      return new Program(idl as anchor.Idl, programId, provider);
    } else {
      return null;
    }
  }, [provider, programId]);

  // Define the staking pool public key (Replace with your actual staking pool public key)
  const stakingPoolPublicKey = useMemo(
    () => new PublicKey("B2CKtT3u3MXADsz8oTJpudWBFu9xfHfXVBeWDe65P6FG"), // Replace with actual
    []
  );

  // PDAs and other public keys
  const [userStakingAccountPda, setUserStakingAccountPda] = useState<PublicKey | null>(null);
  const [treasuryPda, setTreasuryPda] = useState<PublicKey | null>(null);
  const [mintAuthorityPda, setMintAuthorityPda] = useState<PublicKey | null>(null);
  const [userMsolAccountPda, setUserMsolAccountPda] = useState<PublicKey | null>(null);
  const mintPublicKey = useMemo(
    () => new PublicKey("E7GnthwndhRZvwwHp5MjzPYaq9zu5eTY2rDGyH3SRXLo"), // Replace with actual
    []
  );

  // User staking data from smart contract
  const [userStakingData, setUserStakingData] = useState<any>(null);

  // User data from backend and smart contract
  const [userData, setUserData] = useState<{
    username: string;
    avatar: string;
    totalStaked: number;
    totalRewards: number;
    carbonOffset: number;
    stakingLevel: string;
    nextLevelProgress: number;
    points: number;
  }>({
    username: "EcoInvestor",
    avatar: "/placeholder.svg",
    totalStaked: 0,
    totalRewards: 0,
    carbonOffset: 0,
    stakingLevel: "Bronze",
    nextLevelProgress: 0,
    points: 0,
  });

  // State for stake and unstake amounts
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);

  // Loading states
  const [isLoadingStake, setIsLoadingStake] = useState<boolean>(false);
  const [isLoadingUnstake, setIsLoadingUnstake] = useState<boolean>(false);
  const [isLoadingClaim, setIsLoadingClaim] = useState<boolean>(false);

  // Fetch and ensure user exists in backend
  useEffect(() => {
    const fetchAndEnsureUser = async () => {
      if (wallet.publicKey) {
        const walletAddress = wallet.publicKey.toBase58();
        let user = await getUser(walletAddress);

        if (user === "User not found") {
          // Create user in backend
          user = await createUser(walletAddress);
          if (user === "Invalid Solana wallet address") {
            toast({
              title: "Error",
              description: "Invalid Solana wallet address.",
              variant: "destructive",
            });
            return;
          }
          if (typeof user === "string") {
            toast({
              title: "Error",
              description: user,
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "User Created",
            description: "Your profile has been created in the backend.",
            variant: "default",
          });
        }

        // Update userData with points from backend
        if (typeof user !== "string") {
          setUserData((prevData) => ({
            ...prevData,
            points: user.points,
          }));
        }
      }
    };

    fetchAndEnsureUser();
  }, [wallet.publicKey, toast]);

  // Derive UserAccount PDA
  useEffect(() => {
    const deriveUserAccountPda = async () => {
      if (program && wallet.publicKey) {
        try {
          const [userPda, userBump] = await PublicKey.findProgramAddress(
            [Buffer.from("user"), wallet.publicKey.toBuffer()],
            program.programId
          );
          setUserStakingAccountPda(userPda);
          console.log("User Staking Account PDA:", userPda.toBase58());
        } catch (error) {
          console.error("Error deriving UserAccount PDA:", error);
          toast({
            title: "Error",
            description: "Failed to derive user staking account.",
            variant: "destructive",
          });
        }
      }
    };

    deriveUserAccountPda();
  }, [program, wallet.publicKey, toast]);

  // Derive miSOL Token Account PDA
  useEffect(() => {
    const deriveMsolAccountPda = async () => {
      if (program && wallet.publicKey && mintPublicKey) {
        try {
          const ata = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);
          setUserMsolAccountPda(ata);
          console.log("User miSOL ATA:", ata.toBase58());
        } catch (error) {
          console.error("Error deriving miSOL ATA:", error);
          toast({
            title: "Error",
            description: "Failed to derive miSOL associated token account.",
            variant: "destructive",
          });
        }
      }
    };

    deriveMsolAccountPda();
  }, [program, wallet.publicKey, mintPublicKey, toast]);

  // Fetch user staking data from smart contract
  useEffect(() => {
    const fetchUserStakingData = async () => {
      if (program && userStakingAccountPda) {
        try {
          const accountData = await program.account.userAccount.fetch(
            userStakingAccountPda
          );
          setUserStakingData(accountData);
          console.log("User Staking Data:", accountData);
        } catch (error: any) {
          if (error.message.includes("Account does not exist")) {
            console.warn("UserAccount not found. Initialize by staking.");
            // Optionally, set default values or prompt the user to stake
          } else {
            console.error("Error fetching user staking data:", error);
            toast({
              title: "Error",
              description: "Failed to fetch staking data.",
              variant: "destructive",
            });
          }
        }
      }
    };

    fetchUserStakingData();
  }, [program, userStakingAccountPda, toast]);

  // Update userData for display by combining backend and smart contract data
  useEffect(() => {
    const updateUserData = async () => {
      if (userStakingData) {
        // Assuming userStakingData has fields: total_staked, total_rewards, carbon_offset
        setUserData((prevData) => ({
          ...prevData,
          totalStaked: userStakingData.total_staked,
          totalRewards: userStakingData.total_rewards,
          carbonOffset: userStakingData.carbon_offset,
          stakingLevel: calculateStakingLevel(userStakingData.total_staked),
          nextLevelProgress: calculateNextLevelProgress(userStakingData.total_staked),
        }));
      }
    };

    updateUserData();
  }, [userStakingData]);

  // Functions to calculate staking level and progress
  const calculateStakingLevel = (totalStaked: number): string => {
    if (totalStaked >= 1000 * 1e9) return "Gold";
    if (totalStaked >= 500 * 1e9) return "Silver";
    return "Bronze";
  };

  const calculateNextLevelProgress = (totalStaked: number): number => {
    if (totalStaked >= 1000 * 1e9) return 100;
    if (totalStaked >= 500 * 1e9) return ((totalStaked - 500 * 1e9) / (500 * 1e9)) * 100;
    return (totalStaked / (500 * 1e9)) * 100;
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // StakingCard component
  const StakingCard = ({
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-green-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p
            className={`text-xs ${
              trend === "up" ? "text-green-500" : "text-red-500"
            } flex items-center`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="mr-1" />
            ) : (
              <ArrowDownRight className="mr-1" />
            )}
            {trend === "up" ? "+2.5%" : "-1.5%"}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Handle Stake function
  const handleStake = async () => {
    if (
      !program ||
      !wallet.publicKey ||
      !userStakingAccountPda ||
      !treasuryPda ||
      !mintAuthorityPda ||
      !userMsolAccountPda
    ) {
      toast({
        title: "Initialization Error",
        description: "Program accounts are not initialized yet.",
        variant: "destructive",
      });
      return;
    }

    if (stakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingStake(true);
    try {
      // Perform staking on the smart contract
      await program.rpc.stake(new anchor.BN(stakeAmount * 1e9), {
        accounts: {
          stakingPool: stakingPoolPublicKey,
          user: wallet.publicKey,
          user_msol_account: userMsolAccountPda, // Correct account name
          user_account: userStakingAccountPda, // Added UserAccount
          treasury: treasuryPda!, // Non-null assertion
          mint: mintPublicKey,
          mint_authority: mintAuthorityPda!, // Non-null assertion
          token_program: TOKEN_PROGRAM_ID,
          system_program: SystemProgram.programId,
        },
      });
      toast({
        title: "Stake Successful",
        description: `You have staked ${stakeAmount} SOL.`,
      });
      setStakeAmount(0);
      // Fetch updated staking data from smart contract
      const accountData = await program.account.userAccount.fetch(
        userStakingAccountPda
      );
      setUserStakingData(accountData);
      // Allot points in the backend
      const pointsResponse = await allotPoints(wallet.publicKey.toBase58());
      if (typeof pointsResponse === "string") {
        // Handle error message
        toast({
          title: "Error",
          description: pointsResponse,
          variant: "destructive",
        });
      } else {
        // Update points in userData
        setUserData((prevData) => ({
          ...prevData,
          points: pointsResponse.updatedUser.points,
        }));
        toast({
          title: "Points Allotted",
          description: `You have earned ${pointsResponse.points} points.`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error staking:", error);
      toast({
        title: "Error",
        description: "Failed to stake tokens.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStake(false);
    }
  };

  // Handle Unstake function
  const handleUnstake = async () => {
    if (
      !program ||
      !wallet.publicKey ||
      !userStakingAccountPda ||
      !treasuryPda ||
      !mintAuthorityPda ||
      !userMsolAccountPda
    ) {
      toast({
        title: "Initialization Error",
        description: "Program accounts are not initialized yet.",
        variant: "destructive",
      });
      return;
    }

    if (unstakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to unstake.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingUnstake(true);
    try {
      // Perform unstaking on the smart contract
      await program.rpc.unstake(new anchor.BN(unstakeAmount * 1e9), {
        accounts: {
          stakingPool: stakingPoolPublicKey,
          user: wallet.publicKey,
          user_msol_account: userMsolAccountPda,
          user_account: userStakingAccountPda,
          treasury: treasuryPda!, // Non-null assertion
          mint: mintPublicKey,
          mint_authority: mintAuthorityPda!, // Non-null assertion
          token_program: TOKEN_PROGRAM_ID,
          system_program: SystemProgram.programId,
        },
      });
      toast({
        title: "Unstake Successful",
        description: `You have unstaked ${unstakeAmount} miSOL.`,
      });
      setUnstakeAmount(0);
      // Fetch updated staking data from smart contract
      const accountData = await program.account.userAccount.fetch(
        userStakingAccountPda
      );
      setUserStakingData(accountData);
      // Optionally, adjust points if your logic requires
    } catch (error: any) {
      console.error("Error unstaking:", error);
      toast({
        title: "Error",
        description: "Failed to unstake tokens.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUnstake(false);
    }
  };

  // Handle Claim Rewards function
  const handleClaimRewards = async () => {
    if (
      !program ||
      !wallet.publicKey ||
      !userStakingAccountPda ||
      !treasuryPda ||
      !mintAuthorityPda ||
      !userMsolAccountPda
    ) {
      toast({
        title: "Initialization Error",
        description: "Program accounts are not initialized yet.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingClaim(true);
    try {
      // Perform claim rewards on the smart contract
      await program.rpc.claimRewards({
        accounts: {
          stakingPool: stakingPoolPublicKey,
          user: wallet.publicKey,
          user_account: userStakingAccountPda,
          treasury: treasuryPda!, // Non-null assertion
          mint: mintPublicKey,
          mint_authority: mintAuthorityPda!, // Non-null assertion
          token_program: TOKEN_PROGRAM_ID,
          system_program: SystemProgram.programId,
        },
      });
      toast({
        title: "Rewards Claimed",
        description: "Your rewards have been claimed.",
        variant: "default",
      });
      // Fetch updated staking data from smart contract
      const accountData = await program.account.userAccount.fetch(
        userStakingAccountPda
      );
      setUserStakingData(accountData);
      // Optionally, adjust points if your logic requires
    } catch (error: any) {
      console.error("Error claiming rewards:", error);
      toast({
        title: "Error",
        description: "Failed to claim rewards.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClaim(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Navbar/>
      <div className="max-w-6xl mx-auto space-y-6 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-400">User Profile</h1>
          <WalletMultiButtonDynamic />
        </div>

        {/* User Info Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar} alt={userData.username} />
                <AvatarFallback>{userData.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData.username}</h2>
                <p className="text-gray-400">
                  Wallet:{" "}
                  {wallet.publicKey
                    ? wallet.publicKey.toBase58()
                    : "Not connected"}
                </p>
                <Badge className="mt-2 bg-green-600">
                  {userData.stakingLevel} Staker
                </Badge>
                <p className="text-gray-400 mt-1">
                  Points: {userData.points}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StakingCard
            title="Total Staked"
            value={`${formatNumber(userData.totalStaked / 1e9)} miSOL`}
            icon={Lock}
            trend="up"
          />
          <StakingCard
            title="Total Rewards"
            value={`${formatNumber(userData.totalRewards / 1e9)} miSOL`}
            icon={Award}
            trend="up"
          />
          <StakingCard
            title="Carbon Offset"
            value={`${userData.carbonOffset} tons`}
            icon={Leaf}
          />
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Next Level Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {userData.nextLevelProgress.toFixed(2)}%
              </div>
              <Progress value={userData.nextLevelProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Overview, Staking, Rewards */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {/* Staking Overview Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">
                  Staking Overview
                </CardTitle>
                <p className="text-gray-400">
                  Your staking activity over time
                </p>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stakingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Additional Overview Content */}
            {/* You can add more cards or components here */}
          </TabsContent>
          <TabsContent value="staking" className="space-y-4">
            {/* Stake Tokens */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Stake Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stake Amount Input */}
                <div className="flex items-center space-x-4">
                  <label className="text-gray-300">Amount to Stake:</label>
                  <input
                    type="number"
                    className="bg-gray-700 text-white p-2 rounded-md"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    min="0"
                    step="0.000000001"
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleStake}
                  disabled={
                    isLoadingStake ||
                    !treasuryPda ||
                    !mintAuthorityPda ||
                    !userStakingAccountPda ||
                    !userMsolAccountPda ||
                    stakeAmount <= 0
                  }
                >
                  {isLoadingStake ? "Processing..." : "Stake Tokens"}
                </Button>
              </CardContent>
            </Card>
            {/* Unstake Tokens */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Unstake Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unstake Amount Input */}
                <div className="flex items-center space-x-4">
                  <label className="text-gray-300">Amount to Unstake:</label>
                  <input
                    type="number"
                    className="bg-gray-700 text-white p-2 rounded-md"
                    placeholder="Enter amount"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(Number(e.target.value))}
                    min="0"
                    step="0.000000001"
                  />
                </div>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleUnstake}
                  disabled={
                    isLoadingUnstake ||
                    !treasuryPda ||
                    !mintAuthorityPda ||
                    !userStakingAccountPda ||
                    !userMsolAccountPda ||
                    unstakeAmount <= 0
                  }
                >
                  {isLoadingUnstake ? "Processing..." : "Unstake Tokens"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rewards" className="space-y-4">
            {/* Rewards Content */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display rewards information */}
                <div className="flex justify-between items-center">
                  <span>Total Rewards Earned</span>
                  <span className="text-green-400">
                    {formatNumber(userData.totalRewards / 1e9)} miSOL
                  </span>
                </div>
                {/* Claim Rewards Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleClaimRewards}
                  disabled={
                    isLoadingClaim ||
                    !treasuryPda ||
                    !mintAuthorityPda ||
                    !userStakingAccountPda ||
                    !userMsolAccountPda
                  }
                >
                  {isLoadingClaim ? "Processing..." : "Claim Rewards"}
                </Button>
              </CardContent>
            </Card>
            {/* Reward History */}
            {/* Implement reward history if available */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
