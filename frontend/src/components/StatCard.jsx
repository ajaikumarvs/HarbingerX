import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const StatCard = ({ title, value, icon: Icon, color, change, trend }) => {
  const getIconClasses = (color) => {
    const colors = {
      primary: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
      success: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
      warning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
      danger: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
      info: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950'
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