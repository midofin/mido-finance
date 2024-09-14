import React from 'react';
import { ChevronDown, DollarSign, BarChart2, Percent } from 'lucide-react';
import MotionSection from './framer/MotionSection';
import { MotionWrapperDiv, MotionWrapperH2, MotionWrapperP } from './framer/MotionWrapper';

const LandingPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const GradientButton = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button className={`bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-2 rounded-full transition-all duration-300 ${className}`}>
      {children}
    </button>
  );

  const AnimatedBorderButton = ({ children }: { children: React.ReactNode }) => (
    <div className="relative inline-block">
      <MotionWrapperDiv
        className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <button className="relative bg-black text-white px-8 py-3 rounded-full z-10 m-0.5">
        {children}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Mido Finance</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-green-300 transition-colors">Home</a>
            <a href="#" className="hover:text-green-300 transition-colors">About</a>
            <a href="#" className="hover:text-green-300 transition-colors">Docs</a>
            <a href="#" className="hover:text-green-300 transition-colors">Airdrop</a>
          </nav>
          <GradientButton>Launch App</GradientButton>
        </div>
      </header>

      <section className="min-h-screen flex items-center justify-center text-center px-4">
        <MotionWrapperDiv
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Regenerative Finance on Solana</h1>
          <p className="text-xl md:text-2xl mb-10">Empowering sustainable growth through blockchain technology</p>
          <GradientButton className="text-lg px-8 py-3">Get Started</GradientButton>
        </MotionWrapperDiv>
      </section>

      <MotionSection className="py-20 px-4">
        <div className="container mx-auto">
          <MotionWrapperH2
            className="text-4xl font-bold mb-12 text-center"
            variants={fadeInUp}
            transition={{ duration: 2 }}
          >
            Key Features
          </MotionWrapperH2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Sustainable Yield', 'Carbon Offsetting', 'Community Governance'].map((feature, index) => (
              <MotionWrapperDiv
                key={index}
                className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-6"
                variants={fadeInUp}
              >
                <h3 className="text-2xl font-semibold mb-4">{feature}</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et.</p>
              </MotionWrapperDiv>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="py-20 px-4 bg-white bg-opacity-10">
        <div className="container mx-auto">
          <MotionWrapperH2
            className="text-4xl font-bold mb-12 text-center"
            variants={fadeInUp}
          >
            Investing in private markets, made easy
          </MotionWrapperH2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Invest', icon: DollarSign, description: 'Choose from a curated selection of private market opportunities.' },
              { title: 'Track', icon: BarChart2, description: 'Monitor your investments with real-time updates and analytics.' },
              { title: 'Earn', icon: Percent, description: 'Benefit from potential returns and sustainable growth.' }
            ].map((step, index) => (
              <MotionWrapperDiv
                key={index}
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 mb-4">
                  <step.icon size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p>{step.description}</p>
              </MotionWrapperDiv>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="py-20 px-4 bg-white bg-opacity-10">
        <div className="container mx-auto text-center">
          <MotionWrapperH2 className="text-4xl font-bold mb-6" variants={fadeInUp}>Ready to make a difference?</MotionWrapperH2>
          <MotionWrapperP className="text-xl mb-10" variants={fadeInUp}>Join our community and start your regenerative finance journey today.</MotionWrapperP>
          <MotionWrapperDiv variants={fadeInUp}>
            <AnimatedBorderButton>Join Now</AnimatedBorderButton>
          </MotionWrapperDiv>
        </div>
      </MotionSection>

      <footer className="bg-white bg-opacity-10 py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Mido Finance. All rights reserved.</p>
        </div>
      </footer>

      <MotionWrapperDiv
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown size={32} />
      </MotionWrapperDiv>
    </div>
  );
};

export default LandingPage;