import React from 'react'
import { motion } from 'framer-motion'

const RoadmapSection = () => {
  const milestones = [
    { title: "Platform Launch", description: "Initial release of MIDO Finance platform" },
    { title: "Token Launch", description: "MIDO token public sale and exchange listings" },
    { title: "Green Index Expansion", description: "Integration of new sustainable projects" },
    { title: "Global Partnerships", description: "Collaborations with major green tech companies" },
    { title: "DAO Governance", description: "Full decentralization of platform decisions" },
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
          Our Path to Sustainable Success
        </motion.h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#ff5edb]" />
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              className={`flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <h3 className="text-xl font-semibold mb-2 font-['Montserrat Alternates']">{milestone.title}</h3>
                <p className="text-gray-200 font-['Lato']">{milestone.description}</p>
              </div>
              <div className="w-2/12 flex justify-center">
                <div className="w-4 h-4 bg-[#ff5edb] rounded-full" />
              </div>
              <div className="w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RoadmapSection