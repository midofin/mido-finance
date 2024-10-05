import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, LineChart, PieChart } from 'lucide-react'

const DashboardSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#00d4ff] to-[#00ffc8]">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-['Montserrat Alternates']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Track Your Impact in Real-Time
        </motion.h2>
        <motion.div
          className="bg-white bg-opacity-10 p-8 rounded-lg shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="space-y-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-xl font-semibold font-['Montserrat Alternates']">Portfolio Performance</h3>
              <LineChart className="h-40 w-full text-[#ff5edb]" />
            </motion.div>
            <motion.div
              className="space-y-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-xl font-semibold font-['Montserrat Alternates']">Asset Allocation</h3>
              <PieChart className="h-40 w-full text-[#00ffc8]" />
            </motion.div>
            <motion.div
              className="space-y-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-xl font-semibold font-['Montserrat Alternates']">Environmental Impact</h3>
              <BarChart className="h-40 w-full text-[#5e2bff]" />
            </motion.div>
          </div>
          <motion.p
            className="mt-8 text-center text-gray-200 font-['Lato']"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Get real-time insights into your investments and their positive impact on the environment.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default DashboardSection