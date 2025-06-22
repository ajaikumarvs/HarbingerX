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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const RecentScans = ({ scans }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'running':
        return <Loader className="w-4 h-4 text-primary animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    }
    return variants[status] || variants.pending
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-primary'
    if (score >= 4) return 'text-yellow-400'
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
        <Card key={scan.id || index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* URL and Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-shrink-0">
                      {getStatusIcon(scan.status)}
                    </div>
                    <h3 className="font-medium truncate hover:text-primary transition-colors">
                      {scan.url}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDate(scan.timestamp)}</span>
                    </div>
                    
                    <Badge variant={getStatusBadge(scan.status)} className="text-xs">
                      {scan.status}
                    </Badge>
                    
                    {scan.vulnerabilities !== null && scan.vulnerabilities !== undefined && (
                      <span className="text-muted-foreground">
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
                      <div className="text-xs text-muted-foreground">
                        Security Score
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Scanning...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/results/${scan.id}`} className="gap-2">
                    View
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {scans.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No recent scans</p>
        </div>
      )}
    </div>
  )
}

export default RecentScans 