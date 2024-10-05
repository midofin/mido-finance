/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Wind, Zap, Leaf } from 'lucide-react'

const GreenIndexSection = () => {
  const assets = [
    { icon: Sun, name: "Solar Energy", image: "/solar-panel.jpg" },
    { icon: Wind, name: "Wind Power", image: "/wind-turbine.jpg" },
    { icon: Zap, name: "Electric Vehicles", image: "/electric-car.jpg" },
    { icon: Leaf, name: "Sustainable Agriculture", image: "/sustainable-farm.jpg" },
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
          Invest in a Greener Future with MIDO
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assets.map((asset, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <img src={asset.image} alt={asset.name} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <asset.icon className="h-16 w-16 text-white mb-4 mx-auto" />
                  <h3 className="text-2xl font-semibold text-white mb-2 font-['Montserrat Alternates']">{asset.name}</h3>
                  <p className="text-gray-200 font-['Lato']">Invest in sustainable {asset.name.toLowerCase()} projects</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GreenIndexSection