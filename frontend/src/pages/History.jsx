import React from 'react'
import { History as HistoryIcon } from 'lucide-react'

const History = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <HistoryIcon className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-text-primary">Scan History</h1>
        <p className="text-text-secondary mt-2">
          Coming soon - Browse and filter past security scans
        </p>
      </div>
    </div>
  )
}

export default History 