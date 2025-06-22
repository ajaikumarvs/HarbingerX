import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  FileText, 
  History, 
  Settings, 
  Shield,
  Menu,
  X,
  ChevronRight,
  Activity
} from 'lucide-react'
import logo from '../assets/images/logo-universal.png'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/' || location.pathname === '/dashboard',
      description: 'Overview & analytics'
    },
    {
      name: 'New Scan',
      href: '/scan',
      icon: Search,
      current: location.pathname === '/scan',
      description: 'Start security scan'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      current: location.pathname === '/history',
      description: 'Past scan results'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      description: 'App configuration'
    }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="glass-card h-full m-4 flex flex-col relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
            }} />
          </div>

          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-6 relative z-10">
            <div className="flex items-center space-x-3 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <img src={logo} alt="HarbingerX" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">HarbingerX</h1>
                <p className="text-xs text-slate-400">Security Scanner</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-2 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center p-4 rounded-2xl transition-all duration-200 relative overflow-hidden
                    ${item.current
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  {/* Active indicator */}
                  {item.current && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                  )}
                  
                  <div className={`
                    p-2 rounded-xl mr-4 transition-all duration-200
                    ${item.current 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${item.current ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.description}
                    </p>
                  </div>
                  
                  {item.current && (
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* System Status */}
          <div className="p-4 relative z-10">
            <div className="glass-card p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="w-8 h-8 text-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">System Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="status-dot completed" />
                    <p className="text-xs text-emerald-400">All systems operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden">
                      <div className="glass-card m-4 mb-0 p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-300" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <img src={logo} alt="HarbingerX" className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-gradient">HarbingerX</h1>
            </div>
            
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout 