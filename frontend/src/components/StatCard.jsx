import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, change, trend }) => {
  const getIconClasses = (color) => {
    const colors = {
      primary: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      danger: 'text-red-400 bg-red-500/10 border-red-500/20',
      info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
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
        return 'text-emerald-400 bg-emerald-500/10'
      case 'down':
        return 'text-red-400 bg-red-500/10'
      default:
        return 'text-slate-400 bg-slate-500/10'
    }
  }

  return (
    <div className="glass-card p-6 group cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <div className="space-y-4">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <div className={`
            p-3 rounded-2xl border backdrop-blur-sm
            ${getIconClasses(color)}
            group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon className="w-5 h-5" />
          </div>
          
          {change !== undefined && change !== 0 && (
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
              ${getTrendColor()}
              backdrop-blur-sm border border-white/5
            `}>
              {getTrendIcon()}
              <span>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-white group-hover:text-gradient transition-all duration-300">
              {value}
            </p>
          </div>
          
          {change !== undefined && change !== 0 && (
            <p className="text-xs text-slate-500">
              vs last week
            </p>
          )}
        </div>
      </div>

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

export default StatCard 