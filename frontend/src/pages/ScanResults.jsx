import React from 'react'
import { FileText } from 'lucide-react'

const ScanResults = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-text-primary">Scan Results</h1>
        <p className="text-text-secondary mt-2">
          Coming soon - Detailed vulnerability analysis and AI insights
        </p>
      </div>
    </div>
  )
}

export default ScanResults 