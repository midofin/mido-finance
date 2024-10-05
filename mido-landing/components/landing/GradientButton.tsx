// GradientButton.tsx
import React from 'react'
import { motion } from 'framer-motion'

interface GradientButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, className, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.button>
)

export default GradientButton
