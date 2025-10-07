import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Agricultural Business Plan Template
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive framework for developing professional agricultural business plans
            and managing farm operations - adaptable for any crop, location, or scale
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Crop-Agnostic</h3>
            <p className="text-gray-600">
              Adaptable framework for any agricultural crop or livestock system
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Location-Flexible</h3>
            <p className="text-gray-600">
              Templates for climate, soil, and market analysis for any region
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive</h3>
            <p className="text-gray-600">
              Covers technical planning, financial modeling, and operations management
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">1</span>
              <div>
                <h4 className="font-semibold mb-1">Review the Framework</h4>
                <p className="text-gray-600">Explore the comprehensive business plan template to understand all components</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">2</span>
              <div>
                <h4 className="font-semibold mb-1">Assess Your Context</h4>
                <p className="text-gray-600">Conduct climate, soil, and resource analysis for your specific location</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">3</span>
              <div>
                <h4 className="font-semibold mb-1">Select Your Crops</h4>
                <p className="text-gray-600">Choose crops well-matched to your conditions and market opportunities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">4</span>
              <div>
                <h4 className="font-semibold mb-1">Develop Your Plan</h4>
                <p className="text-gray-600">Complete the templates with your specific data and projections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interactive Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/tools/plan-generator" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">🌱 Plan Generator</h3>
              <p className="text-gray-600 text-sm">Create customized business plans</p>
            </Link>
            
            <Link href="/tools/calculators" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">💰 Financial Tools</h3>
              <p className="text-gray-600 text-sm">ROI, break-even & more calculators</p>
            </Link>
            
            <Link href="/tools/dashboard" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">📊 Dashboard</h3>
              <p className="text-gray-600 text-sm">Track tasks and operations</p>
            </Link>
            
            <Link href="/tools/templates" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">📚 Crop Templates</h3>
              <p className="text-gray-600 text-sm">Browse pre-built crop profiles</p>
            </Link>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/diversified-farm-plan" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">🌾 Main Business Plan Template</h3>
              <p className="text-gray-600 text-sm">Comprehensive agricultural business planning framework</p>
            </Link>
            
            <Link href="/docs/executive-summary" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">📋 Executive Summary Template</h3>
              <p className="text-gray-600 text-sm">High-level business plan summary structure</p>
            </Link>
            
            <Link href="/docs/technical-implementation" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">🔧 Technical Implementation</h3>
              <p className="text-gray-600 text-sm">Technical specifications and implementation details</p>
            </Link>
            
            <Link href="/docs/financial-analysis" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">💰 Financial Analysis Framework</h3>
              <p className="text-gray-600 text-sm">Financial modeling and projection tools</p>
            </Link>
            
            <Link href="/docs/operations-manual" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">⚙️ Operations Manual</h3>
              <p className="text-gray-600 text-sm">Daily operations and maintenance procedures</p>
            </Link>
            
            <Link href="/docs/market-strategy" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">🛒 Market Strategy</h3>
              <p className="text-gray-600 text-sm">Marketing and sales planning guide</p>
            </Link>
            
            <Link href="/docs/risk-management" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">⚠️ Risk Management</h3>
              <p className="text-gray-600 text-sm">Risk assessment and mitigation frameworks</p>
            </Link>
            
            <Link href="/docs/implementation-timeline" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all">
              <h3 className="font-semibold text-lg mb-2">📅 Implementation Timeline</h3>
              <p className="text-gray-600 text-sm">Project timeline and milestone templates</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p className="mb-2">Version 3.0 - General Agricultural Template</p>
          <p>Open source agricultural business planning framework</p>
        </div>
      </div>
    </main>
  )
}
