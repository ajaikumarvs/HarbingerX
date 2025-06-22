import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Download, 
  Share, 
  AlertTriangle, 
  Shield, 
  Globe, 
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  Bot,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react'
import { 
  GetScanResult, 
  GetScanStatus, 
  ExportReport, 
  GenerateAIReport,
  CancelScan 
} from '../../wailsjs/go/main/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

const ScanResults = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scanResult, setScanResult] = useState(null)
  const [scanStatus, setScanStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiReport, setAiReport] = useState(null)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (id) {
      loadScanData()
    }
  }, [id])

  useEffect(() => {
    let interval = null
    if (autoRefresh && scanStatus?.status === 'running') {
      interval = setInterval(() => {
        loadScanData()
      }, 2000) // Poll every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, scanStatus?.status])

  const loadScanData = async () => {
    try {
      setLoading(true)
      
      // Load scan status
      const status = await GetScanStatus(id)
      setScanStatus(status)
      
      // Load scan result if completed
      if (status.status === 'completed') {
        const result = await GetScanResult(id)
        setScanResult(result)
        setAutoRefresh(false) // Stop auto-refresh when completed
      }
    } catch (error) {
      console.error('Failed to load scan data:', error)
      toast.error('Failed to load scan results')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelScan = async () => {
    try {
      await CancelScan(id)
      toast.success('Scan cancelled successfully')
      setAutoRefresh(false)
      await loadScanData()
    } catch (error) {
      console.error('Failed to cancel scan:', error)
      toast.error('Failed to cancel scan')
    }
  }

  const handleGenerateAIReport = async () => {
    if (!scanResult) return
    
    try {
      setGeneratingAI(true)
      const report = await GenerateAIReport(id, 'comprehensive')
      setAiReport(report)
      toast.success('AI report generated successfully!')
    } catch (error) {
      console.error('Failed to generate AI report:', error)
      toast.error('Failed to generate AI report')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleExportReport = async (format) => {
    try {
      setExporting(true)
      const filename = await ExportReport(id, format, {
        includeAI: !!aiReport,
        includeCharts: true
      })
      toast.success(`Report exported as ${format.toUpperCase()}: ${filename}`)
    } catch (error) {
      console.error('Failed to export report:', error)
      toast.error(`Failed to export ${format.toUpperCase()} report`)
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'running': return 'text-blue-500'
      case 'failed': return 'text-red-500'
      case 'cancelled': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle2
      case 'running': return Loader2
      case 'failed': return XCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      case 'info': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getSecurityGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-500' }
    if (score >= 80) return { grade: 'A', color: 'text-green-500' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-500' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-500' }
    return { grade: 'F', color: 'text-red-500' }
  }

  if (loading && !scanResult) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading scan results...</p>
        </div>
      </div>
    )
  }

  if (!scanStatus) {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold">Scan Not Found</h2>
        <p className="text-muted-foreground">The requested scan could not be found.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(scanStatus.status)
  const isRunning = scanStatus.status === 'running'
  const isCompleted = scanStatus.status === 'completed'
  const isFailed = scanStatus.status === 'failed'

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary crimson-glow">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
                Scan Results
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIcon className={`w-4 h-4 ${getStatusColor(scanStatus.status)} ${isRunning ? 'animate-spin' : ''}`} />
                <span className={`text-sm font-medium ${getStatusColor(scanStatus.status)}`}>
                  {scanStatus.status.charAt(0).toUpperCase() + scanStatus.status.slice(1)}
                </span>
                {scanStatus.progress && (
                  <span className="text-sm text-muted-foreground">
                    ({Math.round(scanStatus.progress)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Target: <span className="font-medium">{scanStatus.target || 'Unknown'}</span>
          </p>
          {scanStatus.startTime && (
            <p className="text-sm text-muted-foreground">
              Started: {new Date(scanStatus.startTime).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {isRunning && (
            <>
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'border-primary' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
              <Button variant="outline" onClick={handleCancelScan}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Scan
              </Button>
            </>
          )}
          {isCompleted && (
            <>
              <Button
                variant="outline"
                onClick={handleGenerateAIReport}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                AI Report
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReport('pdf')}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar for Running Scans */}
      {isRunning && scanStatus.progress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Scan Progress</span>
            <span>{Math.round(scanStatus.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanStatus.progress}%` }}
            ></div>
          </div>
          {scanStatus.currentStep && (
            <p className="text-sm text-muted-foreground">
              Current step: {scanStatus.currentStep}
            </p>
          )}
        </div>
      )}

      {/* Results Content */}
      {isFailed && (
        <Card className="glass-card border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-500">
              <XCircle className="w-5 h-5" />
              <span>Scan Failed</span>
            </CardTitle>
            <CardDescription>
              The scan encountered an error and could not be completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanStatus.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-mono">{scanStatus.error}</p>
              </div>
            )}
            <div className="mt-4 flex space-x-3">
              <Button onClick={() => navigate('/scan')}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isRunning && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scan in Progress</span>
            </CardTitle>
            <CardDescription>
              Your security scan is currently running. Results will appear here when complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scanStatus.logs && scanStatus.logs.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {scanStatus.logs.slice(-5).map((log, index) => (
                    <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <p className="font-mono">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Results */}
      {isCompleted && scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Score */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getSecurityGrade(scanResult.securityScore).color}`}>
                      {getSecurityGrade(scanResult.securityScore).grade}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Security Grade</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">
                      {scanResult.securityScore}/100
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vulnerabilities */}
            {scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Vulnerabilities ({scanResult.vulnerabilities.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.vulnerabilities.map((vuln, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{vuln.title}</h4>
                        <Badge className={`${getSeverityColor(vuln.severity)} text-white`}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                      {vuln.recommendation && (
                        <div className="mt-3 p-3 bg-muted/50 rounded">
                          <p className="text-sm"><strong>Recommendation:</strong> {vuln.recommendation}</p>
                        </div>
                      )}
                      {vuln.references && vuln.references.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {vuln.references.map((ref, refIndex) => (
                            <a
                              key={refIndex}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{ref.title || 'Reference'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Technology Stack */}
            {scanResult.technologies && scanResult.technologies.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Technology Stack</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanResult.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{tech.name}</h4>
                          <p className="text-sm text-muted-foreground">{tech.category}</p>
                        </div>
                        {tech.version && (
                          <Badge variant="outline">{tech.version}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scan Duration</span>
                  <span className="text-sm font-medium">
                    {scanResult.scanDuration || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Checks</span>
                  <span className="text-sm font-medium">
                    {scanResult.totalChecks || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Issues Found</span>
                  <span className="text-sm font-medium">
                    {scanResult.vulnerabilities?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Critical Issues</span>
                  <span className="text-sm font-medium text-red-500">
                    {scanResult.vulnerabilities?.filter(v => v.severity === 'Critical').length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExportReport('json')}
                  disabled={exporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/scan')}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </CardContent>
            </Card>

            {/* AI Report */}
            {aiReport && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>AI Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: aiReport.summary }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScanResults 