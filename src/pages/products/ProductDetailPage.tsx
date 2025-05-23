import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

const productDetails = {
  vts: {
    id: 'vts',
    name: 'Vessel Tracking Service',
    price: 500,
    description: `Leveraging Theia's existing capabilities, our Vessel Tracking Service provides a flexible, customized vessel tracking solution tailored to your specific needs. Tracking is tied to the vessel's IMO number, ensuring reliability even amid flag or MMSI changes.

Monitor vessels based on criteria including:
• AIS reporting - updated location information on 3-6-12-24hr intervals
• Dark Event - Detection of AIS signal loss (start and end of dark period)
• Spoofing Event / GPS Manipulation - Identify vessels falsifying locations
• STS event - Monitor mid-sea cargo exchanges
• Port of Call - Detect vessels arriving or departing from key ports
• Vessel in Distress, Ownership Change, Flag/MMSI Change
• Vessel AOI/Geofencing alerts - User defined
• Risk Assessment Change - Changes to SynMax automated risk assessment

This low-cost, commitment-free entry point eliminates contractual barriers and allows quick onboarding with no upfront risk.`,
    image: '/api/placeholder/400/300',
  },
  ams: {
    id: 'ams',
    name: 'Area Monitoring Service',
    price: 750,
    description: `Area Monitoring Service offers flexible, customizable ocean area monitoring, allowing you to track specific regions of interest with real-time alerts. Designed for maritime security, regulatory enforcement, and commercial intelligence.

Define and monitor a custom Area of Interest (AOI) with alerts for:
• Vessel Entry & Exit - Track when vessels enter or leave the defined AOI
• AIS Reporting - Location updates at 3, 6, 12, or 24-hour intervals
• Dark Ship Events - Detection of AIS signal loss
• Spoofing & GPS Manipulation - Identify vessels falsifying locations
• STS Transfers - Monitor mid-sea cargo exchanges
• Port of Call Activity - Detect vessels arriving or departing from key ports
• Vessel in Distress - Alert users to emergency events within the AOI
• Risk Assessment Updates - Automated alerts on changes in vessel risk profiles

Instant notifications of critical vessel movements with flexible, pay-as-you-go model and no contractual barriers.`,
    image: '/api/placeholder/400/300',
  },
  fts: {
    id: 'fts',
    name: 'Fleet Tracking Service',
    price: 1000,
    description: `Fleet Tracking Service provides a customized fleet monitoring solution designed for fleet operators. Track multiple vessels within your fleet using a centralized dashboard with tailored alerts and real-time insights across the entire fleet.

Monitor all vessels within your fleet based on:
• AIS Reporting - Location updates at 3, 6, 12, or 24-hour intervals for all fleet vessels
• Dark Ship Events - Detection of AIS signal loss for fleet vessels
• Spoofing Events - Detection of GPS manipulation or false location reporting
• STS Events - Monitoring cargo exchanges between vessels
• Port of Call - Track all vessels entering or leaving designated ports
• Vessel in Distress - Alerts for vessels in emergency situations
• Ownership & Registration Changes - Monitor flag or MMSI changes
• Geofencing Alerts - Customized AOI for each vessel
• Risk Assessment Changes - Automated alerts when risk profiles change

Eliminates the need for in-house MDA analysts, providing automated fleet oversight and risk detection. Minimum 10 vessels, 12-month contract.`,
    image: '/api/placeholder/400/300',
  },
  reports: {
    id: 'reports',
    name: 'Compliance & Chronology Reports',
    price: 300,
    description: `Access detailed vessel compliance assessments and comprehensive chronology reports on-demand. Essential for insurers, financial institutions, legal firms, and compliance teams.

Compliance Reports include:
• Sanctions Screening - OFAC, EU, UN, and other global sanctions violations
• Regulatory Compliance - IMO, SOLAS, MARPOL alignment
• AIS Integrity & Spoofing Detection - Historical AIS manipulation verification
• Ownership & Beneficial Control - Ultimate vessel ownership identification
• Risk Assessment Score - Quantified risk rating based on vessel behavior

Chronology Reports provide:
• Complete vessel activity timeline over selected time period
• Ports of Call - All port entries and departures with timestamps
• Ship-to-Ship Transfers - Mid-sea cargo exchanges
• Dark Voyages - Periods where AIS was disabled
• Risk Profile Changes - Sanctions risk and compliance status fluctuations

Instant access with no waiting period. Pay-as-you-go model eliminates contract requirements.`,
    image: '/api/placeholder/400/300',
  },
  mis: {
    id: 'mis',
    name: 'Maritime Investigation Service',
    price: 1500,
    description: `The most comprehensive, intelligence-driven deep-dive analysis on the market. Conducted by SynMax intelligence experts, these investigations provide unparalleled insights into vessels, maritime areas, or specific events.

Investigation scope includes:
• Vessel Activity - Comprehensive analysis of historical and real-time movements
• Maritime Areas of Interest - Detailed monitoring for ports and shipping lanes
• High-Risk Events - Investigation of dark voyages, STS transfers, sanctions violations

Intelligence sources utilized:
• Satellite Imagery - High-resolution analysis for vessel verification
• OSINT - Real-time tracking of news, social media, and public records
• SIGINT - AIS and RF data analysis to detect anomalies
• Webcams & Sensors - Live feeds from coastal monitoring stations
• HUMINT - Insights from trusted industry sources
• Proprietary Analytical Tools - Exclusive SynMax algorithms

Expert-led investigations fully customized to client requirements. Submit RFI through SIM platform to initiate.`,
    image: '/api/placeholder/400/300',
  },
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [addedToCart, setAddedToCart] = useState(false)

  const product = productDetails[productId as keyof typeof productDetails]

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const handlePurchaseNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout', { state: { product } })
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark-500 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">SYNMAX</span>
              <span className="text-xl text-gray-300">Marketplace</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/cart')}
              className="relative text-primary-500 hover:text-primary-400"
            >
              🛒
              {addedToCart && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-secondary-500 text-xs text-white flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-96">
              <span className="text-gray-500 text-xl">Product Image</span>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-2xl font-semibold text-primary-600">
                ${product.price.toLocaleString()}.xx
              </p>
              
              <div className="mt-6 space-y-4">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  variant="synmax"
                  size="lg"
                  fullWidth
                  onClick={handlePurchaseNow}
                >
                  Purchase Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  className="border-gray-300"
                >
                  {addedToCart ? 'Added to Cart!' : 'Add to cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}