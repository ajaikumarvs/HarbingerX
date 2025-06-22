import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader,
  ChevronRight,
  Calendar
} from 'lucide-react'

const RecentScans = ({ scans }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'running':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      running: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    }
    return badges[status] || badges.pending
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400'
    if (score >= 6) return 'text-blue-400'
    if (score >= 4) return 'text-amber-400'
    return 'text-red-400'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {scans.map((scan, index) => (
        <div
          key={scan.id || index}
          className="glass-card p-6 group hover:scale-[1.01] transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* URL and Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-shrink-0">
                    {getStatusIcon(scan.status)}
                  </div>
                  <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {scan.url}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">{formatDate(scan.timestamp)}</span>
                  </div>
                  
                  <div className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(scan.status)}`}>
                    {scan.status}
                  </div>
                  
                  {scan.vulnerabilities !== null && scan.vulnerabilities !== undefined && (
                    <span className="text-slate-400">
                      {scan.vulnerabilities} issues
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                {scan.score !== null && scan.score !== undefined ? (
                  <div className="flex flex-col items-end">
                    <div className={`text-2xl font-bold ${getScoreColor(scan.score)}`}>
                      {scan.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Security Score
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                    <div className="text-xs text-slate-400 mt-1">
                      Scanning...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0 ml-4">
              <Link
                to={`/results/${scan.id}`}
                                 className="glass-button text-sm px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                View
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {scans.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-400">No recent scans</p>
        </div>
      )}
    </div>
  )
}

export default RecentScans 