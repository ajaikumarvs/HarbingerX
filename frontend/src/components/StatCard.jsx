import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const StatCard = ({ title, value, icon: Icon, color, change, trend }) => {
  const getIconClasses = (color) => {
    const colors = {
      primary: 'text-primary bg-primary/20 border border-primary/30',
      success: 'text-green-400 bg-green-500/20 border border-green-500/30',
      warning: 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30',
      danger: 'text-red-400 bg-red-500/20 border border-red-500/30',
      info: 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30'
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

  const getTrendVariant = () => {
    switch (trend) {
      case 'up':
        return 'default'
      case 'down':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className={`p-2 rounded-lg ${getIconClasses(color)}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        {change !== undefined && change !== 0 && (
          <Badge variant={getTrendVariant()} className="gap-1">
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
          
          {change !== undefined && change !== 0 && (
            <p className="text-xs text-muted-foreground">
              vs last week
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard 