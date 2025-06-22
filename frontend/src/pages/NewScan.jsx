import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Globe, 
  Shield, 
  Settings, 
  AlertCircle,
  Play,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { StartScan, GetConfig } from '../../wailsjs/go/main/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

const NewScan = () => {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [scanOptions, setScanOptions] = useState({
    enableSSL: true,
    enableVulnScan: true,
    enableTechStack: true,
    enableDNSInfo: true,
    deepScan: false,
    scanTimeout: 300
  })
  const [isScanning, setIsScanning] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [config, setConfig] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const appConfig = await GetConfig()
      setConfig(appConfig)
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const validateUrl = (inputUrl) => {
    if (!inputUrl.trim()) {
      return 'URL is required'
    }
    
    try {
      const url = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Only HTTP and HTTPS URLs are supported'
      }
      return ''
    } catch (error) {
      return 'Please enter a valid URL'
    }
  }

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setValidationError(validateUrl(newUrl))
  }

  const handleOptionChange = (option) => {
    setScanOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handleTimeoutChange = (e) => {
    setScanOptions(prev => ({
      ...prev,
      scanTimeout: parseInt(e.target.value) || 300
    }))
  }

  const handleStartScan = async () => {
    const error = validateUrl(url)
    if (error) {
      setValidationError(error)
      return
    }

    try {
      setIsScanning(true)
      const targetUrl = url.startsWith('http') ? url : `https://${url}`
      
      const scanId = await StartScan(targetUrl, scanOptions)
      
      toast.success('Scan started successfully!')
      navigate(`/results/${scanId}`)
    } catch (error) {
      console.error('Failed to start scan:', error)
      toast.error(`Failed to start scan: ${error.message || 'Unknown error'}`)
    } finally {
      setIsScanning(false)
    }
  }

  const scanOptionsList = [
    {
      key: 'enableSSL',
      title: 'SSL/TLS Analysis',
      description: 'Check certificate validity and security',
      icon: Shield,
      recommended: true
    },
    {
      key: 'enableVulnScan',
      title: 'Vulnerability Scanning',
      description: 'Scan for known security vulnerabilities',
      icon: AlertCircle,
      recommended: true
    },
    {
      key: 'enableTechStack',
      title: 'Technology Detection',
      description: 'Identify web technologies and versions',
      icon: Settings,
      recommended: true
    },
    {
      key: 'enableDNSInfo',
      title: 'DNS Information',
      description: 'Gather DNS records and configuration',
      icon: Globe,
      recommended: false
    },
    {
      key: 'deepScan',
      title: 'Deep Scan',
      description: 'Comprehensive analysis (takes longer)',
      icon: Search,
      recommended: false
    }
  ]

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 rounded-xl bg-primary crimson-glow">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
            New Security Scan
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter a URL to perform a comprehensive security analysis including vulnerability detection, SSL assessment, and technology identification.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Scan Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* URL Input */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Target URL</span>
              </CardTitle>
              <CardDescription>
                Enter the website URL you want to scan for security issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com or example.com"
                  className={`w-full px-4 py-3 rounded-lg border bg-background/50 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    validationError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                  }`}
                  disabled={isScanning}
                />
                {validationError && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </p>
                )}
                {url && !validationError && (
                  <p className="text-green-500 text-sm flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>URL looks good!</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Options */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Scan Options</span>
              </CardTitle>
              <CardDescription>
                Configure what aspects of the website to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {scanOptionsList.map((option) => {
                  const Icon = option.icon
                  return (
                    <div
                      key={option.key}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                        scanOptions[option.key] ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => handleOptionChange(option.key)}
                    >
                      <input
                        type="checkbox"
                        checked={scanOptions[option.key]}
                        onChange={() => handleOptionChange(option.key)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                        disabled={isScanning}
                      />
                      <Icon className={`w-5 h-5 ${scanOptions[option.key] ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{option.title}</h4>
                          {option.recommended && (
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Timeout Setting */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-2">Scan Timeout (seconds)</label>
                <input
                  type="number"
                  value={scanOptions.scanTimeout}
                  onChange={handleTimeoutChange}
                  min="60"
                  max="1800"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isScanning}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum time to wait for scan completion (60-1800 seconds)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Start Scan Button */}
          <Button
            onClick={handleStartScan}
            disabled={isScanning || !url || !!validationError}
            size="lg"
            className="w-full h-14 text-lg crimson-glow"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Starting Scan...
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                Start Security Scan
              </>
            )}
          </Button>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Scan Features */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">What We Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Security Headers</h4>
                  <p className="text-sm text-muted-foreground">CSP, HSTS, X-Frame-Options</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Vulnerabilities</h4>
                  <p className="text-sm text-muted-foreground">Known CVEs and security issues</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Technology Stack</h4>
                  <p className="text-sm text-muted-foreground">Frameworks, CMS, servers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">DNS & Network</h4>
                  <p className="text-sm text-muted-foreground">Records, configuration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Tips */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Scanning Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p>Use deep scan for comprehensive analysis</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p>Scans typically take 1-5 minutes</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p>Results include AI-powered insights</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p>Export results as PDF or JSON</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewScan 