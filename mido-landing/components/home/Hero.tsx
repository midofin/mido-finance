import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          backgroundImage: [
            'linear-gradient(45deg, #5e2bff, #00d4ff)',
            'linear-gradient(45deg, #00d4ff, #00ffc8)',
            'linear-gradient(45deg, #00ffc8, #5e2bff)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Elevate Your Staking Experience with MIDO Finance
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Stake SOL, earn creamy rewards, and invest in a sustainable future.
        </motion.p>
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#5e2bff] to-[#00ffc8] hover:from-[#00d4ff] hover:to-[#5e2bff] text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection