import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CreditCard, Users, Globe } from 'lucide-react'

const HowItWorksSection = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  const steps = [
    { icon: CreditCard, title: "Stake SOL", description: "Transform your SOL into miSOL tokens at a 1:1 ratio." },
    { icon: Users, title: "Join the DAO", description: "Participate in governance and shape the future of green investments." },
    { icon: Globe, title: "Grow Sustainably", description: "Invest in ESG-aligned partnerships and contribute to a greener blockchain." },
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-[#5e2bff] to-[#00d4ff]">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center font-['Montserrat Alternates']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Journey to Sustainable Finance
        </motion.h2>
        <motion.div
          className="relative"
          style={{ y }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-center mb-16"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                <h3 className="text-2xl font-semibold mb-2 font-['Montserrat Alternates']">{step.title}</h3>
                <p className="text-gray-200 font-['Lato']">{step.description}</p>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <step.icon className="h-8 w-8 text-[#5e2bff]" />
              </div>
              <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8 text-right'}`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection