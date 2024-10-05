/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Leaf, Zap, ArrowRight, Shield, ChevronRight, DollarSign, Repeat, List, Handshake } from 'lucide-react';
import Image from 'next/image';
import roadmap from "../../components/images/roadmap-removebg-preview.png";
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

interface InteractiveCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, description, icon: Icon }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);

    return (
        <motion.div
            style={{ x, y, rotateX, rotateY, z: 100 }}
            drag
            dragElastic={0.16}
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            whileTap={{ cursor: 'grabbing' }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-500/20 cursor-grab"
        >
            <Icon className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-300">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </motion.div>
    );
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
        className={`flex items-center mb-8 ${index % 2 !== 0 ? 'flex-row-reverse' : ''
            }`}
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true, amount: 0.8 }}
    >
        <div
            className={`w-full md:w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'
                }`}
        >
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
                        MIDO Finance is a liquid staking platform where users receive miSOL (wrapped SOL) equivalent to their staked SOL. The staked SOL is invested in climate projects, and users are incentivized with points and $MIDO tokens based on their staked amounts and the performance of climate projects.
                    </p>
                </Section>

                <Section title="What is Regenerative Finance (ReFi)?">
                    <p className="text-gray-300 mb-4">
                        ReFi is an alternative financial system aimed at improving social, environmental, and financial stability. It's a movement that seeks to mitigate climate change and improve equality using blockchain and DeFi to help reverse the effects of industrialization and systemic financial imbalance.
                    </p>
                </Section>

                <Section title="MIDO LIQUID STAKE">
                    <p className="text-gray-300 mb-6">
                        Mido Stake allows users to stake Solana, earn staking yield in Mido points, and receive 1:1 wrapped SOL in return. The Mido points act as loyalty points used to incentivize users with native $MIDO Token airdrops.
                    </p>
                    {/* <div className="bg-gray-700 p-4 rounded-lg mb-6">
                        <Image
                            src={roadmap}
                            alt="MIDO Liquid Stake Diagram"
                            className="w-full h-auto rounded-lg"
                        />
                    </div> */}
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>Users get incentivized with $MIDO tokens while passively investing in Green projects.</li>
                        <li>Receive an equivalent amount of miSOL (green SOL) directly into your wallet.</li>
                        <li>Use miSOL within the Solana ecosystem and unwrap it any time.</li>
                    </ul>
                </Section>
                <Section title="Key Features">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InteractiveCard
                            title="Investment Flexibility"
                            description="Manage investments and maintain self-custody to retain SOL at any time."
                            icon={Leaf}
                        />
                        <InteractiveCard
                            title="Passive Income"
                            description="Earn by staking MIDO tokens and participating in liquidity pools."
                            icon={Zap}
                        />
                        <InteractiveCard
                            title="Exit Options"
                            description="Burn or swap $MIDO tokens for other tokens on our platform."
                            icon={ArrowRight}
                        />
                        <InteractiveCard
                            title="User Protection"
                            description="Best DeFi UX ensuring user safety and ease of use."
                            icon={Shield}
                        />
                    </div>
                </Section>

                <Section title="GREEN INDEX">
                    <p className="text-gray-300 mb-4">
                        MIDO Finance introduces GREEN INDEX, a standardized impact measurement framework for all projects. It comprises components such as DeFi, NFT, green bonds, RWA, solar plants, MNCs, cash crops based companies, IPOs, wind energy sector, EV sector, and flat coins in a fixed pivot ratio.
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>Clearly Defined Metrics: Establishing specific metrics for various types of projects</li>
                        <li>Analytics: Implementing quarterly updates to keep users informed about project progress and impact</li>
                    </ul>
                </Section>

                <Section title="Revenue Generation Model">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InteractiveCard
                            title="Transaction Fees"
                            description="A small fee charged on platform transactions to support operations."
                            icon={DollarSign}
                        />
                        <InteractiveCard
                            title="Swap Fees"
                            description="Fees incurred when users swap $MIDO tokens for other tokens."
                            icon={Repeat}
                        />
                        <InteractiveCard
                            title="Project Listing Fees"
                            description="Fees for projects seeking to be listed on the platform."
                            icon={List}
                        />
                        <InteractiveCard
                            title="Partnerships Revenue"
                            description="Generated from product integrations and collaborations."
                            icon={Handshake}
                        />
                    </div>
                </Section>

                <Section title="MIDO Roadmap">
                    <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-400" />
                        <RoadmapItem
                            title="Platform Launch"
                            description="Initial release of MIDO Finance platform, including liquid staking and miSOL generation."
                            index={0}
                        />
                        <RoadmapItem
                            title="Token Launch"
                            description="MIDO token public sale and listings on major cryptocurrency exchanges."
                            index={1}
                        />
                        <RoadmapItem
                            title="Green Index Expansion"
                            description="Integration of new sustainable projects and expansion of the GREEN INDEX framework."
                            index={2}
                        />
                        <RoadmapItem
                            title="Global Partnerships"
                            description="Collaborations with major green tech companies and environmental organizations."
                            index={3}
                        />
                        <RoadmapItem
                            title="DAO Governance"
                            description="Full decentralization of platform decisions through the implementation of DAO governance."
                            index={4}
                        />
                    </div>
                </Section>
            </main>

            <footer className="bg-gray-900 py-8 border-t border-green-500/30">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">&copy; 2024 MIDO Finance. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default MIDOFinanceWhitepaper;