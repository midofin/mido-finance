import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Coins, Users, Leaf } from 'lucide-react'

const BenefitsSection = () => {
  const benefits = [
    { icon: Shield, title: "Self-custody", description: "Maintain control of your assets with our secure self-custody solution." },
    { icon: Coins, title: "Earn MIDO Tokens", description: "Stake and earn MIDO tokens as additional rewards." },
    { icon: Users, title: "DAO Governance", description: "Participate in decision-making through our decentralized autonomous organization." },
    { icon: Leaf, title: "Green Investments", description: "Support and invest in sustainable projects worldwide." },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#5e2bff] to-[#00d4ff]">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-['Montserrat Alternates']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose MIDO Finance?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              <benefit.icon className="h-12 w-12 text-[#ff5edb] mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-['Montserrat Alternates']">{benefit.title}</h3>
              <p className="text-gray-200 font-['Lato']">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection