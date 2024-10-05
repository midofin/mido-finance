/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Leaf, Zap, ArrowRight, Shield, DollarSign, Repeat, List, Handshake } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={staggerChildren}
    className="mb-16"
  >
    <motion.h2
      variants={fadeInUp}
      className="text-3xl font-bold mb-6 text-green-400 border-b-2 border-green-500/30 pb-2"
    >
      {title}
    </motion.h2>
    {children}
  </motion.section>
);

interface RoadmapItemProps {
  title: string;
  description: string;
  index: number;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ title, description, index }) => (
  <motion.div
    className={`flex items-center mb-8 ${index % 2 !== 0 ? "flex-row-reverse" : ""}`}
    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, amount: 0.8 }}
  >
    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
      <h3 className="text-xl font-semibold mb-2 font-montserrat text-green-300">{title}</h3>
      <p className="text-gray-200 font-lato">{description}</p>
    </div>
    <div className="w-full md:w-2/12 flex justify-center">
      <div className="w-4 h-4 bg-green-400 rounded-full z-10" />
    </div>
    <div className="w-full md:w-5/12" />
  </motion.div>
);

const MIDOFinanceWhitepaper = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="bg-gray-900 py-8 border-b border-green-500/30">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-green-400 text-center">MIDO Finance Whitepaper</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <Section title="Introduction">
          <p className="text-lg text-gray-300 mb-6">
            MIDO Finance is a liquid staking platform where users receive miSOL (wrapped SOL)
            equivalent to their staked SOL. The staked SOL is invested in climate projects, and users
            are incentivized with points and $MIDO tokens based on their staked amounts and the
            performance of climate projects.
          </p>
        </Section>

        <Section title="What is Regenerative Finance (ReFi)?">
          <p className="text-gray-300 mb-4">
            ReFi is an alternative financial system aimed at improving social, environmental, and
            financial stability. It's a movement that seeks to mitigate climate change and improve
            equality using blockchain and DeFi to help reverse the effects of industrialization and
            systemic financial imbalance.
          </p>
        </Section>

        <Section title="MIDO LIQUID STAKE">
          <p className="text-gray-300 mb-6">
            Mido Stake allows users to stake Solana, earn staking yield in Mido points, and receive
            1:1 wrapped SOL in return. The Mido points act as loyalty points used to incentivize
            users with native $MIDO Token airdrops.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Users get incentivized with $MIDO tokens while passively investing in Green projects.</li>
            <li>Receive an equivalent amount of miSOL (green SOL) directly into your wallet.</li>
            <li>Use miSOL within the Solana ecosystem and unwrap it any time.</li>
          </ul>
        </Section>

        <Section title="Key Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <Leaf className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">Investment Flexibility</h3>
              <p className="text-gray-400">
                Manage investments and maintain self-custody to retain SOL at any time.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <Zap className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">Passive Income</h3>
              <p className="text-gray-400">
                Earn by staking MIDO tokens and participating in liquidity pools.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <ArrowRight className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">Exit Options</h3>
              <p className="text-gray-400">
                Burn or swap $MIDO tokens for other tokens on our platform.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <Shield className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">User Protection</h3>
              <p className="text-gray-400">Best DeFi UX ensuring user safety and ease of use.</p>
            </div>
          </div>
        </Section>

        <Section title="GREEN INDEX">
          <p className="text-gray-300 mb-4">
            MIDO Finance introduces GREEN INDEX, a standardized impact measurement framework for
            all projects. It comprises components such as DeFi, NFT, green bonds, RWA, solar plants,
            MNCs, cash crops based companies, IPOs, wind energy sector, EV sector, and flat coins
            in a fixed pivot ratio.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Clearly Defined Metrics: Establishing specific metrics for various types of projects</li>
            <li>Analytics: Implementing quarterly updates to keep users informed about project progress and impact</li>
          </ul>
        </Section>

        <Section title="Revenue Generation Model">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <DollarSign className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">Transaction Fees</h3>
              <p className="text-gray-400">A small fee charged on platform transactions to support operations.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20">
              <Repeat className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-300">Token Swap Revenue</h3>
              <p className="text-gray-400">Revenue generated from token swaps on the platform.</p>
            </div>
          </div>
        </Section>

        <Section title="Governance">
          <p className="text-gray-300 mb-4">
            Users holding $MIDO tokens have governance rights. These rights allow them to vote on
            project proposals, updates to the platform, and strategic decisions that impact MIDO Finance.
          </p>
        </Section>

        <Section title="Roadmap">
          <div className="relative">
            <div className="border-l-4 border-green-400 absolute h-full left-1/2 transform -translate-x-1/2" />
            <RoadmapItem
              title="Q1 2024: Launch MIDO Staking"
              description="Launch of MIDO staking platform with initial SOL staking options."
              index={0}
            />
            <RoadmapItem
              title="Q2 2024: Integration with Solar Energy Projects"
              description="Partner with solar energy projects for staking rewards in green bonds."
              index={1}
            />
            <RoadmapItem
              title="Q3 2024: Introduction of $MIDO Tokens"
              description="Launch of $MIDO tokens and integration into governance and rewards."
              index={2}
            />
            <RoadmapItem
              title="Q4 2024: Expansion of Green Project Partnerships"
              description="Partnerships with additional green energy projects and renewable initiatives."
              index={3}
            />
          </div>
        </Section>

        <Section title="Original Whitepaper">
          <p className="text-lg text-gray-300 mb-4">
            You can access the original whitepaper for MIDO Finance by clicking the link below:
          </p>
          <a
            href="https://docs.google.com/document/d/1D_VruhND5t1VXzYIjlNbsKow-UjYxE6YnZitZREI6z8/edit#heading=h.frs2ld495vzz"
            className="text-green-400 underline hover:text-green-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Original Whitepaper
          </a>
        </Section>

      </main>

      <footer className="bg-gray-900 py-8 border-t border-green-500/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">© 2024 MIDO Finance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MIDOFinanceWhitepaper;
