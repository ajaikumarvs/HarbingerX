import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const RecentScans = ({ scans }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent-success" />
      case 'running':
        return <Clock className="w-4 h-4 text-accent-warning animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-accent-danger" />
      default:
        return <AlertCircle className="w-4 h-4 text-text-secondary" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'running':
        return 'Running'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-accent-success'
    if (score >= 60) return 'text-accent-warning'
    return 'text-accent-danger'
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-3">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            {getStatusIcon(scan.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {scan.url}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-text-secondary">
                  {formatDate(scan.timestamp)}
                </span>
                <span className="text-xs text-text-secondary">
                  {getStatusText(scan.status)}
                </span>
                {scan.status === 'completed' && scan.securityScore && (
                  <span className={`text-xs font-medium ${getScoreColor(scan.securityScore)}`}>
                    Score: {Math.round(scan.securityScore)}/100
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {scan.status === 'completed' && (
            <Link
              to={`/results/${scan.id}`}
              className="text-accent-primary hover:text-accent-primary/80 p-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

export default RecentScans 