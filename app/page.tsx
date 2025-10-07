import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Agricultural Business Plan Template
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive framework for developing professional agricultural business plans
            and managing farm operations - adaptable for any crop, location, or scale
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Crop-Agnostic</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Adaptable framework for any agricultural crop or livestock system
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Location-Flexible</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Templates for climate, soil, and market analysis for any region
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Comprehensive</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Covers technical planning, financial modeling, and operations management
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 mb-16 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Quick Start Guide</h2>
          <div className="space-y-6">
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">1</span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">Review the Framework</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Explore the comprehensive business plan template to understand all components</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">2</span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">Assess Your Context</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Conduct climate, soil, and resource analysis for your specific location</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">3</span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">Select Your Crops</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Choose crops well-matched to your conditions and market opportunities</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">4</span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">Develop Your Plan</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Complete the templates with your specific data and projections</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Wizard - Featured */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl shadow-2xl p-10 mb-10 text-white transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">🤖</span>
                <h2 className="text-3xl font-bold">AI-Powered Farm Planning Wizard</h2>
              </div>
              <p className="text-primary-50 dark:text-primary-100 text-lg mb-5 leading-relaxed">
                Get personalized recommendations based on your location, climate, and budget. 
                Let AI guide you through every step of farm planning.
              </p>
              <ul className="text-primary-50 dark:text-primary-100 space-y-2 text-sm">
                <li className="flex items-center"><span className="mr-2">✓</span> Climate-specific crop recommendations</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Budget-optimized investment planning</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Step-by-step guided setup</li>
              </ul>
            </div>
            <Link 
              href="/tools/ai-wizard"
              className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-10 py-5 rounded-xl font-bold text-lg hover:bg-primary-50 dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 flex-shrink-0 transform hover:scale-105"
            >
              Start Wizard →
            </Link>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 mb-10 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Interactive Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/tools/plan-generator" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">🌱 Plan Generator</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Create customized business plans</p>
            </Link>
            
            <Link href="/tools/calculators" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">💰 Financial Tools</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">6 calculators: ROI, break-even & more</p>
            </Link>
            
            <Link href="/tools/dashboard" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">📊 Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Track tasks and operations</p>
            </Link>
            
            <Link href="/tools/templates" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">📚 Crop Templates</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Browse pre-built crop profiles</p>
            </Link>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Documentation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/docs/diversified-farm-plan" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">🌾 Main Business Plan Template</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Comprehensive agricultural business planning framework</p>
            </Link>
            
            <Link href="/docs/executive-summary" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">📋 Executive Summary Template</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">High-level business plan summary structure</p>
            </Link>
            
            <Link href="/docs/technical-implementation" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">🔧 Technical Implementation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Technical specifications and implementation details</p>
            </Link>
            
            <Link href="/docs/financial-analysis" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">💰 Financial Analysis Framework</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Financial modeling and projection tools</p>
            </Link>
            
            <Link href="/docs/operations-manual" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">⚙️ Operations Manual</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Daily operations and maintenance procedures</p>
            </Link>
            
            <Link href="/docs/market-strategy" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">🛒 Market Strategy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Marketing and sales planning guide</p>
            </Link>
            
            <Link href="/docs/risk-management" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">⚠️ Risk Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Risk assessment and mitigation frameworks</p>
            </Link>
            
            <Link href="/docs/implementation-timeline" className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">📅 Implementation Timeline</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Project timeline and milestone templates</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600 dark:text-gray-400">
          <p className="mb-2">Version 3.0 - General Agricultural Template</p>
          <p>Open source agricultural business planning framework</p>
        </div>
      </div>
    </main>
  )
}
