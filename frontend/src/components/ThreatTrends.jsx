import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const ThreatTrends = () => {
  // Mock data for demonstration
  const mockData = [
    { period: 'Last 7 days', score: 85, change: 5, trend: 'up' },
    { period: 'Last 30 days', score: 78, change: -3, trend: 'down' },
    { period: 'Last 90 days', score: 82, change: 8, trend: 'up' }
  ]

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">Security score trends over time</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockData.map((item, index) => (
          <div key={index} className="p-4 rounded-lg bg-white/5 border border-glass-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{item.period}</p>
                <p className="text-xl font-bold text-text-primary">{item.score}/100</p>
              </div>
              <div className={`flex items-center space-x-1 ${
                item.trend === 'up' ? 'text-accent-success' : 'text-accent-danger'
              }`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThreatTrends 