'use client'

import React, { useState} from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, DollarSign, BarChart2, Percent, Menu, X, ArrowRight, Sparkles, Shield, Globe } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

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

  const GradientButton = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );

  const AnimatedBorderButton = ({ children }: { children: React.ReactNode }) => (
    <div className="relative inline-block group">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-gray-900 text-white px-8 py-3 rounded-full z-10 m-0.5 transition-all duration-300 hover:bg-gray-800 flex items-center space-x-2"
      >
        <span>{children}</span>
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );

  const FeatureCard = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <motion.div
      variants={fadeInUp}
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 border border-purple-700 hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-500 rounded-full p-3 mr-4">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-semibold text-purple-400">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );

  const BackgroundDots = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 3px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
    </div>
  );

  const FloatingElements = () => {
    const elements = [
      { icon: Sparkles, delay: 0 },
      { icon: Shield, delay: 1.5 },
      { icon: Globe, delay: 3 },
    ];

    return (
      <>
        {elements.map((el, index) => (
          <motion.div
            key={index}
            className="absolute text-purple-300 opacity-20"
            style={{
              top: `${20 + index * 30}%`,
              left: `${10 + index * 25}%`,
              fontSize: `${3 + index}rem`,
            }}
            animate={{
              y: ["0%", "20%", "0%"],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 5,
              delay: el.delay,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <el.icon size={24 + index * 8} />
          </motion.div>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      <BackgroundDots />
      <FloatingElements />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900 to-indigo-900 opacity-30 z-10"
        style={{ y: backgroundY }}
      />

      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-b border-purple-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text"
          >
            Mido Finance
          </motion.div>
          <nav className="hidden md:flex space-x-6">
            {['Home', 'About', 'Docs', 'Airdrop'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="hover:text-purple-400 transition-colors relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item}
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </motion.a>
            ))}
          </nav>
          <div className="hidden md:block">
            <GradientButton>Launch App</GradientButton>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-64 bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg z-50 p-4"
          >
            <div className="flex flex-col space-y-4">
              {['Home', 'About', 'Docs', 'Airdrop'].map((item) => (
                <a key={item} href="#" className="text-lg hover:text-purple-400 transition-colors">{item}</a>
              ))}
              <GradientButton className="mt-4">Launch App</GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="min-h-screen flex items-center justify-center text-center px-4 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="max-w-4xl"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text"
          >
            Regenerative Finance on Solana
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl mb-10 text-gray-300"
          >
            Empowering sustainable growth through blockchain technology
          </motion.p>
          <motion.div variants={fadeInUp}>
            <GradientButton className="text-lg px-8 py-3">Get Started</GradientButton>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        className="py-20 px-4 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerChildren}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-purple-500 text-transparent bg-clip-text"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Sustainable Yield"
              description="Generate consistent returns while supporting eco-friendly projects."
              icon={DollarSign}
            />
            <FeatureCard
              title="Carbon Offsetting"
              description="Automatically offset your carbon footprint with each transaction."
              icon={BarChart2}
            />
            <FeatureCard
              title="Community Governance"
              description="Participate in decision-making for the future of sustainable finance."
              icon={Percent}
            />
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 px-4 bg-purple-900 bg-opacity-30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerChildren}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-purple-500 text-transparent bg-clip-text"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Connect', icon: DollarSign, description: 'Link your wallet and explore sustainable investment opportunities.' },
              { title: 'Invest', icon: BarChart2, description: 'Choose from a curated selection of eco-friendly projects and allocate your funds.' },
              { title: 'Earn & Impact', icon: Percent, description: 'Generate returns while making a positive environmental impact.' }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-full p-4 mb-4">
                  <step.icon size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-purple-400">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerChildren}
      >
        <div className="container mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-500 text-transparent bg-clip-text"
          >
            Ready to make a difference?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl mb-10 text-gray-300"
          >
            Join our community and start your regenerative finance journey today.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <AnimatedBorderButton>Join Now</AnimatedBorderButton>
          </motion.div>
        </div>
      </motion.section>

      <footer className="bg-gray-900 bg-opacity-50 py-8 px-4 border-t border-purple-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 Mido Finance. All rights reserved.</p>
        </div>
      </footer>

      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-purple-400 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronDown size={32} />
      </motion.div>
    </div>
  );
};

export default LandingPage;