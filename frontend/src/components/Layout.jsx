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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <Card className="h-full m-4 border-r">
          <CardContent className="p-6 h-full flex flex-col">
            {/* Logo & Close Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary crimson-glow">
                  <img src={logo} alt="HarbingerX" className="w-6 h-6 brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">HarbingerX</h1>
                  <p className="text-xs text-muted-foreground">Security Scanner</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center p-3 rounded-lg text-sm font-medium transition-colors
                      ${item.current
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                    {item.current && <ChevronRight className="w-4 h-4" />}
                  </Link>
                )
              })}
            </nav>

            <Separator className="my-4" />

            {/* System Status */}
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Shield className="w-8 h-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-crimson-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        All systems operational
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden border-b">
          <div className="p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-primary crimson-glow">
                <img src={logo} alt="HarbingerX" className="w-5 h-5 brightness-0 invert" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">HarbingerX</h1>
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout 