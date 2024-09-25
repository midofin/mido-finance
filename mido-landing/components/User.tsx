"use client"

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingUp, Lock, ArrowUpRight, ArrowDownRight, Clock, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dynamic from 'next/dynamic'

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

// Mock data
const stakingHistory = [
  { date: '2023-01-01', amount: 100 },
  { date: '2023-02-01', amount: 150 },
  { date: '2023-03-01', amount: 200 },
  { date: '2023-04-01', amount: 180 },
  { date: '2023-05-01', amount: 250 },
  { date: '2023-06-01', amount: 300 },
]

const UserProfile: React.FC = () => {
  const { publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock user data
  const userData = {
    username: 'EcoInvestor',
    avatar: '/placeholder.svg',
    totalStaked: 1000,
    totalRewards: 50,
    carbonOffset: 2.5,
    stakingLevel: 'Gold',
    nextLevelProgress: 75,
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const StakingCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: React.ElementType, trend?: 'up' | 'down' }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-green-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend === 'up' ? <ArrowUpRight className="mr-1" /> : <ArrowDownRight className="mr-1" />}
            {trend === 'up' ? '+2.5%' : '-1.5%'}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-400">User Profile</h1>
          <WalletMultiButtonDynamic />
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar} alt={userData.username} />
                <AvatarFallback>{userData.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData.username}</h2>
                <p className="text-gray-400">Wallet: {publicKey ? publicKey.toBase58().slice(0, 8) + '...' : 'Not connected'}</p>
                <Badge className="mt-2 bg-green-600">{userData.stakingLevel} Staker</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StakingCard title="Total Staked" value={`${formatNumber(userData.totalStaked)} MIDO`} icon={Lock} trend="up" />
          <StakingCard title="Total Rewards" value={`${formatNumber(userData.totalRewards)} MIDO`} icon={Award} trend="up" />
          <StakingCard title="Carbon Offset" value={`${userData.carbonOffset} tons`} icon={Leaf} />
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Next Level Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">{userData.nextLevelProgress}%</div>
              <Progress value={userData.nextLevelProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Staking Overview</CardTitle>
                <CardDescription className="text-gray-400">Your staking activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stakingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text">
                    {[
                      { action: 'Staked', amount: '50 MIDO', time: '2 hours ago' },
                      { action: 'Claimed Rewards', amount: '5 MIDO', time: '1 day ago' },
                      { action: 'Unstaked', amount: '20 MIDO', time: '3 days ago' },
                    ].map((activity, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{activity.action} <span className="text-green-400">{activity.amount}</span></span>
                        <span className="text-gray-400 text-sm">{activity.time}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Carbon Offset</span>
                    <span className="text-green-400">{userData.carbonOffset} tons</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trees Planted</span>
                    <span className="text-green-400">50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clean Energy Funded</span>
                    <span className="text-green-400">100 kWh</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="staking" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Active Stakes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    { amount: 500, apy: '6.5%', lockPeriod: '30 days', timeLeft: '20 days' },
                    { amount: 300, apy: '8.0%', lockPeriod: '90 days', timeLeft: '60 days' },
                  ].map((stake, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <div>
                        <p className="font-semibold">{stake.amount} MIDO</p>
                        <p className="text-sm text-gray-400">APY: {stake.apy}</p>
                      </div>
                      <div className="text-right">
                        <p>{stake.lockPeriod}</p>
                        <p className="text-sm text-gray-400">{stake.timeLeft} left</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700">Stake More</Button>
              </CardFooter>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Unstaking Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">Choose an unstaking option:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">Instant Unstake (5% fee)</Button>
                  <Button variant="outline">Wait for Lock Period</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rewards" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Reward Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Rewards Earned</span>
                  <span className="text-green-400">{userData.totalRewards} MIDO</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Rewards</span>
                  <span className="text-yellow-400">2.5 MIDO</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Next Reward Estimation</span>
                  <span className="text-blue-400">0.5 MIDO / day</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700">Claim Rewards</Button>
              </CardFooter>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Reward History</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { amount: 10, date: '2023-06-01', type: 'Staking Reward' },
                    { amount: 5, date: '2023-05-15', type: 'Referral Bonus' },
                    { amount: 8, date: '2023-05-01', type: 'Staking Reward' },
                  ].map((reward, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{reward.amount} MIDO</p>
                        <p className="text-sm text-gray-400">{reward.type}</p>
                      </div>
                      <p className="text-gray-400">{reward.date}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-green-400">Boost Your Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">Increase your staking rewards and environmental impact:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock className="mr-2 text-green-400" />
                <span>Extend your staking period for higher APY</span>
              </li>
              <li className="flex items-center">
                <TrendingUp className="mr-2 text-green-400" />
                <span>Refer friends to earn bonus rewards</span>
              </li>
              <li className="flex items-center">
                <Leaf className="mr-2 text-green-400" />
                <span>Participate in eco-friendly challenges</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <ArrowUpRight className="mr-2 h-4 w-4" /> Explore Opportunities
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default UserProfile