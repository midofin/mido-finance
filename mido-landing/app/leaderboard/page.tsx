/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '@/app/actions/leaderboard'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Search, ChevronLeft, ChevronRight, Zap, Trophy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/navbar'

interface User {
    id: number
    walletAddress: string
    points: number
}

export default function Leaderboard() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const { toast } = useToast()

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true)
            try {
                const data: User[] = await getLeaderboard(currentPage, pageSize)
                setUsers(data)
            } catch (error: any) {
                console.error("Error fetching leaderboard:", error)
                toast({
                    title: "Error",
                    description: "Failed to load leaderboard.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [currentPage, pageSize, toast])

    const filteredUsers = users.filter(user =>
        user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const truncateWalletAddress = (address: string, chars: number = 4): string => {
        return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
    }

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Badge className="bg-yellow-500 animate-pulse">1st</Badge>
        if (rank === 2) return <Badge className="bg-gray-400">2nd</Badge>
        if (rank === 3) return <Badge className="bg-amber-600">3rd</Badge>
        return <Badge variant="outline">{rank}th</Badge>
    }

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-[#0a0b1e] text-[#00ff00] p-4 font-mono">
                <div className="max-w-6xl mx-auto space-y-8 pt-20">
                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#3b683b] to-[#00ffff] py-4"
                    >
                        Leaderboard
                    </motion.h1>

                    <Card className="bg-[#1a1b3e] border-[#317431] border-2 shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#00ffff] flex items-center">
                                <Trophy className="mr-2" /> Top Stakers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                                <div className="relative w-full sm:w-1/2">
                                    <Input
                                        placeholder="Search by wallet address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-[#2a2b4e] text-[#00ff00] border-[#00ffff] focus:border-[#00ff00]"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00ffff]" size={18} />
                                </div>
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(value: any) => setPageSize(Number(value))}
                                >
                                    <SelectTrigger className="w-[180px] bg-[#2a2b4e] text-[#00ff00] border-[#00ffff]">
                                        <SelectValue placeholder="Rows per page" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a2b4e] border-[#00ffff]">
                                        <SelectItem value="10">10 per page</SelectItem>
                                        <SelectItem value="20">20 per page</SelectItem>
                                        <SelectItem value="50">50 per page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <Skeleton className="h-12 w-12 rounded-full bg-[#2a2b4e]" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px] bg-[#2a2b4e]" />
                                                <Skeleton className="h-4 w-[200px] bg-[#2a2b4e]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px] text-[#00ffff]">Rank</TableHead>
                                            <TableHead className="text-[#00ffff]">Wallet Address</TableHead>
                                            <TableHead className="text-[#00ffff]">Points</TableHead>
                                            <TableHead className="text-right text-[#00ffff]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user, index) => (
                                                    <motion.tr
                                                        key={user.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                                        className="hover:bg-[#2a2b4e] transition-colors duration-200"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {getRankBadge((currentPage - 1) * pageSize + index + 1)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-[#00ffff]">
                                                                {truncateWalletAddress(user.walletAddress)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-bold text-[#00ff00] flex items-center">
                                                                <Zap className="mr-1" size={16} />
                                                                {user.points.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-[#1c8f8f] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#1a1b3e] transition-colors duration-200"
                                                                onClick={() => {
                                                                    toast({
                                                                        title: "Accessing Cyberspace",
                                                                        description: "Profile view is being decrypted...",
                                                                    })
                                                                }}
                                                            >
                                                                <span>View Profile</span>
                                                                <ArrowUpRight className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-4 text-[#00ffff]">
                                                        No cyber stakers found in this sector.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            )}

                            <div className="flex justify-between items-center mt-6">
                                <p className="text-sm text-[#00ffff]">
                                    Displaying {filteredUsers.length} of {users.length} cyber stakers
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1 || loading}
                                        className="text-[#00ffff] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#1a1b3e]"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-[#00ffff]">
                                        Sector {currentPage}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={filteredUsers.length < pageSize || loading}
                                        className="text-[#00ffff] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#1a1b3e]"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}