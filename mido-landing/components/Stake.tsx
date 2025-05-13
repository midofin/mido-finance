/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { Switch } from "@/components/ui/switch";
import { Leaf, TrendingUp, Lock, Info, AlertTriangle, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";
import WalletContextProvider from "@/context/WalletContextProvider";
import idl from "@/app/sol_staking.json";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { allotPoints } from "@/app/actions/stake";
import { getUser, createUser } from "@/app/actions/user"; // Ensure correct import path
import Navbar from "./navbar";
import { motion, AnimatePresence } from 'framer-motion'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast, { Toaster } from 'react-hot-toast';
// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Mock Data
const apyHistory = [
  { month: "Jan", apy: 5 },
  { month: "Feb", apy: 5.2 },
  { month: "Mar", apy: 5.5 },
  { month: "Apr", apy: 5.7 },
  { month: "May", apy: 6 },
  { month: "Jun", apy: 6.2 },
];

const StakingPage: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null)
  const [miSOLBalance, setMiSOLBalance] = useState<number | null>(null)
  const [stakeAmountSOL, setStakeAmountSOL] = useState("")
  const [unstakeAmountMiSOL, setUnstakeAmountMiSOL] = useState("")
  const [stakeDuration, setStakeDuration] = useState(30)
  const [estimatedPoints, setEstimatedPoints] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(1000000) // Mock TVL
  const [currentApy, setCurrentApy] = useState(6.2) // Mock APY
  const [isAutoCompound, setIsAutoCompound] = useState(false)
  const [riskLevel, setRiskLevel] = useState("low")
  const [mintAuthorityPda, setMintAuthorityPda] = useState<PublicKey | null>(null)
  const [treasuryPda, setTreasuryPda] = useState<PublicKey | null>(null)
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const anchorWallet = useAnchorWallet()

  const programId = useMemo(() => {
    if (!idl.metadata || !idl.metadata.address) {
      console.error("IDL metadata.address is missing")
      toast.error("Failed to initialize program.")
      return null
    }
    return new PublicKey(idl.metadata.address)
  }, [idl.metadata, toast])

  const anchorProvider = useMemo(() => {
    if (anchorWallet && programId) {
      return new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
    }
    return null
  }, [connection, anchorWallet, programId])

  const program = useMemo(() => {
    if (anchorProvider && programId) {
      return new anchor.Program(idl as any, programId, anchorProvider)
    }
    return null
  }, [anchorProvider, programId])

  const stakingPoolPublicKey = useMemo(() => new PublicKey("C6iSFRBLsPwCZ3JZy376UHC8FPpy978iQukRMpM8ugdU"), [])
  const mintPublicKey = useMemo(() => new PublicKey("DHWAnFMCS7nFYdVeiCNqmhANFfDrLMzLfPEVkfQM78Mh"), [])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num)
  }
  useEffect(() => {
    const derivePdas = async () => {
      if (program && stakingPoolPublicKey) {
        try {
          const [derivedTreasuryPda] = await PublicKey.findProgramAddress(
            [Buffer.from("treasury"), stakingPoolPublicKey.toBuffer()],
            program.programId
          )
          setTreasuryPda(derivedTreasuryPda)
          // console.log("Derived Treasury PDA:", derivedTreasuryPda.toBase58());
          
          const [derivedMintAuthorityPda] = await PublicKey.findProgramAddress(
            [Buffer.from("mint_authority"), stakingPoolPublicKey.toBuffer()],
            program.programId
          )
          setMintAuthorityPda(derivedMintAuthorityPda)
        } catch (error) {
          console.error("Error deriving PDAs:", error)
          toast.error("Failed to derive program-derived addresses.");
        }
      }
    }

    derivePdas()
  }, [program, stakingPoolPublicKey, toast])

  const getWalletBalance = async () => {
    if (!publicKey) {
      setBalance(null)
      return null
    }

    try {
      console.log("Fetching wallet balance for:", publicKey.toBase58())
      const balanceInLamports = await connection.getBalance(publicKey)
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL
      console.log("Wallet balance:", balanceInSOL)
      setBalance(balanceInSOL)
      return balanceInSOL
    } catch (error) {
      console.error("Failed to get wallet balance:", error)
      setBalance(null)
      return null
    }
  }

  const getMiSOLBalance = async () => {
    if (!publicKey || !mintPublicKey) {
      setMiSOLBalance(null)
      return null
    }

    try {
      console.log("Fetching miSOL balance for:", publicKey.toBase58())
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey)
      console.log("miSOL ATA:", userMsolAccount.toBase58())
      const msolAccountInfo = await connection.getTokenAccountBalance(userMsolAccount)
      const msolBalance = msolAccountInfo.value.uiAmount || 0
      console.log("miSOL balance:", msolBalance)
      setMiSOLBalance(msolBalance)
      return msolBalance
    } catch (error: any) {
      console.log("miSOL balance error:", error)
      if (error.code === "AccountNotFound") {
        setMiSOLBalance(0)
        return 0
      } else {
        console.error("Failed to get miSOL balance:", error)
        setMiSOLBalance(0)
        return 0
      }
    }
  }

  // Initial balance fetch on wallet connection
  useEffect(() => {
    let mounted = true;
    let balanceSubscription: number | undefined;
    let miSolSubscription: number | undefined;

    const fetchBalances = async () => {
      if (!publicKey) {
        console.log("Wallet disconnected, resetting balances...")
        if (mounted) {
          setBalance(null)
          setMiSOLBalance(null)
          setStakeAmountSOL("")
          setUnstakeAmountMiSOL("")
          setIsStaking(false)
          setIsUnstaking(false)
        }
        return;
      }

      console.log("Wallet connected, fetching balances...")
      try {
        // Add a small delay to ensure wallet is fully connected
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted || !publicKey) return;

        const [solBalance, miSolBalance] = await Promise.all([
          getWalletBalance(),
          getMiSOLBalance()
        ]);

        if (!mounted || !publicKey) return;

        // Force a re-render by setting state
        if (solBalance !== null) setBalance(solBalance);
        if (miSolBalance !== null) setMiSOLBalance(miSolBalance);

        // Set up SOL balance subscription
        balanceSubscription = connection.onAccountChange(
          publicKey,
          async () => {
            if (!mounted || !publicKey) return;
            console.log("SOL balance changed, updating...")
            try {
              await getWalletBalance()
            } catch (error) {
              console.error("Error updating SOL balance:", error)
            }
          },
          "confirmed"
        );

        // Set up miSOL balance subscription
        if (mintPublicKey) {
          try {
            const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            miSolSubscription = connection.onAccountChange(
              userMsolAccount,
              async () => {
                if (!mounted || !publicKey) return;
                console.log("miSOL balance changed, updating...")
                try {
                  await getMiSOLBalance()
                } catch (error) {
                  console.error("Error updating miSOL balance:", error)
                }
              },
              "confirmed"
            );
          } catch (error) {
            console.error("Failed to set up miSOL subscription:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching initial balances:", error)
        toast.error("Failed to fetch initial balances")
      }
    }

    fetchBalances()

    return () => {
      mounted = false;
      if (balanceSubscription) {
        connection.removeAccountChangeListener(balanceSubscription)
      }
      if (miSolSubscription) {
        connection.removeAccountChangeListener(miSolSubscription)
      }
    }
  }, [publicKey, connection, mintPublicKey])

  // Force balance refresh when connection changes
  useEffect(() => {
    if (!publicKey) return;

    let mounted = true;
    console.log("Connection changed, refreshing balances...")
    
    const refreshBalances = async () => {
      if (!mounted || !publicKey) return;
      try {
        await Promise.all([
          getWalletBalance(),
          getMiSOLBalance()
        ])
      } catch (error) {
        console.error("Error refreshing balances after connection change:", error)
      }
    }

    refreshBalances()

    return () => {
      mounted = false;
    }
  }, [connection, publicKey])

  useEffect(() => {
    const calculatePoints = () => {
      if (!stakeAmountSOL || parseFloat(stakeAmountSOL) <= 0) {
        setEstimatedPoints(0)
        return
      }

      const stakeSOL = parseFloat(stakeAmountSOL)
      const hoursStaked = stakeDuration * 24
      const BASE_POINTS_PER_SOL_PER_HOUR = 10
      const pointsEarned = stakeSOL * BASE_POINTS_PER_SOL_PER_HOUR * hoursStaked
      const timeMultiplier = 1 + Math.min(hoursStaked / 720, 0.5) // Max 50% bonus after 30 days
      setEstimatedPoints(Math.round(pointsEarned * timeMultiplier))
    }

    calculatePoints()
  }, [stakeAmountSOL, stakeDuration])

  // Handle Stake Function
  const handleStake = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet to stake SOL and get miSOL.");
      return;
    }

    if (
      !program ||
      !anchorWallet ||
      !mintPublicKey ||
      !mintAuthorityPda ||
      !stakingPoolPublicKey ||
      !treasuryPda
    ) {
      console.error("Program not initialized");
      toast.error("Failed to initialize staking program. Please try again.");
      return;
    }

    if (parseFloat(stakeAmountSOL) <= 0) {
      console.error("Invalid stake amount");
      toast.error("Please enter a valid staking amount.");
      return;
    }

    setIsStaking(true);
    try {
      console.log("Initiating stake...");

      // **Check if user exists in backend**
      const userResponse = await getUser(publicKey.toBase58());

      let user;
      if (userResponse === "User not found") {
        console.log("User not found in DB. Creating new user...");
        const createUserResponse = await createUser(publicKey.toBase58());

        if (createUserResponse === "Invalid Solana wallet address") {
          toast.error("Invalid Solana wallet address. Please try again.");
          return;
        }

        if (typeof createUserResponse === "string" && createUserResponse === "User already exists") {
          toast.error("User already exists in the database.");
          return;
        }

        user = createUserResponse;
        console.log("User created:", user);
        toast.success("Your account has been created in the backend");
      } else {
        user = userResponse;
        console.log("User found:", user);
      }

      // Derive user's miSOL account
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      // console.log(`User's miSOL ATA: ${userMsolAccount.toBase58()}`);

      // Check if user miSOL account exists
      const userMsolAccountInfo = await connection.getAccountInfo(userMsolAccount);
      const tx = new Transaction();

      if (!userMsolAccountInfo) {
        console.log("miSOL ATA does not exist. Creating ATA...");
        // Create associated token account if it doesn't exist
        const createAtaIx = createAssociatedTokenAccountInstruction(
          publicKey, // Payer
          userMsolAccount, // ATA
          publicKey, // Owner
          mintPublicKey // Mint
        );
        tx.add(createAtaIx);
      } else {
        console.log("miSOL ATA exists.");
      }

      // Define the stake amount in lamports
      const amountLamports = Math.floor(parseFloat(stakeAmountSOL) * LAMPORTS_PER_SOL);
      console.log(`Staking Amount: ${amountLamports} lamports`);

      // Create stake instruction
      const stakeIx = await program.methods
        .stake(new anchor.BN(amountLamports))
        .accounts({
          stakingPool: stakingPoolPublicKey,
          user: publicKey,
          userMsolAccount: userMsolAccount,
          treasury: treasuryPda,
          mint: mintPublicKey,
          mintAuthority: mintAuthorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      tx.add(stakeIx);
      tx.feePayer = publicKey;

      // Fetch latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;

      // Sign and send transaction
      const signedTx = await anchorWallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      console.log(`Transaction Signature: ${signature}`);

      // Confirm transaction
      console.log("Confirming transaction...");
      const confirmation = await connection.confirmTransaction(
        {
          signature: signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      console.log("Staking Successful!");
      toast.success(`Successfully staked ${stakeAmountSOL} SOL. Transaction: ${signature.slice(0, 8)}...`);

      // **Allot Points after successful staking**

      // Frontend fetch ata account info due to vercel's compute limitations TODO: move to backend
      const ataAccountInfo = await getAccount(connection, userMsolAccount);
      const pointsResponse = await allotPoints(publicKey.toBase58(), ataAccountInfo);

      if (pointsResponse === "User not found") {
        toast.error("User not found in the database. Please try again.");
      } else if (typeof pointsResponse === "string") {
        // Handle other string responses if any
        toast.error(pointsResponse);
      } else {
        console.log("Points Allotted:", pointsResponse.points);
        toast.success(`You have earned ${pointsResponse.points} points.`);
      }

      // Update balances
      await getWalletBalance();
      await getMiSOLBalance();

      // Reset stake amount
      setStakeAmountSOL("");
    } catch (error: any) {
      console.error("Staking error:", error);

      // Attempt to fetch transaction logs if available
      if (error.message.includes("Simulation failed")) {
        try {
          const txDetails = await connection.getTransaction(error.signature, { commitment: "confirmed" });
          const logs = txDetails?.meta?.logMessages?.join("\n") || "No logs available.";
          toast.error(`Failed to stake tokens: ${logs}`);
        } catch (logError) {
          console.error("Failed to fetch transaction logs:", logError);
          toast.error(`Failed to stake tokens: ${(error as Error).message}`);
        }
      } else {
        toast.error(`Failed to stake tokens: ${(error as Error).message}`);
      }
    } finally {
      setIsStaking(false);
    }
  };

  // Handle Unstake Function
  const handleUnstake = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet to unstake miSOL.");
      return;
    }

    if (!program || !anchorWallet || !mintPublicKey || !mintAuthorityPda || !stakingPoolPublicKey || !treasuryPda) {
      console.error("Program not initialized");
      toast.error("Failed to initialize unstaking program. Please try again.");
      return;
    }

    if (parseFloat(unstakeAmountMiSOL) <= 0) {
      toast.error("Please enter a valid unstaking amount.");
      return;
    }

    setIsUnstaking(true);
    try {
      console.log("Initiating unstake...");

      // Derive user's miSOL account
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      console.log(`User's miSOL ATA: ${userMsolAccount.toBase58()}`);

      // Define the unstake amount in miSOL units (assuming miSOL has 9 decimals)
      const amountMiSOL = parseFloat(unstakeAmountMiSOL);
      const amount = new anchor.BN(amountMiSOL * 10 ** 9);
      console.log(`Unstaking Amount: ${amount.toString()} miSOL`);

      // Create unstake instruction
      const unstakeIx = await program.methods
        .unstake(amount)
        .accounts({
          stakingPool: stakingPoolPublicKey,
          user: publicKey,
          userMsolAccount: userMsolAccount,
          treasury: treasuryPda,
          mint: mintPublicKey,
          mintAuthority: mintAuthorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction();

      // Create transaction
      const tx = new Transaction().add(unstakeIx);
      tx.feePayer = publicKey;

      // Fetch latest blockhash
      console.log("Fetching latest blockhash...");
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;

      // Sign and send transaction
      console.log("Signing transaction...");
      const signedTx = await anchorWallet.signTransaction(tx);
      console.log("Sending transaction...");
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      console.log(`Transaction Signature: ${signature}`);

      // Confirm transaction
      console.log("Confirming transaction...");
      const confirmation = await connection.confirmTransaction(
        {
          signature: signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      console.log("Unstaking Successful!");
      toast.success(`Successfully unstaked ${unstakeAmountMiSOL} miSOL. Transaction: ${signature.slice(0, 8)}...`);

      // Update balances
      await getWalletBalance();
      await getMiSOLBalance();

      // Reset unstake amount
      setUnstakeAmountMiSOL("");
    } catch (error: any) {
      console.error("Unstaking error:", error);

      // Attempt to fetch transaction logs if available
      if (error.message.includes("Simulation failed")) {
        try {
          const txDetails = await connection.getTransaction(error.signature, { commitment: "confirmed" });
          const logs = txDetails?.meta?.logMessages?.join("\n") || "No logs available.";
          toast.error(`Failed to unstake tokens: ${logs}`);
        } catch (logError) {
          console.error("Failed to fetch transaction logs:", logError);
          toast.error(`Failed to unstake tokens: ${(error as Error).message}`);
        }
      } else {
        toast.error(`Failed to unstake tokens: ${(error as Error).message}`);
      }
    } finally {
      setIsUnstaking(false);
    }
  };

  // Handle Max Stake (leaves 0.01 SOL for fees)
  const handleMaxStake = () => {
    if (balance !== null) {
      const maxStake = Math.max(balance - 0.01, 0);
      setStakeAmountSOL(maxStake.toFixed(9));
    }
  };

  return (
    <WalletContextProvider>
      <div>
        <Toaster position="bottom-right" />

        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <Navbar />
          <main className="container mx-auto px-4 py-28">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center text-green-400 mb-12"
            >
              MIDO Liquid Staking
            </motion.h1>

            <div className="w-full max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-green-500/10 transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-2xl">Stake/Unstake SOL</CardTitle>
                    <CardDescription className="text-gray-400">Manage your SOL and miSOL</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {publicKey ? (
                      <>
                        <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                          <h2 className="flex items-center text-lg text-white">
                            <TrendingUp className="mr-2 text-green-400" /> Wallet Balance
                          </h2>
                          {balance !== null ? (
                            <p className="text-green-400">{balance.toFixed(4)} SOL</p>
                          ) : (
                            <p className="text-gray-400">Loading balance...</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                          <h2 className="flex items-center text-lg text-white">
                            <Lock className="mr-2 text-green-400" /> miSOL Balance
                          </h2>
                          {miSOLBalance !== null ? (
                            miSOLBalance > 0 ? (
                              <p className="text-green-400 text-xl font-bold">{miSOLBalance.toFixed(4)} miSOL</p>
                            ) : (
                              <p className="text-gray-400">0 miSOL</p>
                            )
                          ) : (
                            <p className="text-gray-400">Loading miSOL balance...</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-400">Please connect your wallet to view your balances. (refresh the page if you just connected your wallet and balances are not loading)</p>
                    )}

                    <div className="flex justify-center">
                      <WalletMultiButton className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300" />
                    </div>

                    <Tabs defaultValue="stake" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-700 rounded-lg p-1">
                        <TabsTrigger value="stake" className="rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white transition-colors duration-300">Stake</TabsTrigger>
                        <TabsTrigger value="unstake" className="rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white transition-colors duration-300">Unstake</TabsTrigger>
                      </TabsList>
                      <TabsContent value="stake" className="mt-4">
                        <div className="space-y-4">
                          <Label htmlFor="stake-amount" className="text-white">
                            Amount to Stake (SOL)
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id="stake-amount"
                              type="number"
                              placeholder="Enter SOL amount"
                              value={stakeAmountSOL}
                              onChange={(e) => setStakeAmountSOL(e.target.value)}
                              className="bg-gray-700 text-white border-gray-600 focus:border-green-500 transition-colors duration-300"
                              min="0"
                              step="0.000000001"
                            />
                            <Button onClick={handleMaxStake} variant="outline" className="whitespace-nowrap hover:bg-green-500 hover:text-white transition-colors duration-300">
                              Max
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="stake-duration" className="text-white">
                              Stake Duration: {stakeDuration} days
                            </Label>
                            <Slider
                              id="stake-duration"
                              min={30}
                              max={365}
                              step={1}
                              value={[stakeDuration]}
                              onValueChange={(value) => setStakeDuration(value[0])}
                              className="bg-gray-700"
                            />
                          </div>

                          <div className="p-4 bg-gray-700 rounded-lg">
                            <div className="text-sm font-semibold text-green-400">Estimated Points</div>
                            <div className="text-3xl font-bold text-green-500">{formatNumber(estimatedPoints)} points</div>
                          </div>

                          <Button 
                            onClick={handleStake} 
                            className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-300"
                            disabled={isStaking}
                          >
                            {isStaking ? "Staking..." : "Stake SOL"}
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="unstake" className="mt-4">
                        <div className="space-y-4">
                          <Label htmlFor="unstake-amount" className="text-white">
                            Amount to Unstake (miSOL)
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id="unstake-amount"
                              type="number"
                              placeholder="Enter miSOL amount"
                              value={unstakeAmountMiSOL}
                              onChange={(e) => setUnstakeAmountMiSOL(e.target.value)}
                              className="bg-gray-700 text-white border-gray-600 focus:border-green-500 transition-colors duration-300"
                              min="0"
                              step="0.000000001"
                            />
                            <Button onClick={() => { }} variant="outline" className="whitespace-nowrap hover:bg-green-500 hover:text-white transition-colors duration-300">
                              Max
                            </Button>
                          </div>

                          <div className="p-4 bg-gray-700 rounded-lg">
                            <div className="text-sm font-semibold text-green-400">Estimated SOL to Receive</div>
                            <div className="text-3xl font-bold text-green-500">
                              {formatNumber(parseFloat(unstakeAmountMiSOL) || 0)} SOL
                            </div>
                          </div>

                          <Button 
                            onClick={handleUnstake} 
                            className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-300"
                            disabled={isUnstaking}
                          >
                            {isUnstaking ? "Unstaking..." : "Unstake miSOL"}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12"
              >
                <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-2xl">Learn More</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">
                      Discover how MIDO Finance is revolutionizing eco-friendly investments through blockchain technology.
                    </p>
                    <Button variant="outline" className="w-full hover:bg-green-500 hover:text-white transition-colors duration-300">
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Explore MIDO Ecosystem
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </WalletContextProvider>
  )
};

export default StakingPage;
