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
  Clock
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
      const [statsData, scansData] = await Promise.all([
        GetDashboardStats(),
        GetAllScans()
      ])
      
      setStats(statsData || {})
      setRecentScans(scansData?.slice(0, 5) || [])
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
      title: 'Average Score',
      value: `${Math.round(stats.averageScore)}/100`,
      icon: Shield,
      color: stats.averageScore >= 80 ? 'success' : stats.averageScore >= 60 ? 'warning' : 'danger',
      change: stats.averageScore > 0 ? +5 : 0,
      trend: 'up'
    },
    {
      title: 'Critical Vulnerabilities',
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
      color: 'warning',
      change: stats.runningScans > 0 ? +1 : 0,
      trend: 'up'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Security Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Monitor your security posture and recent scanning activity
          </p>
        </div>
        <Link
          to="/scan"
          className="glass-button primary flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>New Scan</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Recent Scans</h2>
              <Link
                to="/history"
                className="text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1 text-sm"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentScans.length > 0 ? (
              <RecentScans scans={recentScans} />
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No scans found</p>
                <p className="text-sm text-text-secondary mt-1">
                  Start your first security scan to see results here
                </p>
                <Link
                  to="/scan"
                  className="glass-button primary mt-4 inline-flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Start Scanning</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/scan"
                className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-accent-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Search className="w-4 h-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">New Scan</p>
                  <p className="text-xs text-text-secondary">Start a security scan</p>
                </div>
              </Link>
              
              <Link
                to="/history"
                className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-accent-success/20 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-accent-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">View History</p>
                  <p className="text-xs text-text-secondary">Browse past scans</p>
                </div>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-accent-warning/20 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-accent-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Configure Settings</p>
                  <p className="text-xs text-text-secondary">Manage API keys</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Security Alerts */}
          {stats.criticalVulns > 0 && (
            <div className="glass-card p-6 border-accent-danger/20">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent-danger" />
                <h3 className="text-lg font-semibold text-text-primary">Security Alerts</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-accent-danger/10 rounded-lg border border-accent-danger/20">
                  <p className="text-sm font-medium text-accent-danger">
                    {stats.criticalVulns} Critical Vulnerabilities
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Immediate attention required
                  </p>
                </div>
                {stats.highVulns > 0 && (
                  <div className="p-3 bg-accent-warning/10 rounded-lg border border-accent-warning/20">
                    <p className="text-sm font-medium text-accent-warning">
                      {stats.highVulns} High Priority Issues
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Schedule remediation soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Scanner Engine</span>
                <span className="text-sm text-accent-success">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">AI Analysis</span>
                <span className="text-sm text-accent-success">Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Database</span>
                <span className="text-sm text-accent-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Last Update</span>
                <span className="text-sm text-text-secondary">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Trends Chart */}
      {stats.totalScans > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Security Trends</h2>
          <ThreatTrends />
        </div>
      )}
    </div>
  )
}

export default Dashboard 