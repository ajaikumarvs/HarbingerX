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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Security Dashboard</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Monitor your security posture and recent scanning activity
          </p>
        </div>
        <Link
          to="/scan"
          className="glass-button primary flex items-center space-x-2 text-lg px-6 py-3"
        >
          <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>New Scan</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
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
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Scans</h2>
                  <p className="text-slate-400">Latest security assessments</p>
                </div>
              </div>
              <Link
                to="/history"
                className="glass-button flex items-center space-x-2 text-sm px-4 py-2"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {recentScans.length > 0 ? (
              <RecentScans scans={recentScans} />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No scans yet</h3>
                <p className="text-slate-400 mb-6">
                  Start your first security scan to see results here
                </p>
                <Link
                  to="/scan"
                  className="glass-button primary flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Start Scanning</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                <p className="text-slate-400 text-sm">Common tasks</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const colorClasses = {
                  blue: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
                  purple: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
                  green: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
                  orange: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                }
                
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className={`
                      group flex items-center p-4 rounded-xl transition-all duration-200 hover:bg-white/5 border border-transparent hover:border-white/10
                      ${action.featured ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' : ''}
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-4 transition-all duration-200
                      ${colorClasses[action.color]}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* System Info */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">System Info</h3>
                <p className="text-slate-400 text-sm">Current status</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Version</span>
                <span className="text-white font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uptime</span>
                <span className="text-white font-medium">24h 15m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="status-dot completed" />
                  <span className="text-emerald-400 font-medium">Online</span>
                </div>
              </div>
              <div className="divider my-4" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Scan</span>
                <span className="text-white font-medium">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 