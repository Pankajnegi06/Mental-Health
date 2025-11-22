import React from 'react'
import { motion } from 'framer-motion'
import { GiMeditation, GiFlexibleStar } from 'react-icons/gi'
import { PiChalkboardTeacher } from 'react-icons/pi'
import { TiTick } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'

const BenefitsSection = () => {

  const Navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const phoneVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    }
  }

  const features = [
    {
      icon: GiMeditation,
      title: "Personalized Plans",
      description: "Monthly check-ins create a meditation plan tailored to your life."
    },
    {
      icon: TiTick,
      title: "Progress Tracking",
      description: "See your growth with simple and motivational progress updates."
    },
    {
      icon: PiChalkboardTeacher,
      title: "Expert Guidance",
      description: "Work with certified meditation coaches and expert mentors."
    },
    {
      icon: GiFlexibleStar,
      title: "Flexible Tools",
      description: "Choose from hundreds of tools to support your mindfulness journey."
    }
  ]

  return (
    <section 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center py-16 px-4 overflow-hidden"
      style={{
        backgroundImage: "url('https://cdn.prod.website-files.com/6611724b5b44cc23c5935b60/662d5949c1107cbb3e4461d0_benefits%20bg.webp')"
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto w-full"
      >
        {/* Heading */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight max-w-4xl mx-auto mb-8">
            Do What it actually takes to be{' '}
            <span className="relative">
              happier
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </span>
            .
          </h2>
          
          <motion.button
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={()=>window.open("/meditation","__blank")}
            className="hover:bg-white block mx-auto border border-black hover:text-black px-5 p-3 text-sm rounded-full w-fit h-auto  text-white bg-black font-bold cursor-pointer hover:shadow shadow-gray-500 transition-all duration-300"
          >
            Try for free
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Features */}
          <motion.div 
            variants={itemVariants}
            className="space-y-12 lg:space-y-16"
          >
            {features.slice(0, 2).map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4"
                >
                  <feature.icon className="text-2xl text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Center Phone */}
          <motion.div
            variants={phoneVariants}
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ y: -10, rotateY: 5 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-3xl shadow-2xl">
                <div className="bg-black p-1 rounded-2xl">
                  <img
                    src="https://cdn.prod.website-files.com/6611724b5b44cc23c5935b60/66dea46d9d29f9c2bcfc8b16_66c187e2c4e6e89fe36ad2c5_App.webp"
                    alt="Meditation App Interface"
                    className="w-64 h-auto rounded-2xl"
                  />
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
              />
              
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-6 -left-6 w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg"
              />
            </motion.div>
          </motion.div>

          {/* Right Features */}
          <motion.div 
            variants={itemVariants}
            className="space-y-12 lg:space-y-16"
          >
            {features.slice(2, 4).map((feature, index) => (
              <motion.div
                key={index + 2}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4"
                >
                  <feature.icon className="text-2xl text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background Decorative Elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl -z-10"
        />
        
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-yellow-200/30 rounded-full blur-xl -z-10"
        />
      </motion.div>
    </section>
  )
}

export default BenefitsSection
