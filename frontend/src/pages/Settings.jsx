import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <SettingsIcon className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Coming soon - Configure API keys and application settings
        </p>
      </div>
    </div>
  )
}

export default Settings 