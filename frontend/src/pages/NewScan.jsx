import React from 'react'
import { Search } from 'lucide-react'

const NewScan = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Search className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-text-primary">New Security Scan</h1>
        <p className="text-text-secondary mt-2">
          Coming soon - Advanced security scanning interface
        </p>
      </div>
    </div>
  )
}

export default NewScan 