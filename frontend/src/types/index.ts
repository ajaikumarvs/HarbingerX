// Core scan types
export interface ScanResult {
  id: string
  url: string
  timestamp: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  techStack: Technology[]
  vulnerabilities: Vulnerability[]
  securityScore: number
  aiAnalysis: AIReport
  predictiveInsights: PredictiveAnalysis
  scanConfig: ScanConfig
  duration: number
  progress: ScanProgress
}

export interface Technology {
  name: string
  version: string
  category: 'framework' | 'library' | 'server' | 'database' | 'cms' | 'other'
  confidence: number
  vulnerabilities: string[]
  deprecated: boolean
  eolDate?: Date
}

export interface Vulnerability {
  cve: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  score: number
  title: string
  description: string
  remediation: string
  rootCause: string
  attackVectors: string[]
  businessImpact: string
  educationalNote: string
  references: string[]
  exploitAvailable: boolean
  patchAvailable: boolean
  discoveredAt: Date
  affectedComponents: string[]
}

export interface ScanConfig {
  scanType: 'quick' | 'standard' | 'deep' | 'custom'
  includeSubdomains: boolean
  maxDepth: number
  timeout: number
  userAgent: string
  headers: Record<string, string>
  excludePaths: string[]
  technicalScan: boolean
  vulnerabilityScan: boolean
  complianceScan: boolean
  performanceScan: boolean
}

export interface ScanProgress {
  percentage: number
  currentStage: string
  eta: number
  tasksCompleted: number
  totalTasks: number
  startTime: Date
  errors: string[]
  warnings: string[]
}

// AI Analysis types
export interface AIReport {
  executiveSummary: string
  technicalAnalysis: string
  rootCauseAnalysis: Record<string, string>
  businessImpact: BusinessRisk
  futureThreats: EmergingThreat[]
  remediationPlan: RemediationStep[]
  educationalInsights: SecurityLesson[]
  complianceGaps: ComplianceGap[]
  riskMatrix: RiskAssessment
}

export interface BusinessRisk {
  overall: 'low' | 'medium' | 'high' | 'critical'
  financial: number
  reputation: number
  operational: number
  regulatory: number
  description: string
  mitigation: string[]
}

export interface EmergingThreat {
  threat: string
  probability: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  timeline: string
  indicators: string[]
  prevention: string[]
}

export interface RemediationStep {
  priority: 'immediate' | 'high' | 'medium' | 'low'
  task: string
  description: string
  effort: 'low' | 'medium' | 'high'
  cost: 'low' | 'medium' | 'high'
  timeline: string
  dependencies: string[]
  verification: string
}

export interface SecurityLesson {
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  explanation: string
  examples: string[]
  bestPractices: string[]
  resources: string[]
}

export interface ComplianceGap {
  standard: string
  requirement: string
  currentState: string
  gap: string
  remediation: string
  priority: 'high' | 'medium' | 'low'
}

export interface RiskAssessment {
  score: number
  category: 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactor[]
  trends: TrendData[]
}

export interface RiskFactor {
  factor: string
  weight: number
  score: number
  justification: string
}

export interface TrendData {
  date: Date
  score: number
  vulnerabilities: number
  resolved: number
}

export interface PredictiveAnalysis {
  riskTrend: 'improving' | 'stable' | 'declining'
  nextReviewDate: Date
  recommendations: string[]
  automation: AutomationOpportunity[]
  investmentAreas: InvestmentArea[]
}

export interface AutomationOpportunity {
  process: string
  effort: string
  savings: string
  tools: string[]
}

export interface InvestmentArea {
  area: string
  priority: number
  roi: string
  timeline: string
}

// UI and Component types
export interface ScanHistoryFilter {
  status?: ScanResult['status']
  severity?: Vulnerability['severity']
  dateRange?: {
    start: Date
    end: Date
  }
  searchTerm?: string
  sortBy?: 'date' | 'score' | 'vulnerabilities'
  sortOrder?: 'asc' | 'desc'
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
    tension?: number
  }[]
}

export interface StatCard {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger'
}

// API and Configuration types
export interface APIKeyConfig {
  provider: 'openai' | 'gemini' | 'claude'
  key: string
  isValid: boolean
  lastValidated: Date
  usage: {
    requests: number
    tokens: number
    cost: number
  }
}

export interface AppConfig {
  apiKeys: Record<string, APIKeyConfig>
  defaultScanConfig: ScanConfig
  exportSettings: ExportSettings
  theme: 'dark' | 'light' | 'auto'
  notifications: NotificationSettings
}

export interface ExportSettings {
  defaultFormat: 'pdf' | 'docx' | 'json' | 'csv'
  includeCharts: boolean
  includeAIAnalysis: boolean
  branding: {
    companyName: string
    logo?: string
    colors: {
      primary: string
      secondary: string
    }
  }
}

export interface NotificationSettings {
  scanComplete: boolean
  vulnerabilityFound: boolean
  highRiskDetected: boolean
  email?: string
  webhook?: string
}

// Event types for real-time updates
export interface ScanEvent {
  type: 'progress' | 'complete' | 'error' | 'vulnerability_found'
  scanId: string
  data: any
  timestamp: Date
}

export interface ProgressEvent extends ScanEvent {
  type: 'progress'
  data: ScanProgress
}

export interface CompleteEvent extends ScanEvent {
  type: 'complete'
  data: ScanResult
}

export interface ErrorEvent extends ScanEvent {
  type: 'error'
  data: {
    message: string
    code: string
    details?: any
  }
}

export interface VulnerabilityFoundEvent extends ScanEvent {
  type: 'vulnerability_found'
  data: Vulnerability
}

// Form types
export interface ScanForm {
  url: string
  scanType: ScanConfig['scanType']
  includeSubdomains: boolean
  aiAnalysis: boolean
  customConfig?: Partial<ScanConfig>
}

export interface SettingsForm {
  apiKeys: {
    openai?: string
    gemini?: string
    claude?: string
  }
  exportSettings: Partial<ExportSettings>
  notifications: Partial<NotificationSettings>
}

// Navigation and routing types
export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  badge?: number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  path?: string
  active?: boolean
}

// Utility types
export type SeverityColor = {
  [K in Vulnerability['severity']]: string
}

export type StatusColor = {
  [K in ScanResult['status']]: string
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
  details?: any
}

// Hook return types
export interface UseScanReturn {
  scan: ScanResult | null
  loading: LoadingState
  error: ErrorState
  startScan: (config: ScanForm) => Promise<string>
  cancelScan: (scanId: string) => Promise<void>
  refreshScan: (scanId: string) => Promise<void>
}

export interface UseHistoryReturn {
  scans: ScanResult[]
  loading: LoadingState
  error: ErrorState
  filters: ScanHistoryFilter
  setFilters: (filters: Partial<ScanHistoryFilter>) => void
  refresh: () => Promise<void>
  deleteScan: (scanId: string) => Promise<void>
}

export interface UseSettingsReturn {
  config: AppConfig
  loading: LoadingState
  error: ErrorState
  updateConfig: (config: Partial<AppConfig>) => Promise<void>
  testAPIKey: (provider: string, key: string) => Promise<boolean>
  resetConfig: () => Promise<void>
} 