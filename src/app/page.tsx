'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Recycle,
  Users,
  Coins,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Poppins } from 'next/font/google'
import ContractInteraction from '@/components/ContractInteraction'
import {
  getRecentReports,
  getAllRewards,
  getWasteCollectionTasks,
} from '@/utils/db/actions'

const poppins = Poppins({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

type ImpactCardProps = {
  title: string
  value: string | number
  icon: React.ElementType
}

type FeatureCardProps = {
  icon: React.ElementType
  title: string
  description: string
}

function AnimatedGlobe() {
  return (
    <div className="relative w-36 h-36 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-300 opacity-30 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-200 opacity-50 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-100 opacity-70 animate-bounce"></div>
      <UtensilsCrossed className="absolute inset-0 m-auto h-14 w-14 text-green-600 animate-pulse" />
    </div>
  )
}

function ImpactCard({ title, value, icon: Icon }: ImpactCardProps) {
  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString('en-US', { maximumFractionDigits: 1 })
      : value

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <Icon className="h-8 w-8 text-green-500 mb-3" />
      <p className="text-2xl font-bold text-gray-800">{formattedValue}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition duration-300 text-center">
      <div className="bg-green-100 p-4 rounded-full mb-5 inline-block">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  })

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail')
    setLoggedIn(!!userEmail)
  }, [])

  useEffect(() => {
    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100)
        const rewards = await getAllRewards()
        const tasks = await getWasteCollectionTasks(100)

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount?.match(/(\d+(\.\d+)?)/)
          const amount = match ? parseFloat(match[0]) : 0
          return total + amount
        }, 0)

        const reportsSubmitted = reports.length
        const tokensEarned = rewards.reduce(
          (total, reward) => total + (reward.points || 0),
          0
        )
        const co2Offset = wasteCollected * 0.5

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10,
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10,
        })
      } catch (error) {
        console.error('Error fetching impact data:', error)
      }
    }

    fetchImpactData()
  }, [])

  return (
    <main className={`container mx-auto px-6 py-12 ${poppins.className}`}>
      {/* Hero Section */}
      <section className="text-center mb-24">
        <AnimatedGlobe />
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          <span className="text-green-600">Food Waste</span> Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Join the mission to reduce food waste and earn rewards for a greener
          future.
        </p>
        <Link href={loggedIn ? '/report' : '/login'}>
          <Button className="bg-green-600 hover:bg-green-700 text-white text-md px-6 py-4 rounded-full">
            {loggedIn ? 'Report Waste' : 'Get Started'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid gap-8 md:grid-cols-3 mb-24">
        <FeatureCard
          icon={UtensilsCrossed}
          title="Eco-Friendly"
          description="Help reduce food waste and protect the environment."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Tokens"
          description="Get rewarded for making a sustainable impact."
        />
        <FeatureCard
          icon={Users}
          title="Community Power"
          description="Be part of a movement to manage waste more effectively."
        />
      </section>

      {/* Impact Section */}
      <section className="bg-gray-50 py-12 px-8 rounded-3xl shadow-inner">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Your Impact
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          <ImpactCard
            title="Waste Collected"
            value={`${impactData.wasteCollected} kg`}
            icon={Recycle}
          />
          <ImpactCard
            title="Reports Submitted"
            value={impactData.reportsSubmitted}
            icon={MapPin}
          />
          <ImpactCard
            title="Tokens Earned"
            value={impactData.tokensEarned}
            icon={Coins}
          />
          <ImpactCard
            title="CO2 Offset"
            value={`${impactData.co2Offset} kg`}
            icon={UtensilsCrossed}
          />
        </div>
      </section>
    </main>
  )
}
