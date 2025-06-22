import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Key, 
  Save, 
  Eye, 
  EyeOff, 
  TestTube, 
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Info,
  Shield,
  Globe,
  Bot,
  Sliders,
  Database,
  RefreshCw,
  Plus,
  ExternalLink,
  Zap
} from 'lucide-react'
import { 
  GetAPIKeys, 
  SaveAPIKey, 
  TestAPIKey, 
  GetConfig, 
  UpdateConfig 
} from '../../wailsjs/go/main/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({})
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingKeys, setTestingKeys] = useState({})
  const [showKeys, setShowKeys] = useState({})
  const [tempApiKeys, setTempApiKeys] = useState({})
  const [tempConfig, setTempConfig] = useState({})
  const [customProviders, setCustomProviders] = useState([])
  const [showAddCustomProvider, setShowAddCustomProvider] = useState(false)
  const [newCustomProvider, setNewCustomProvider] = useState({
    name: '',
    endpoint: '',
    headers: {},
    description: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const [keys, appConfig] = await Promise.all([
        GetAPIKeys(),
        GetConfig()
      ])
      setApiKeys(keys)
      setConfig(appConfig)
      setTempApiKeys(keys)
      setTempConfig(appConfig)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleApiKeyChange = (provider, value) => {
    setTempApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }

  const handleConfigChange = (key, value) => {
    setTempConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveApiKey = async (provider) => {
    try {
      setSaving(true)
      await SaveAPIKey(provider, tempApiKeys[provider])
      setApiKeys(prev => ({
        ...prev,
        [provider]: tempApiKeys[provider]
      }))
      toast.success(`${provider} API key saved successfully`)
    } catch (error) {
      console.error(`Failed to save ${provider} API key:`, error)
      toast.error(`Failed to save ${provider} API key`)
    } finally {
      setSaving(false)
    }
  }

  const handleTestAPIKey = async (provider) => {
    try {
      setTestingKeys(prev => ({ ...prev, [provider]: true }))
      const isValid = await TestAPIKey(provider, tempApiKeys[provider])
      if (isValid) {
        toast.success(`${provider} API key is valid`)
      } else {
        toast.error(`${provider} API key is invalid`)
      }
    } catch (error) {
      console.error(`Failed to test ${provider} API key:`, error)
      toast.error(`Failed to test ${provider} API key`)
    } finally {
      setTestingKeys(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleSaveConfig = async () => {
    try {
      setSaving(true)
      await UpdateConfig(tempConfig)
      setConfig(tempConfig)
      toast.success('Configuration saved successfully')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const maskApiKey = (key) => {
    if (!key) return ''
    return key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '****'
  }

  const apiProviders = [
    {
      name: 'OpenAI',
      key: 'openai',
      description: 'GPT models for AI-powered security analysis',
      icon: Bot,
      color: 'bg-green-500',
      placeholder: 'sk-...',
      helpText: 'Get your API key from OpenAI Dashboard'
    },
    {
      name: 'Google Gemini',
      key: 'gemini',
      description: 'Gemini models for enhanced security insights',
      icon: Globe,
      color: 'bg-blue-500',
      placeholder: 'AI...',
      helpText: 'Get your API key from Google AI Studio'
    },
    {
      name: 'Anthropic Claude',
      key: 'claude',
      description: 'Claude models for detailed security reports',
      icon: Shield,
      color: 'bg-purple-500',
      placeholder: 'sk-ant-...',
      helpText: 'Get your API key from Anthropic Console'
    }
  ]

  const configSections = [
    {
      title: 'Scanning Configuration',
      icon: Sliders,
      fields: [
        {
          key: 'defaultTimeout',
          label: 'Default Scan Timeout (seconds)',
          type: 'number',
          min: 60,
          max: 1800,
          description: 'Maximum time to wait for scan completion'
        },
        {
          key: 'maxConcurrentScans',
          label: 'Max Concurrent Scans',
          type: 'number',
          min: 1,
          max: 10,
          description: 'Maximum number of simultaneous scans'
        },
        {
          key: 'enableDeepScan',
          label: 'Enable Deep Scan by Default',
          type: 'checkbox',
          description: 'Perform comprehensive analysis by default'
        },
        {
          key: 'retryFailedScans',
          label: 'Auto-retry Failed Scans',
          type: 'checkbox',
          description: 'Automatically retry failed scans once'
        }
      ]
    },
    {
      title: 'Storage & Data',
      icon: Database,
      fields: [
        {
          key: 'maxStoredScans',
          label: 'Max Stored Scans',
          type: 'number',
          min: 10,
          max: 1000,
          description: 'Maximum number of scans to keep in storage'
        },
        {
          key: 'autoDeleteOldScans',
          label: 'Auto-delete Old Scans',
          type: 'checkbox',
          description: 'Automatically delete scans older than 30 days'
        },
        {
          key: 'exportPath',
          label: 'Default Export Path',
          type: 'text',
          description: 'Default directory for exported reports'
        }
      ]
    },
    {
      title: 'AI & Reporting',
      icon: Bot,
      fields: [
        {
          key: 'defaultAIProvider',
          label: 'Default AI Provider',
          type: 'select',
          options: [
            { value: 'openai', label: 'OpenAI GPT' },
            { value: 'gemini', label: 'Google Gemini' },
            { value: 'claude', label: 'Anthropic Claude' }
          ],
          description: 'Preferred AI provider for report generation'
        },
        {
          key: 'aiReportDetail',
          label: 'AI Report Detail Level',
          type: 'select',
          options: [
            { value: 'basic', label: 'Basic' },
            { value: 'detailed', label: 'Detailed' },
            { value: 'comprehensive', label: 'Comprehensive' }
          ],
          description: 'Level of detail in AI-generated reports'
        },
        {
          key: 'autoGenerateAIReport',
          label: 'Auto-generate AI Reports',
          type: 'checkbox',
          description: 'Automatically generate AI reports for completed scans'
        }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
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
              <SettingsIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Configure API keys, scanning options, and application preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* API Keys Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>API Keys</span>
              </CardTitle>
              <CardDescription>
                Configure API keys for AI-powered security analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiProviders.map((provider) => {
                const Icon = provider.icon
                const isTestingKey = testingKeys[provider.key]
                const currentKey = tempApiKeys[provider.key] || ''
                const savedKey = apiKeys[provider.key] || ''
                const hasChanges = currentKey !== savedKey
                const isVisible = showKeys[provider.key]

                return (
                  <div key={provider.key} className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${provider.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      {savedKey && (
                        <Badge variant="outline" className="text-green-500 border-green-500/20">
                          Configured
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={currentKey}
                          onChange={(e) => handleApiKeyChange(provider.key, e.target.value)}
                          placeholder={provider.placeholder}
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(provider.key)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {currentKey && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestAPIKey(provider.key)}
                            disabled={isTestingKey}
                          >
                            {isTestingKey ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4 mr-2" />
                            )}
                            Test
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveApiKey(provider.key)}
                            disabled={saving || !hasChanges}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          {hasChanges && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500/20">
                              Unsaved changes
                            </Badge>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Info className="w-3 h-3" />
                        <span>{provider.helpText}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Custom AI Providers Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Custom AI Providers</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddCustomProvider(true)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Provider
                </Button>
              </CardTitle>
              <CardDescription>
                Add custom AI API endpoints for specialized security analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddCustomProvider && (
                <div className="space-y-4 p-4 border border-dashed border-primary rounded-lg">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Custom AI Provider</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Provider Name</label>
                      <input
                        type="text"
                        value={newCustomProvider.name}
                        onChange={(e) => setNewCustomProvider(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., My Custom AI"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Endpoint</label>
                      <input
                        type="url"
                        value={newCustomProvider.endpoint}
                        onChange={(e) => setNewCustomProvider(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com/v1/chat"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <input
                      type="text"
                      value={newCustomProvider.description}
                      onChange={(e) => setNewCustomProvider(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this AI provider"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Add custom provider logic
                        const provider = {
                          ...newCustomProvider,
                          key: newCustomProvider.name.toLowerCase().replace(/\s+/g, '_'),
                          icon: ExternalLink,
                          color: 'bg-indigo-500'
                        }
                        setCustomProviders(prev => [...prev, provider])
                        setNewCustomProvider({ name: '', endpoint: '', headers: {}, description: '' })
                        setShowAddCustomProvider(false)
                        toast.success('Custom provider added successfully!')
                      }}
                      disabled={!newCustomProvider.name || !newCustomProvider.endpoint}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Add Provider
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddCustomProvider(false)
                        setNewCustomProvider({ name: '', endpoint: '', headers: {}, description: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {customProviders.length === 0 && !showAddCustomProvider && (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No custom AI providers configured</p>
                  <p className="text-sm">Click "Add Provider" to add a custom AI endpoint</p>
                </div>
              )}

              {customProviders.map((provider, index) => {
                const Icon = provider.icon
                const isTestingKey = testingKeys[provider.key]
                const currentKey = tempApiKeys[provider.key] || ''
                const savedKey = apiKeys[provider.key] || ''
                const hasChanges = currentKey !== savedKey
                const isVisible = showKeys[provider.key]

                return (
                  <div key={provider.key} className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${provider.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                          <p className="text-xs text-muted-foreground">{provider.endpoint}</p>
                        </div>
                        {savedKey && (
                          <Badge variant="outline" className="text-green-500 border-green-500/20">
                            Configured
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCustomProviders(prev => prev.filter((_, i) => i !== index))
                          toast.success('Custom provider removed')
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={currentKey}
                          onChange={(e) => handleApiKeyChange(provider.key, e.target.value)}
                          placeholder="Enter API key for this provider"
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(provider.key)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {currentKey && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestAPIKey(provider.key)}
                            disabled={isTestingKey}
                          >
                            {isTestingKey ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4 mr-2" />
                            )}
                            Test
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveApiKey(provider.key)}
                            disabled={saving || !hasChanges}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          {hasChanges && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500/20">
                              Unsaved changes
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Configuration Sections */}
          {configSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={tempConfig[field.key] || ''}
                          onChange={(e) => handleConfigChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={tempConfig[field.key] || field.min || 0}
                          onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value) || field.min || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      )}

                      {field.type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={tempConfig[field.key] || false}
                            onChange={(e) => handleConfigChange(field.key, e.target.checked)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className="text-sm">Enable</span>
                        </div>
                      )}

                      {field.type === 'select' && (
                        <select
                          value={tempConfig[field.key] || ''}
                          onChange={(e) => handleConfigChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.description && (
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">API Keys</span>
                </div>
                <Badge variant="outline">
                  {Object.keys(apiKeys).filter(key => apiKeys[key]).length}/{apiProviders.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Security</span>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/20">
                  Secure
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Storage</span>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500/20">
                  Local
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuration Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <p>API keys are stored securely and encrypted locally</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <p>Test API keys after configuration to ensure they work</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <p>Higher timeout values allow for more thorough scans</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <p>Enable auto-deletion to manage storage space</p>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" size="sm">
                <Info className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings 