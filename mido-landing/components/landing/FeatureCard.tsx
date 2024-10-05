// FeatureCard.tsx
import React from 'react'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 border border-gray-700 transition-all duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 mr-4">
        <Icon width={24} height={24} className="text-white" />
      </div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
  </motion.div>
)

export default FeatureCard
