import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, change, trend }) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
      success: 'text-accent-success bg-accent-success/10 border-accent-success/20',
      warning: 'text-accent-warning bg-accent-warning/10 border-accent-warning/20',
      danger: 'text-accent-danger bg-accent-danger/10 border-accent-danger/20'
    }
    return colors[color] || colors.primary
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />
      case 'down':
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-accent-success'
      case 'down':
        return 'text-accent-danger'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center space-x-1 mt-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-text-secondary">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl border ${getColorClasses(color)}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default StatCard 