import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

const NFTSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#5e2bff] to-[#00d4ff] relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundImage: [
            'linear-gradient(45deg, #5e2bff, #00d4ff)',
            'linear-gradient(45deg, #00d4ff, #00ffc8)',
            'linear-gradient(45deg, #00ffc8, #5e2bff)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-['Montserrat Alternates']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          404 Hybrid NFTs – Where Art Meets Utility
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 180 }}
            >
              <div className="aspect-square bg-gradient-to-br from-[#ff5edb] to-[#00ffc8] rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-['Montserrat Alternates']">Hybrid NFT #{index + 1}</h3>
              <p className="text-gray-200 font-['Lato']">A unique blend of digital art and real-world utility.</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-[#ff5edb] hover:bg-[#ff5edb]/80 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          >
            Discover Our NFTs
          </Button>
        </div>
      </div>
    </section>
  )
}

export default NFTSection