import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Search,
  ChevronRight,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  Globe,
  Star,
  Settings
} from 'lucide-react'
// import { GetDashboardStats, GetAllScans } from '../../wailsjs/go/main/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import StatCard from '../components/StatCard'
import RecentScans from '../components/RecentScans'
import ThreatTrends from '../components/ThreatTrends'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    completedScans: 0,
    runningScans: 0,
    failedScans: 0,
    averageScore: 0,
    totalVulns: 0,
    criticalVulns: 0,
    highVulns: 0
  })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Simulate API calls with mock data for demo
      const mockStats = {
        totalScans: 247,
        completedScans: 231,
        runningScans: 3,
        failedScans: 13,
        averageScore: 78,
        totalVulns: 45,
        criticalVulns: 3,
        highVulns: 12
      }
      
      const mockScans = [
        {
          id: '1',
          url: 'https://example.com',
          status: 'completed',
          score: 8.5,
          timestamp: new Date().toISOString(),
          vulnerabilities: 5
        },
        {
          id: '2',
          url: 'https://demo.site',
          status: 'running',
          score: null,
          timestamp: new Date().toISOString(),
          vulnerabilities: null
        }
      ]
      
      setStats(mockStats)
      setRecentScans(mockScans)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Scans',
      value: stats.totalScans,
      icon: Activity,
      color: 'primary',
      change: stats.totalScans > 0 ? +12 : 0,
      trend: 'up'
    },
    {
      title: 'Security Score',
      value: `${Math.round(stats.averageScore)}/100`,
      icon: Shield,
      color: stats.averageScore >= 80 ? 'success' : stats.averageScore >= 60 ? 'warning' : 'danger',
      change: stats.averageScore > 0 ? +5 : 0,
      trend: 'up'
    },
    {
      title: 'Critical Issues',
      value: stats.criticalVulns,
      icon: AlertTriangle,
      color: 'danger',
      change: stats.criticalVulns > 0 ? -2 : 0,
      trend: stats.criticalVulns > 0 ? 'down' : 'stable'
    },
    {
      title: 'Active Scans',
      value: stats.runningScans,
      icon: TrendingUp,
      color: 'info',
      change: stats.runningScans > 0 ? +1 : 0,
      trend: 'up'
    }
  ]

  const quickActions = [
    {
      title: 'New Scan',
      description: 'Start a security scan',
      icon: Search,
      href: '/scan',
      color: 'blue',
      featured: true
    },
    {
      title: 'View History',
      description: 'Browse past scans',
      icon: Clock,
      href: '/history',
      color: 'purple'
    },
    {
      title: 'Settings',
      description: 'Configure application',
      icon: Settings,
      href: '/settings',
      color: 'green'
    },
    {
      title: 'Analytics',
      description: 'Security insights',
      icon: BarChart3,
      href: '/analytics',
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary crimson-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
              Security Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Monitor your security posture and recent scanning activity
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/scan" className="gap-2">
            <Search className="w-5 h-5" />
            <span>New Scan</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            change={card.change}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Scans */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">Recent Scans</CardTitle>
                    <CardDescription>Latest security assessments</CardDescription>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/history" className="gap-2">
                    <span>View all</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {recentScans.length > 0 ? (
                <RecentScans scans={recentScans} />
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your first security scan to see results here
                  </p>
                  <Button asChild>
                    <Link to="/scan" className="gap-2">
                      <Search className="w-4 h-4" />
                      <span>Start Scanning</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const colorClasses = {
                  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
                  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
                  green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
                  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                }
                
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className={`
                      group flex items-center p-3 rounded-lg transition-colors hover:bg-accent
                      ${action.featured ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'}
                    `}
                  >
                    <div className={`
                      p-2 rounded-md mr-3
                      ${colorClasses[action.color]}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground">System Info</CardTitle>
                  <CardDescription>Current status</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">24h 15m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="status-dot-crimson animate-crimson-pulse" />
                  <Badge variant="outline" className="text-primary border-primary/30">Online</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Scan</span>
                <span className="font-medium">2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 