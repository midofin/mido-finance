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
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
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
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { toast } from "@/hooks/use-toast"; // Ensure you have a toast/notification system
import { allotPoints } from "@/app/actions/stake"; // Server action to allot points
import { getUser, createUser } from "@/app/actions/user"; // Server actions for user management
import Navbar from "./navbar";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
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
  const [balance, setBalance] = useState<number | null>(null);
  const [miSOLBalance, setMiSOLBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Program ID from the IDL
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
  }, [idl.metadata, toast]);

  // Initialize Anchor provider
  const provider = useMemo(() => {
    if (wallet.publicKey && programId) {
      return new AnchorProvider(
        connection,
        wallet as AnchorWallet,
        AnchorProvider.defaultOptions()
      );
    }
    return null;
  }, [connection, wallet, programId]);

  // Initialize the program
  const program = useMemo(() => {
    if (provider && programId) {
      return new Program(idl as anchor.Idl, programId, provider);
    }
    return null;
  }, [provider, programId]);

  // Define the staking pool public key
  const stakingPoolPublicKey = useMemo(
    () => new PublicKey("C6iSFRBLsPwCZ3JZy376UHC8FPpy978iQukRMpM8ugdU"),
    []
  );

  // Define the mint public key
  const mintPublicKey = useMemo(
    () => new PublicKey("DHWAnFMCS7nFYdVeiCNqmhANFfDrLMzLfPEVkfQM78Mh"),
    []
  );

  // User data from backend
  const [userData, setUserData] = useState<{
    username: string;
    avatar: string;
    points: number;
  }>({
    username: "EcoInvestor",
    avatar: "/placeholder.svg",
    points: 0,
  });

  // Fetch wallet balances
  const getWalletBalance = async () => {
    if (!wallet.publicKey) {
      setBalance(null);
      return null;
    }

    try {
      const balanceInLamports = await connection.getBalance(wallet.publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
      return balanceInSOL;
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      setBalance(null);
      return null;
    }
  };

  const getMiSOLBalance = async () => {
    if (!wallet.publicKey || !mintPublicKey) {
      setMiSOLBalance(null);
      return null;
    }

    try {
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);
      const msolAccountInfo = await connection.getTokenAccountBalance(userMsolAccount);
      const msolBalance = msolAccountInfo.value.uiAmount || 0;
      setMiSOLBalance(msolBalance);
      return msolBalance;
    } catch (error: any) {
      if (error.code === "AccountNotFound") {
        setMiSOLBalance(0);
        return 0;
      }
      console.error("Failed to get miSOL balance:", error);
      setMiSOLBalance(0);
      return 0;
    }
  };

  // Fetch user data and balances
  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.publicKey) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const walletAddress = wallet.publicKey.toBase58();
        
        // Fetch user data from backend
        const user = await getUser(walletAddress);
        if (typeof user !== "string") {
          setUserData(prev => ({
            ...prev,
            points: user.points
          }));
        }

        // Fetch balances
        await Promise.all([
          getWalletBalance(),
          getMiSOLBalance()
        ]);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [wallet.publicKey]);

  // Subscribe to balance changes
  useEffect(() => {
    if (!wallet.publicKey) return;

    const subscriptionId = connection.onAccountChange(
      wallet.publicKey,
      () => {
        getWalletBalance();
      },
      "confirmed"
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [wallet.publicKey, connection]);

  // Subscribe to miSOL balance changes
  useEffect(() => {
    if (!wallet.publicKey || !mintPublicKey) return;

    const subscribeToMiSOLBalance = async () => {
      try {
        const mintKey = mintPublicKey; // Create local variable for type narrowing
        if (!mintKey) {
          console.error("mintKey is null");
          return;
        }
        if (!wallet.publicKey) {
          console.error("wallet.publicKey is null");
          return;
        }
        const userMsolAccount = await getAssociatedTokenAddress(mintKey, wallet.publicKey);
        const subscriptionId = connection.onAccountChange(
          userMsolAccount,
          () => {
            getMiSOLBalance();
          },
          "confirmed"
        );

        return () => {
          connection.removeAccountChangeListener(subscriptionId);
        };
      } catch (error) {
        console.error("Failed to subscribe to miSOL balance changes:", error);
      }
    };

    subscribeToMiSOLBalance();
  }, [wallet.publicKey, mintPublicKey, connection]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(num);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Navbar/>
      <div className="max-w-6xl mx-auto space-y-6 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-400">User Profile</h1>
          <WalletMultiButton />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
          </div>
        ) : wallet.publicKey ? (
          <>
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
                        ? `${wallet.publicKey.toBase58().slice(0, 6)}...${wallet.publicKey.toBase58().slice(-4)}`
                        : "Not connected"}
                    </p>
                    <Badge className="mt-2 bg-green-600">
                      Points: {userData.points}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StakingCard
                title="Wallet Balance"
                value={`${formatNumber(balance || 0)} SOL`}
                icon={TrendingUp}
              />
              <StakingCard
                title="miSOL Balance"
                value={`${formatNumber(miSOLBalance || 0)} miSOL`}
                icon={Lock}
              />
              <StakingCard
                title="Total Points"
                value={userData.points.toString()}
                icon={Award}
              />
            </div>

            {/* Tabs for Overview and Rewards */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400">
                      Staking Overview
                    </CardTitle>
                    <p className="text-gray-400">
                      Your current staking position
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total SOL Staked</span>
                        <span className="text-white font-bold">
                          {formatNumber(miSOLBalance || 0)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Points Earned</span>
                        <span className="text-white font-bold">
                          {userData.points} points
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rewards" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400">Rewards</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Points</span>
                      <span className="text-green-400 font-bold">
                        {userData.points} points
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current miSOL Balance</span>
                      <span className="text-green-400 font-bold">
                        {formatNumber(miSOLBalance || 0)} miSOL
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">Please connect your wallet to view your profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
