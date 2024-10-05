import React from 'react'
import { motion } from 'framer-motion'

const RoadmapSection: React.FC = () => {
  const milestones = [
    { title: "Platform Launch", description: "Initial release of MIDO Finance platform" },
    { title: "Token Launch", description: "MIDO token public sale and exchange listings" },
    { title: "Green Index Expansion", description: "Integration of new sustainable projects" },
    { title: "Global Partnerships", description: "Collaborations with major green tech companies" },
    { title: "DAO Governance", description: "Full decentralization of platform decisions" },
  ]

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-montserrat text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Path to Sustainable Success
        </motion.h2> */}
        <div className="relative">
          {/* Central Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-400" />

          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              className={`flex items-center mb-8 ${
                index % 2 !== 0 ? 'flex-row-reverse' : ''
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.8 }}
            >
              {/* Milestone Content */}
              <div
                className={`w-full md:w-5/12 ${
                  index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'
                }`}
              >
                <h3 className="text-xl font-semibold mb-2 font-montserrat">{milestone.title}</h3>
                <p className="text-gray-200 font-lato">{milestone.description}</p>
              </div>

              {/* Timeline Dot */}
              <div className="w-full md:w-2/12 flex justify-center">
                <div className="w-4 h-4 bg-green-400 rounded-full z-10" />
              </div>

              {/* Spacer for Alternate Alignment */}
              <div className="w-full md:w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RoadmapSection
