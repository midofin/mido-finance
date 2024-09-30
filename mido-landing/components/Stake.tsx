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
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Switch } from "@/components/ui/switch";
import { Leaf, TrendingUp, Lock, Info, AlertTriangle, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";
import WalletContextProvider from "@/context/WalletContextProvider";
import idl from "@/app/sol_staking.json";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { allotPoints } from "@/app/actions/stake";
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
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [miSOLBalance, setMiSOLBalance] = useState<number | null>(null); // New state for miSOL balance
  const [stakeAmountSOL, setStakeAmountSOL] = useState("");
  const [unstakeAmountMiSOL, setUnstakeAmountMiSOL] = useState(""); // New state for unstake amount
  const [stakeDuration, setStakeDuration] = useState(30);
  const [estimatedRewards, setEstimatedRewards] = useState(0);
  const [totalValueLocked, setTotalValueLocked] = useState(1000000); // Mock TVL
  const [currentApy, setCurrentApy] = useState(6.2); // Mock APY
  const [isAutoCompound, setIsAutoCompound] = useState(false);
  const [riskLevel, setRiskLevel] = useState("low");

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const programId = useMemo(() => new PublicKey(idl.metadata.address), []);

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const anchorProvider = useMemo(() => {
    if (anchorWallet) {
      return new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions());
    }
    return null;
  }, [connection, anchorWallet]);

  const program = useMemo(() => {
    if (anchorProvider) {
      return new anchor.Program(idl as any, programId, anchorProvider);
    }
    return null;
  }, [anchorProvider, programId]);

  // Define the staking pool public key (Replace with your actual staking pool public key)
  const stakingPoolPublicKey = useMemo(() => new PublicKey("B2CKtT3u3MXADsz8oTJpudWBFu9xfHfXVBeWDe65P6FG"), []);

  // Define PDAs as PublicKey instances
  const [mintAuthorityPda, setMintAuthorityPda] = useState<PublicKey | null>(null);
  const [treasuryPda, setTreasuryPda] = useState<PublicKey | null>(null);

  // Define Mint PublicKey
  const mintPublicKey = useMemo(() => new PublicKey("E7GnthwndhRZvwwHp5MjzPYaq9zu5eTY2rDGyH3SRXLo"), []);

  // Derive PDAs
  useEffect(() => {
    const derivePdas = async () => {
      if (program && stakingPoolPublicKey) {
        try {
          // Derive Treasury PDA
          const [derivedTreasuryPda, treasuryBump] = await PublicKey.findProgramAddress(
            [Buffer.from("treasury"), stakingPoolPublicKey.toBuffer()],
            program.programId
          );
          setTreasuryPda(derivedTreasuryPda);
          console.log(`Derived Treasury PDA: ${derivedTreasuryPda.toBase58()}`);

          // Derive Mint Authority PDA
          const [derivedMintAuthorityPda, mintAuthorityBump] = await PublicKey.findProgramAddress(
            [Buffer.from("mint_authority"), stakingPoolPublicKey.toBuffer()],
            program.programId
          );
          setMintAuthorityPda(derivedMintAuthorityPda);
          console.log(`Derived Mint Authority PDA: ${derivedMintAuthorityPda.toBase58()}`);
        } catch (error) {
          console.error("Error deriving PDAs:", error);
          toast({
            title: "Error",
            description: "Failed to derive program addresses.",
            variant: "destructive",
          });
        }
      }
    };

    derivePdas();
  }, [program, stakingPoolPublicKey, toast]);

  // Fetch wallet balance and miSOL balance
  useEffect(() => {
    if (publicKey) {
      getWalletBalance();
      getMiSOLBalance();
    } else {
      setBalance(null);
      setMiSOLBalance(null);
    }
  }, [publicKey, connection]);

  // Update estimated rewards based on stake amount and duration
  useEffect(() => {
    const calculateRewards = () => {
      if (!stakeAmountSOL || parseFloat(stakeAmountSOL) <= 0) {
        setEstimatedRewards(0);
        return;
      }

      // Example: Simple APY calculation
      const stakeSOL = parseFloat(stakeAmountSOL);
      const rewards = stakeSOL * (currentApy / 100) * (stakeDuration / 365);
      setEstimatedRewards(rewards);
    };

    calculateRewards();
  }, [stakeAmountSOL, stakeDuration, currentApy]);

  // Fetch user's SOL balance
  const getWalletBalance = async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    try {
      console.log("Fetching wallet balance...");
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
      console.log(`Wallet Balance: ${balanceInSOL} SOL`);
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      setBalance(null);
    }
  };

  // Fetch user's miSOL balance
  const getMiSOLBalance = async () => {
    if (!publicKey) {
      setMiSOLBalance(null);
      return;
    }

    try {
      console.log("Fetching miSOL balance...");
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      const msolAccountInfo = await connection.getTokenAccountBalance(userMsolAccount);
      const msolBalance = msolAccountInfo.value.uiAmount || 0;
      setMiSOLBalance(msolBalance);
      console.log(`miSOL Balance: ${msolBalance} miSOL`);
    } catch (error) {
      console.error("Failed to get miSOL balance:", error);
      setMiSOLBalance(null);
    }
  };

  // Handle Stake Function

  const handleStake = async () => {
    if (!publicKey || !program || !anchorWallet || !mintPublicKey || !mintAuthorityPda || !stakingPoolPublicKey || !treasuryPda) {
      console.error("Wallet not connected or program not initialized");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake SOL and get miSOL.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(stakeAmountSOL) <= 0) {
      console.error("Invalid stake amount");
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Initiating stake...");

      // Derive user's miSOL account
      const userMsolAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      console.log(`User's miSOL ATA: ${userMsolAccount.toBase58()}`);

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

      console.log("Adding stake instruction to transaction...");
      tx.add(stakeIx);
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

      console.log("Staking Successful!");
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmountSOL} SOL. Transaction: ${signature.slice(0, 8)}...`,
        variant: "default",
      });

      const points = await allotPoints(publicKey.toBase58());

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
          toast({
            title: "Staking Failed",
            description: `Failed to stake tokens: ${logs}`,
            variant: "destructive",
          });
        } catch (logError) {
          console.error("Failed to fetch transaction logs:", logError);
          toast({
            title: "Staking Failed",
            description: `Failed to stake tokens: ${(error as Error).message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Staking Failed",
          description: `Failed to stake tokens: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    }
  };

  // Handle Unstake Function
  const handleUnstake = async () => {
    if (!publicKey || !program || !anchorWallet || !mintPublicKey || !mintAuthorityPda || !stakingPoolPublicKey || !treasuryPda) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake miSOL.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(unstakeAmountMiSOL) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid unstaking amount.",
        variant: "destructive",
      });
      return;
    }

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
      toast({
        title: "Unstaking Successful",
        description: `Successfully unstaked ${unstakeAmountMiSOL} miSOL. Transaction: ${signature.slice(0, 8)}...`,
        variant: "default",
      });

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
          toast({
            title: "Unstaking Failed",
            description: `Failed to unstake tokens: ${logs}`,
            variant: "destructive",
          });
        } catch (logError) {
          console.error("Failed to fetch transaction logs:", logError);
          toast({
            title: "Unstaking Failed",
            description: `Failed to unstake tokens: ${(error as Error).message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Unstaking Failed",
          description: `Failed to unstake tokens: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
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
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-center text-green-400">MIDO Finance Staking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staking Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Stake/Unstake SOL</CardTitle>
                <CardDescription className="text-gray-400">Earn rewards by staking your SOL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {publicKey ? (
                  <>
                    {/* Wallet Balance */}
                    <div className="text-white flex justify-between">
                      <h2>Wallet Balance</h2>
                      {balance !== null ? <p>{balance.toFixed(4)} SOL</p> : <p>Loading balance...</p>}
                    </div>

                    {/* miSOL Balance */}
                    <div className="text-white flex justify-between">
                      <h2>miSOL Balance</h2>
                      {miSOLBalance !== null ? <p>{miSOLBalance.toFixed(4)} miSOL</p> : <p>Loading miSOL balance...</p>}
                    </div>
                  </>
                ) : (
                  <p>Please connect your wallet to view your balances.</p>
                )}

                {/* Wallet Connection Button */}
                <div className="flex justify-center">
                  <WalletMultiButtonDynamic />
                </div>

                {/* Stake SOL Section */}
                <div className="space-y-2">
                  <Label htmlFor="stake-amount" className="text-gray-300">
                    Amount to Stake (SOL)
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="Enter SOL amount"
                      value={stakeAmountSOL}
                      onChange={(e) => setStakeAmountSOL(e.target.value)}
                      className="bg-gray-700 text-white"
                      min="0"
                      step="0.000000001"
                    />
                    <Button onClick={handleMaxStake} variant="outline" className="whitespace-nowrap">
                      Max
                    </Button>
                  </div>
                </div>

                {/* Unstake miSOL Section */}
                <div className="space-y-2">
                  <Label htmlFor="unstake-amount" className="text-gray-300">
                    Amount to Unstake (miSOL)
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="unstake-amount"
                      type="number"
                      placeholder="Enter miSOL amount"
                      value={unstakeAmountMiSOL}
                      onChange={(e) => setUnstakeAmountMiSOL(e.target.value)}
                      className="bg-gray-700 text-white"
                      min="0"
                      step="0.000000001"
                    />
                  </div>
                </div>

                {/* Stake Duration Slider */}
                <div className="space-y-2">
                  <Label htmlFor="stake-duration" className="text-gray-300">
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

                {/* Auto-Compound Switch */}
                <div className="flex items-center space-x-2">
                  <Switch id="auto-compound" checked={isAutoCompound} onCheckedChange={setIsAutoCompound} />
                  <Label htmlFor="auto-compound" className="text-gray-300">
                    Auto-compound rewards
                  </Label>
                </div>

                {/* Estimated Rewards */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-sm font-semibold text-green-400">Estimated Rewards</div>
                  <div className="text-2xl font-bold text-green-600">{formatNumber(estimatedRewards)} miSOL</div>
                </div>
              </CardContent>
              <CardFooter className="flex space-x-2">
                <Button onClick={handleStake} className="flex-1 bg-green-600 hover:bg-green-700">
                  Stake SOL
                </Button>
                <Button onClick={handleUnstake} className="flex-1 bg-red-600 hover:bg-red-700">
                  Unstake miSOL
                </Button>
              </CardFooter>
            </Card>

            {/* Staking Overview Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Staking Overview</CardTitle>
                <CardDescription className="text-gray-400">
                  Platform statistics and your potential earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">APY History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="space-y-4">
                      {/* Current APY */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-300">
                          <TrendingUp className="mr-2" /> Current APY:
                        </span>
                        <span className="font-bold text-green-400">{currentApy}%</span>
                      </div>

                      {/* Total Value Locked */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-300">
                          <Lock className="mr-2" /> Total Value Locked:
                        </span>
                        <span className="font-bold">{formatNumber(totalValueLocked)} SOL</span>
                      </div>

                      {/* Risk Level Selection */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Risk Level</Label>
                        <div className="flex space-x-2">
                          {["low", "medium", "high"].map((level) => (
                            <Button
                              key={level}
                              variant={riskLevel === level ? "default" : "outline"}
                              onClick={() => setRiskLevel(level)}
                              className="flex-1 capitalize"
                            >
                              {level}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Risk Level Warning */}
                      {riskLevel !== "low" && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <AlertTriangle size={16} />
                          <span className="text-sm">
                            Higher risk levels may offer better rewards but come with increased volatility.
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={apyHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                          <Line
                            type="monotone"
                            dataKey="apy"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: "#10B981" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Leaf className="mr-2" /> Eco-Friendly
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Support sustainable projects by staking SOL and getting miSOL.
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <TrendingUp className="mr-2" /> High Yield
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Earn competitive returns while contributing to a greener future.
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Info className="mr-2" /> Low Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Our staking mechanism is designed to minimize risk and maximize returns.
              </CardContent>
            </Card>
          </div>

          {/* Learn More Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">Learn More</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Discover how MIDO Finance is revolutionizing eco-friendly investments through blockchain technology.
              </p>
              <Button variant="outline" className="w-full">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Explore MIDO Ecosystem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </WalletContextProvider>
  );
};

export default StakingPage;
