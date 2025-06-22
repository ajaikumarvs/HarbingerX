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
  X
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
      current: location.pathname === '/' || location.pathname === '/dashboard'
    },
    {
      name: 'New Scan',
      href: '/scan',
      icon: Search,
      current: location.pathname === '/scan'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      current: location.pathname === '/history'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    }
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-card transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="HarbingerX" className="w-8 h-8" />
              <h1 className="text-xl font-bold gradient-text">HarbingerX</h1>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${item.current
                      ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-glass-border">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
              <Shield className="w-8 h-8 text-accent-success" />
              <div>
                <p className="text-sm font-medium text-text-primary">Security Status</p>
                <p className="text-xs text-accent-success">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 glass-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logo} alt="HarbingerX" className="w-6 h-6" />
            <h1 className="text-lg font-bold gradient-text">HarbingerX</h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout 