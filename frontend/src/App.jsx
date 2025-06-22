import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewScan from './pages/NewScan'
import ScanResults from './pages/ScanResults'
import History from './pages/History'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <div className="h-screen bg-background overflow-hidden">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<NewScan />} />
            <Route path="/results/:id" element={<ScanResults />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
