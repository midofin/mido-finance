/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Navbar.tsx

"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Twitter,
  Github,
  Linkedin,
  Menu,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import GradientButton from './landing/GradientButton'
import Link from 'next/link'

interface NavLink {
  name: string
  href: string
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'User', href: '/user' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'NFTs', href: '#nfts' },
  { name: 'Roadmap', href: '#roadmap' },
]

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleLaunchApp = () => {
    router.push('/stake')
    setIsMenuOpen(false) // Close menu after navigation
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
        >
          MIDO Finance
        </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              className="hover:text-green-400 transition-colors relative group"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {link.name}
              <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </motion.a>
          ))}
        </nav>

        {/* Launch App Button - Desktop */}
        <div className="hidden md:block">
          <GradientButton onClick={handleLaunchApp}>Launch App</GradientButton>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="text-gray-400 hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg z-50 p-4"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg hover:text-green-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)} // Close menu on link click
                >
                  {link.name}
                </a>
              ))}
              <GradientButton className="mt-4" onClick={handleLaunchApp}>Launch App</GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
