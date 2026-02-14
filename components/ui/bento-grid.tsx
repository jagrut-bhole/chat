import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, MessageCircle, Globe, Users, Zap, Smartphone } from "lucide-react"

function ChatBubbles() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2 w-full max-w-[180px]"
        >
          <div className="bg-white/20 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-white self-start">
            Hey, anyone here? 👋
          </div>
          <div className="bg-white/20 rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white self-end">
            Yes! Welcome in!
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function GroupAnimation() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev >= 5 ? 1 : prev + 1))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full gap-1 p-4">
      <div className="flex -space-x-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              background: `hsl(${217 + i * 40} 80% 65%)`,
            }}
          >
            {String.fromCharCode(65 + i)}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SpeedIndicator() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-bold text-white"
              >
                &lt;1s
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className="text-xs font-medium text-white/60">Match Time</span>
      <div className="w-full max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
          className="h-full bg-white rounded-full"
        />
      </div>
    </div>
  )
}

function SecurityBadge() {
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setShields((prev) => {
        const nextIndex = prev.findIndex((s) => !s.active)
        if (nextIndex === -1) {
          return prev.map(() => ({ id: Math.random(), active: false }))
        }
        return prev.map((s, i) =>
          i === nextIndex ? { ...s, active: true } : s
        )
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full gap-3 p-4">
      {shields.map((shield) => (
        <motion.div
          key={shield.id}
          animate={{ opacity: shield.active ? 1 : 0.3, scale: shield.active ? 1 : 0.8 }}
          className="text-white"
        >
          <Shield className="w-8 h-8" />
        </motion.div>
      ))}
    </div>
  )
}

function GlobalNetwork() {
  const pulses = [0, 1, 2, 3, 4]

  return (
    <div className="relative flex items-center justify-center h-full p-4">
      <Globe className="w-12 h-12 text-white relative z-10" />
      {pulses.map((pulse) => (
        <motion.div
          key={pulse}
          className="absolute w-12 h-12 rounded-full border border-white/30"
          animate={{ scale: [1, 3], opacity: [0.5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pulse * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

export default function BentoGrid01() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 px-6 md:px-[calc(18vw-10rem)]">
      <div className="max-w-[110rem] mx-auto">
        <h2 className="text-[2.4rem] md:text-[3.2rem] font-semibold tracking-tight text-center mb-4 text-white">
          Features
        </h2>
        <p className="text-center text-white/60 text-[1.6rem] mb-12 max-w-[50rem] mx-auto">
          Everything you need for anonymous, real-time conversations with people nearby.
        </p>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[220px]">
          {/* 1. Anonymous Chat - Tall */}
          <div className="col-span-2 row-span-2 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-white/5">
              <ChatBubbles />
            </div>
            <div className="p-5">
              <h3 className="text-[1.6rem] font-semibold text-white">Anonymous Chat</h3>
              <p className="text-[1.3rem] text-white/60 mt-1">
                Talk freely without revealing your identity. Every conversation is private.
              </p>
            </div>
          </div>

          {/* 2. Group Rooms - Standard */}
          <div className="col-span-2 row-span-1 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-white/5">
              <GroupAnimation />
            </div>
            <div className="p-4">
              <h3 className="text-[1.4rem] font-semibold text-white">Group Rooms</h3>
              <p className="text-[1.2rem] text-white/60 mt-0.5">
                Create or join topic-based groups.
              </p>
            </div>
          </div>

          {/* 3. Global Reach - Tall */}
          <div className="col-span-2 row-span-2 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-white/5 relative overflow-hidden">
              <GlobalNetwork />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-white" />
                <span className="text-[1.4rem] font-semibold text-white">Nearby Discovery</span>
              </div>
              <p className="text-[1.3rem] text-white/60">
                Find and connect with people around you in real time.
              </p>
            </div>
          </div>

          {/* 4. Instant Match - Standard */}
          <div className="col-span-2 row-span-1 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-white/5">
              <SpeedIndicator />
            </div>
            <div className="p-4">
              <h3 className="text-[1.4rem] font-semibold text-white -mt-1.5">Instant Match</h3>
              <p className="text-[1.2rem] text-white/60 -mt-1">
                Get paired with someone in under a second.
              </p>
            </div>
          </div>

          {/* 5. End-to-End Encrypted - Wide */}
          <div className="col-span-3 row-span-1 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 flex items-center justify-center bg-white/5 min-h-[80px]">
              <SecurityBadge />
            </div>
            <div className="p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-[1.4rem] font-semibold text-white">Fully Encrypted</span>
              </div>
              <p className="text-[1.2rem] text-white/60">
                Your messages are protected with end-to-end encryption.
              </p>
            </div>
          </div>

          {/* 6. Mobile Ready - Wide */}
          <div className="col-span-3 row-span-1 rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col md:flex-row-reverse">
            <div className="flex-1 flex items-center justify-center bg-white/5 min-h-[80px]">
              <Smartphone className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="p-5 flex flex-col justify-center">
              <h3 className="text-[1.4rem] font-semibold text-white">Mobile Ready</h3>
              <p className="text-[1.2rem] text-white/60 mt-0.5">
                Chat seamlessly on any device, anywhere you go.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
