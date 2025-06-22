import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar,
  ChevronDown,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { GetAllScans, SearchScans, DeleteScan, ExportReport } from '../../wailsjs/go/main/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

const History = () => {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [filteredScans, setFilteredScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedScans, setSelectedScans] = useState([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadScans()
  }, [])

  useEffect(() => {
    filterAndSortScans()
  }, [scans, searchTerm, statusFilter, dateFilter, sortBy])

  const loadScans = async () => {
    try {
      setLoading(true)
      const allScans = await GetAllScans()
      setScans(allScans)
    } catch (error) {
      console.error('Failed to load scans:', error)
      toast.error('Failed to load scan history')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortScans = () => {
    let filtered = [...scans]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scan => 
        (scan.url || scan.target || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (scan.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scan => scan.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        default:
          break
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(scan => new Date(scan.timestamp) >= filterDate)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp)
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp)
        case 'score-high':
          return (b.securityScore || 0) - (a.securityScore || 0)
        case 'score-low':
          return (a.securityScore || 0) - (b.securityScore || 0)
        case 'url':
          return (a.url || a.target || '').localeCompare(b.url || b.target || '')
        default:
          return 0
      }
    })

    setFilteredScans(filtered)
  }

  const handleDeleteScans = async (scanIds) => {
    try {
      setDeleting(true)
      
      for (const scanId of scanIds) {
        await DeleteScan(scanId)
      }
      
      toast.success(`Deleted ${scanIds.length} scan(s) successfully`)
      setSelectedScans([])
      await loadScans()
    } catch (error) {
      console.error('Failed to delete scans:', error)
      toast.error('Failed to delete scans')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportScan = async (scanId, format) => {
    try {
      const filename = await ExportReport(scanId, format, {})
      toast.success(`Scan exported as ${format.toUpperCase()}: ${filename}`)
    } catch (error) {
      console.error('Failed to export scan:', error)
      toast.error(`Failed to export ${format.toUpperCase()}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'running': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'cancelled': return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
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

  const getSecurityGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-500' }
    if (score >= 80) return { grade: 'A', color: 'text-green-500' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-500' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-500' }
    return { grade: 'F', color: 'text-red-500' }
  }

  const handleScanSelect = (scanId) => {
    setSelectedScans(prev => 
      prev.includes(scanId) 
        ? prev.filter(id => id !== scanId)
        : [...prev, scanId]
    )
  }

  const handleSelectAll = () => {
    setSelectedScans(
      selectedScans.length === filteredScans.length 
        ? [] 
        : filteredScans.map(scan => scan.id)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
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
              <HistoryIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
              Scan History
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Browse and manage your past security scans
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadScans}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {selectedScans.length > 0 && (
            <Button
              variant="outline"
              onClick={() => handleDeleteScans(selectedScans)}
              disabled={deleting}
              className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete ({selectedScans.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search URLs or scan IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
                <option value="url">URL A-Z</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredScans.length} of {scans.length} scans
        </p>
        {filteredScans.length > 0 && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedScans.length === filteredScans.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label className="text-sm">Select All</label>
          </div>
        )}
      </div>

      {/* Scan List */}
      {filteredScans.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No scans found</h3>
            <p className="text-muted-foreground mb-6">
              {scans.length === 0 
                ? "You haven't run any scans yet." 
                : "No scans match your current filters."
              }
            </p>
            <Button onClick={() => navigate('/scan')}>
              Start Your First Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredScans.map((scan) => {
            const StatusIcon = getStatusIcon(scan.status)
            const isSelected = selectedScans.includes(scan.id)
            const securityGrade = scan.securityScore ? getSecurityGrade(scan.securityScore) : null

            return (
              <Card key={scan.id} className={`glass-card transition-all hover:border-primary/30 ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleScanSelect(scan.id)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary mt-1"
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {scan.url || scan.target || 'Unknown Target'}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(scan.status).split(' ')[0]} ${scan.status === 'running' ? 'animate-spin' : ''}`} />
                              <Badge className={getStatusColor(scan.status)}>
                                {scan.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(scan.timestamp).toLocaleDateString()} at {new Date(scan.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ID: {scan.id}
                            </span>
                          </div>
                        </div>
                        
                        {/* Security Score */}
                        {securityGrade && (
                          <div className="text-center ml-4">
                            <div className={`text-2xl font-bold ${securityGrade.color}`}>
                              {securityGrade.grade}
                            </div>
                            <p className="text-xs text-muted-foreground">Security</p>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-semibold">
                            {scan.totalVulnerabilities || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">Issues</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-semibold text-red-500">
                            {scan.criticalVulns || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">Critical</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-semibold">
                            {scan.technologies?.length || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">Technologies</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-semibold">
                            {scan.scanDuration || 'N/A'}
                          </div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/results/${scan.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                        {scan.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportScan(scan.id, 'pdf')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportScan(scan.id, 'json')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              JSON
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteScans([scan.id])}
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default History 