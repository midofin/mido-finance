/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Leaf, TrendingUp, Lock, Info, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dynamic from 'next/dynamic'
import WalletContextProvider from '@/context/WalletContextProvider'

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

// Mock
const apyHistory = [
  { month: 'Jan', apy: 5 },
  { month: 'Feb', apy: 5.2 },
  { month: 'Mar', apy: 5.5 },
  { month: 'Apr', apy: 5.7 },
  { month: 'May', apy: 6 },
  { month: 'Jun', apy: 6.2 },
]

const StakingPage: React.FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()

  const [stakeAmount, setStakeAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState(30)
  const [estimatedRewards, setEstimatedRewards] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(1000000) // Mock TVL
  const [currentApy, setCurrentApy] = useState(6.2) // Mock APY
  const [isAutoCompound, setIsAutoCompound] = useState(false)
  const [riskLevel, setRiskLevel] = useState('low')

  const isWalletConnected = !!publicKey

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  useEffect(() => {
    const amount = parseFloat(stakeAmount) || 0
    let rewards = (amount * currentApy * stakeDuration) / (365 * 100)
    if (isAutoCompound) {
      rewards *= 1.1 // 10% bonus
    }
    setEstimatedRewards(parseFloat(rewards.toFixed(2)))
  }, [stakeAmount, stakeDuration, currentApy, isAutoCompound])

  const handleStake = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake SOL and get miSOL.",
        variant: "destructive",
      })
      return
    }

    if (parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid staking amount.",
        variant: "destructive",
      })
      return
    }
    //ADDRESS TO BE ADDED
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("ADDRESS"),
          lamports: parseFloat(stakeAmount) * LAMPORTS_PER_SOL,
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmount} SOL for ${stakeDuration} days. Transaction: ${signature.slice(0, 8)}...`,
      })
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: `Failed to stake tokens: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  const handleMaxStake = () => {
    const mockBalance = 1000
    setStakeAmount(mockBalance.toString())
  }

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-center text-green-400">MIDO Finance Staking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Stake SOL</CardTitle>
                <CardDescription className="text-gray-400">Earn rewards by staking your SOL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <WalletMultiButtonDynamic />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stake-amount" className="text-gray-300">Stake Amount (SOL)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="Enter amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-gray-700 text-white"
                    />
                    <Button onClick={handleMaxStake} variant="outline" className="whitespace-nowrap">
                      Max
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stake-duration" className="text-gray-300">Stake Duration: {stakeDuration} days</Label>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-compound"
                    checked={isAutoCompound}
                    onCheckedChange={setIsAutoCompound}
                  />
                  <Label htmlFor="auto-compound" className="text-gray-300">Auto-compound rewards</Label>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-sm font-semibold text-green-400">Estimated Rewards</div>
                  <div className="text-2xl font-bold text-green-600">{formatNumber(estimatedRewards)} miSOL</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleStake} className="w-full bg-green-600 hover:bg-green-700">
                  Stake SOL
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Staking Overview</CardTitle>
                <CardDescription className="text-gray-400">Platform statistics and your potential earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">APY History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-300"><TrendingUp className="mr-2" /> Current APY:</span>
                        <span className="font-bold text-green-400">{currentApy}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-300"><Lock className="mr-2" /> Total Value Locked:</span>
                        <span className="font-bold">{formatNumber(totalValueLocked)} SOL</span>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Risk Level</Label>
                        <div className="flex space-x-2">
                          {['low', 'medium', 'high'].map((level) => (
                            <Button
                              key={level}
                              variant={riskLevel === level ? "default" : "outline"}
                              onClick={() => setRiskLevel(level)}
                              className="flex-1"
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {riskLevel !== 'low' && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <AlertTriangle size={16} />
                          <span className="text-sm">Higher risk levels may offer better rewards but come with increased volatility.</span>
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
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                          <Line type="monotone" dataKey="apy" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Leaf className="mr-2" /> Eco-Friendly
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Support sustainable projects by staking SOL and geting miSOL.
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

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">Learn More</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">Discover how MIDO Finance is revolutionizing eco-friendly investments through blockchain technology.</p>
              <Button variant="outline" className="w-full">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Explore MIDO Ecosystem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </WalletContextProvider>
  )
}

export default StakingPage