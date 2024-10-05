import React from 'react'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Linkedin, Github } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FooterSection = () => {
  return (
    <footer className="bg-gradient-to-br from-[#5e2bff] to-[#00d4ff] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-['Montserrat Alternates']">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#ff5edb] transition-colors font-['Lato']">Home</a></li>
              <li><a href="#" className="hover:text-[#ff5edb] transition-colors font-['Lato']">About</a></li>
              <li><a href="#" className="hover:text-[#ff5edb] transition-colors font-['Lato']">Governance</a></li>
              <li><a href="#" className="hover:text-[#ff5edb] transition-colors font-['Lato']">Green Index</a></li>
              <li><a href="#" className="hover:text-[#ff5edb] transition-colors font-['Lato']">NFTs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 font-['Montserrat Alternates']">Stay Updated</h3>
            <p className="mb-4 font-['Lato']">Subscribe to our newsletter for the latest updates and green investment opportunities.</p>
            <form className="flex space-x-2">
              <Input type="email" placeholder="Your email" className="flex-grow bg-white bg-opacity-10 border-none text-white placeholder-gray-300" />
              <Button type="submit" className="bg-[#ff5edb] hover:bg-[#ff5edb]/80 text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white border-opacity-20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300 mb-4 md:mb-0 font-['Lato']">
            © 2024 MIDO Finance. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {[Facebook, Twitter, Linkedin, Github].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.2, color: "#ff5edb" }}
                className="text-white hover:text-[#ff5edb] transition-colors"
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection