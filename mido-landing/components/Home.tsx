/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import GradientButton from './landing/GradientButton'
import FeatureCard from './landing/FeatureCard'
import RoadmapSection from './landing/Roadmap'
import {
  ChevronDown,
  Twitter,
  Github,
  Linkedin,
  DollarSign,
  BarChart2,
  Shield,
  Users,
  Leaf
} from 'lucide-react'
import Navbar from './navbar'

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden relative font-sans">
      <div className="relative z-20">
        <Navbar />

        <section id="home" className="min-h-screen flex items-center justify-center text-center px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="max-w-4xl"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
            >
              Supercharge Your SOL Staking with MIDO Finance
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-10 text-gray-300"
            >
              Earn creamy rewards and invest in a sustainable future with our ReFi platform.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <GradientButton className="text-lg px-12 py-4" onClick={() => {}}>Stake Now</GradientButton>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          id="about"
          className="py-20 px-4 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto">
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
            >
              Effortless Staking, Maximum Rewards
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Stake SOL"
                description="Easily stake your SOL tokens and start earning rewards immediately."
                icon={DollarSign}
              />
              <FeatureCard
                title="Earn miSOL"
                description="Receive miSOL tokens representing your staked SOL, unlocking new DeFi opportunities."
                icon={BarChart2}
              />
              <FeatureCard
                title="Green Investments"
                description="Your staked assets contribute to sustainable projects and green initiatives."
                icon={Leaf}
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          id="stake"
          className="py-20 px-4 bg-gray-800 bg-opacity-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto">
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
            >
              Why MIDO Finance?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Self-Custody"
                description="Maintain full control of your assets with our non-custodial staking solution."
                icon={Shield}
              />
              <FeatureCard
                title="DAO Governance"
                description="Participate in key decisions and shape the future of MIDO Finance."
                icon={Users}
              />
              <FeatureCard
                title="Green Index"
                description="Invest in a curated index of sustainable and eco-friendly projects."
                icon={Leaf}
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          id="nfts"
          className="py-20 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto text-center">
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
            >
              404 Hybrid NFTs – Art Meets Utility
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl mb-10 text-gray-300"
            >
              Explore our unique collection of NFTs that blend stunning visuals with real-world utility.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <GradientButton className="" onClick={() => {}}>Explore the Collection</GradientButton>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="roadmap"
          className="py-20 px-4 bg-gray-800 bg-opacity-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto">
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text"
            >
              Our Path to Sustainable Success
            </motion.h2>
            <RoadmapSection />
          </div>
        </motion.section>

        <footer className="bg-gray-900 py-12 px-4 border-t border-gray-800">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">MIDO Finance</h3>
              <p className="text-gray-400">Empowering sustainable finance on Solana</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <div>
                <h4 className="font-semibold mb-2">Quick Links</h4>
                <ul className="space-y-2">
                  {['Home', 'About', 'Stake', 'NFTs', 'Roadmap'].map((item) => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-green-400 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    <Twitter size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    <Github size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    <Linkedin size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500">
            <p>&copy; 2023 MIDO Finance. All rights reserved.</p>
          </div>
        </footer>

        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-green-400 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => {
            const aboutSection = document.getElementById('about')
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          <ChevronDown size={32} />
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage