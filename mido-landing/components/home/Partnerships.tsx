import React from 'react'
import { motion } from 'framer-motion'

const PartnershipsSection = () => {
  const partners = [
    "GreenTech Co.", "EcoInvest", "SustainableFuture", "CleanEnergy Inc.",
    "BioInnovate", "EarthFirst Capital", "RenewableSolutions", "GreenGrowth Fund"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#00d4ff] to-[#00ffc8]">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-['Montserrat Alternates']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Visionary Partners
        </motion.h2>
        <motion.div
          className="flex overflow-x-hidden"
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 mx-8 w-48 h-24 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
              whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              <span className="text-lg font-semibold font-['Montserrat Alternates']">{partner}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PartnershipsSection