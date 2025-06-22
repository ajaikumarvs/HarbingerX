package scanner

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Service struct {
	ctx           context.Context
	storage       Storage
	activeScans   map[string]*ScanInstance
	mutex         sync.RWMutex
	disableEvents bool
}

type Storage interface {
	SaveScanResult(scanID string, result map[string]interface{}) error
	UpdateScanProgress(scanID string, progress map[string]interface{}) error
}

type ScanInstance struct {
	ID       string
	URL      string
	Config   ScanConfig
	Status   string
	Progress ScanProgress
	Result   *ScanResult
	Cancel   context.CancelFunc
	Started  time.Time
}

type ScanConfig struct {
	ScanType          string            `json:"scanType"`
	IncludeSubdomains bool              `json:"includeSubdomains"`
	MaxDepth          int               `json:"maxDepth"`
	Timeout           int               `json:"timeout"`
	UserAgent         string            `json:"userAgent"`
	Headers           map[string]string `json:"headers"`
	ExcludePaths      []string          `json:"excludePaths"`
	TechnicalScan     bool              `json:"technicalScan"`
	VulnerabilityScan bool              `json:"vulnerabilityScan"`
	ComplianceScan    bool              `json:"complianceScan"`
	PerformanceScan   bool              `json:"performanceScan"`
}

type ScanProgress struct {
	Percentage     float64   `json:"percentage"`
	CurrentStage   string    `json:"currentStage"`
	ETA            int       `json:"eta"`
	TasksCompleted int       `json:"tasksCompleted"`
	TotalTasks     int       `json:"totalTasks"`
	StartTime      time.Time `json:"startTime"`
	Errors         []string  `json:"errors"`
	Warnings       []string  `json:"warnings"`
}

type ScanResult struct {
	ID              string            `json:"id"`
	URL             string            `json:"url"`
	Timestamp       time.Time         `json:"timestamp"`
	Status          string            `json:"status"`
	TechStack       []Technology      `json:"techStack"`
	Vulnerabilities []Vulnerability   `json:"vulnerabilities"`
	SecurityScore   int               `json:"securityScore"`
	ScanConfig      ScanConfig        `json:"scanConfig"`
	Duration        int               `json:"duration"`
	Progress        ScanProgress      `json:"progress"`
	Headers         map[string]string `json:"headers"`
	StatusCode      int               `json:"statusCode"`
	ResponseTime    int               `json:"responseTime"`
	SSLInfo         SSLInfo           `json:"sslInfo"`
	DNSInfo         DNSInfo           `json:"dnsInfo"`
}

type Technology struct {
	Name            string    `json:"name"`
	Version         string    `json:"version"`
	Category        string    `json:"category"`
	Confidence      float64   `json:"confidence"`
	Vulnerabilities []string  `json:"vulnerabilities"`
	Deprecated      bool      `json:"deprecated"`
	EOLDate         time.Time `json:"eolDate,omitempty"`
}

type Vulnerability struct {
	CVE                string    `json:"cve"`
	Severity           string    `json:"severity"`
	Score              float64   `json:"score"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	Remediation        string    `json:"remediation"`
	RootCause          string    `json:"rootCause"`
	AttackVectors      []string  `json:"attackVectors"`
	BusinessImpact     string    `json:"businessImpact"`
	EducationalNote    string    `json:"educationalNote"`
	References         []string  `json:"references"`
	ExploitAvailable   bool      `json:"exploitAvailable"`
	PatchAvailable     bool      `json:"patchAvailable"`
	DiscoveredAt       time.Time `json:"discoveredAt"`
	AffectedComponents []string  `json:"affectedComponents"`
}

type SSLInfo struct {
	Valid           bool      `json:"valid"`
	Issuer          string    `json:"issuer"`
	Subject         string    `json:"subject"`
	ExpiryDate      time.Time `json:"expiryDate"`
	Protocol        string    `json:"protocol"`
	CipherSuite     string    `json:"cipherSuite"`
	Grade           string    `json:"grade"`
	Vulnerabilities []string  `json:"vulnerabilities"`
}

type DNSInfo struct {
	Records     map[string][]string `json:"records"`
	DNSSEC      bool                `json:"dnssec"`
	Nameservers []string            `json:"nameservers"`
}

func NewService(ctx context.Context, storage Storage) *Service {
	return &Service{
		ctx:           ctx,
		storage:       storage,
		activeScans:   make(map[string]*ScanInstance),
		disableEvents: false,
	}
}

func NewServiceWithoutEvents(ctx context.Context, storage Storage) *Service {
	return &Service{
		ctx:           ctx,
		storage:       storage,
		activeScans:   make(map[string]*ScanInstance),
		disableEvents: true,
	}
}

func (s *Service) StartScan(targetURL string, config map[string]interface{}) string {
	scanID := uuid.New().String()

	// Parse scan configuration
	scanConfig := s.parseScanConfig(config)

	// Validate URL
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return ""
	}

	// Create scan instance
	ctx, cancel := context.WithCancel(s.ctx)
	scan := &ScanInstance{
		ID:      scanID,
		URL:     parsedURL.String(),
		Config:  scanConfig,
		Status:  "running",
		Cancel:  cancel,
		Started: time.Now(),
		Progress: ScanProgress{
			Percentage:   0,
			CurrentStage: "Initializing",
			StartTime:    time.Now(),
			TotalTasks:   s.calculateTotalTasks(scanConfig),
		},
	}

	s.mutex.Lock()
	s.activeScans[scanID] = scan
	s.mutex.Unlock()

	// Start scan in goroutine
	go s.executeScan(ctx, scan)

	return scanID
}

func (s *Service) GetStatus(scanID string) map[string]interface{} {
	s.mutex.RLock()
	scan, exists := s.activeScans[scanID]
	s.mutex.RUnlock()

	if !exists {
		return map[string]interface{}{
			"error": "Scan not found",
		}
	}

	return map[string]interface{}{
		"id":       scan.ID,
		"status":   scan.Status,
		"progress": scan.Progress,
		"url":      scan.URL,
		"started":  scan.Started,
	}
}

func (s *Service) CancelScan(scanID string) error {
	s.mutex.RLock()
	scan, exists := s.activeScans[scanID]
	s.mutex.RUnlock()

	if !exists {
		return fmt.Errorf("scan not found")
	}

	scan.Cancel()
	scan.Status = "cancelled"

	return nil
}

func (s *Service) executeScan(ctx context.Context, scan *ScanInstance) {
	defer func() {
		s.mutex.Lock()
		delete(s.activeScans, scan.ID)
		s.mutex.Unlock()
	}()

	result := &ScanResult{
		ID:         scan.ID,
		URL:        scan.URL,
		Timestamp:  time.Now(),
		Status:     "running",
		ScanConfig: scan.Config,
	}

	// Stage 1: Initial reconnaissance
	s.updateProgress(scan, 10, "Initial reconnaissance")
	s.performReconnaissance(ctx, result)

	if ctx.Err() != nil {
		scan.Status = "cancelled"
		return
	}

	// Stage 2: Technology detection
	s.updateProgress(scan, 25, "Detecting technologies")
	s.detectTechnologies(ctx, result)

	if ctx.Err() != nil {
		scan.Status = "cancelled"
		return
	}

	// Stage 3: SSL/TLS analysis
	s.updateProgress(scan, 40, "Analyzing SSL/TLS")
	s.analyzeSSL(ctx, result)

	if ctx.Err() != nil {
		scan.Status = "cancelled"
		return
	}

	// Stage 4: Vulnerability scanning
	if scan.Config.VulnerabilityScan {
		s.updateProgress(scan, 60, "Scanning for vulnerabilities")
		s.scanVulnerabilities(ctx, result)
	}

	if ctx.Err() != nil {
		scan.Status = "cancelled"
		return
	}

	// Stage 5: Security score calculation
	s.updateProgress(scan, 80, "Calculating security score")
	s.calculateSecurityScore(result)

	// Stage 6: Finalization
	s.updateProgress(scan, 100, "Finalizing scan")
	result.Status = "completed"
	result.Duration = int(time.Since(scan.Started).Seconds())

	scan.Result = result
	scan.Status = "completed"

	// Save to storage
	if s.storage != nil {
		s.storage.SaveScanResult(scan.ID, s.resultToMap(result))
	}

	// Emit completion event (only if running in Wails context)
	if !s.disableEvents {
		func() {
			defer func() {
				if r := recover(); r != nil {
					// Ignore runtime context errors when running outside Wails
				}
			}()
			runtime.EventsEmit(s.ctx, "scan:complete", map[string]interface{}{
				"scanId": scan.ID,
				"result": s.resultToMap(result),
			})
		}()
	}
}

func (s *Service) performReconnaissance(ctx context.Context, result *ScanResult) {
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	start := time.Now()
	resp, err := client.Get(result.URL)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	result.StatusCode = resp.StatusCode
	result.ResponseTime = int(time.Since(start).Milliseconds())
	result.Headers = make(map[string]string)

	for key, values := range resp.Header {
		result.Headers[key] = strings.Join(values, ", ")
	}
}

func (s *Service) detectTechnologies(ctx context.Context, result *ScanResult) {
	// Simulate technology detection based on headers and response
	technologies := []Technology{
		{
			Name:       "Nginx",
			Version:    "1.18.0",
			Category:   "server",
			Confidence: 0.95,
		},
		{
			Name:       "React",
			Version:    "18.0.0",
			Category:   "framework",
			Confidence: 0.85,
		},
	}

	// Check server header
	if server, exists := result.Headers["Server"]; exists {
		if strings.Contains(strings.ToLower(server), "nginx") {
			technologies = append(technologies, Technology{
				Name:       "Nginx",
				Version:    "unknown",
				Category:   "server",
				Confidence: 0.9,
			})
		}
	}

	result.TechStack = technologies
}

func (s *Service) analyzeSSL(ctx context.Context, result *ScanResult) {
	parsedURL, _ := url.Parse(result.URL)
	if parsedURL.Scheme != "https" {
		return
	}

	// Simulate SSL analysis
	result.SSLInfo = SSLInfo{
		Valid:       true,
		Issuer:      "Let's Encrypt Authority X3",
		Subject:     parsedURL.Host,
		ExpiryDate:  time.Now().Add(90 * 24 * time.Hour),
		Protocol:    "TLS 1.3",
		CipherSuite: "TLS_AES_256_GCM_SHA384",
		Grade:       "A",
	}
}

func (s *Service) scanVulnerabilities(ctx context.Context, result *ScanResult) {
	// Simulate vulnerability detection
	vulnerabilities := []Vulnerability{
		{
			CVE:             "CVE-2021-44228",
			Severity:        "critical",
			Score:           10.0,
			Title:           "Log4j Remote Code Execution",
			Description:     "Apache Log4j2 JNDI features do not protect against attacker controlled LDAP and other JNDI related endpoints.",
			Remediation:     "Update Log4j to version 2.17.0 or later",
			RootCause:       "Unsafe deserialization in Log4j library",
			AttackVectors:   []string{"JNDI injection", "Remote code execution"},
			BusinessImpact:  "Critical - Full system compromise possible",
			EducationalNote: "This vulnerability allows attackers to execute arbitrary code by exploiting JNDI lookup functionality.",
			References: []string{
				"https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
				"https://logging.apache.org/log4j/2.x/security.html",
			},
			ExploitAvailable:   true,
			PatchAvailable:     true,
			DiscoveredAt:       time.Now(),
			AffectedComponents: []string{"Apache Log4j"},
		},
	}

	result.Vulnerabilities = vulnerabilities
}

func (s *Service) calculateSecurityScore(result *ScanResult) {
	score := 100

	// Deduct points for vulnerabilities
	for _, vuln := range result.Vulnerabilities {
		switch vuln.Severity {
		case "critical":
			score -= 30
		case "high":
			score -= 20
		case "medium":
			score -= 10
		case "low":
			score -= 5
		}
	}

	// Deduct points for missing security headers
	securityHeaders := []string{"Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options"}
	for _, header := range securityHeaders {
		if _, exists := result.Headers[header]; !exists {
			score -= 5
		}
	}

	if score < 0 {
		score = 0
	}

	result.SecurityScore = score
}

func (s *Service) updateProgress(scan *ScanInstance, percentage float64, stage string) {
	scan.Progress.Percentage = percentage
	scan.Progress.CurrentStage = stage
	scan.Progress.TasksCompleted = int(percentage / 100 * float64(scan.Progress.TotalTasks))

	// Calculate ETA
	elapsed := time.Since(scan.Progress.StartTime)
	if percentage > 0 {
		totalTime := elapsed * time.Duration(100/percentage)
		scan.Progress.ETA = int((totalTime - elapsed).Seconds())
	}

	// Update storage
	if s.storage != nil {
		s.storage.UpdateScanProgress(scan.ID, map[string]interface{}{
			"percentage":     scan.Progress.Percentage,
			"currentStage":   scan.Progress.CurrentStage,
			"eta":            scan.Progress.ETA,
			"tasksCompleted": scan.Progress.TasksCompleted,
		})
	}

	// Emit progress event (only if running in Wails context)
	if !s.disableEvents {
		func() {
			defer func() {
				if r := recover(); r != nil {
					// Ignore runtime context errors when running outside Wails
				}
			}()
			runtime.EventsEmit(s.ctx, "scan:progress", map[string]interface{}{
				"scanId":   scan.ID,
				"progress": scan.Progress,
			})
		}()
	}
}

func (s *Service) parseScanConfig(config map[string]interface{}) ScanConfig {
	scanConfig := ScanConfig{
		ScanType:          "standard",
		IncludeSubdomains: false,
		MaxDepth:          3,
		Timeout:           30,
		UserAgent:         "HarbingerX/1.0",
		Headers:           make(map[string]string),
		TechnicalScan:     true,
		VulnerabilityScan: true,
		ComplianceScan:    false,
		PerformanceScan:   false,
	}

	if val, ok := config["scanType"].(string); ok {
		scanConfig.ScanType = val
	}
	if val, ok := config["includeSubdomains"].(bool); ok {
		scanConfig.IncludeSubdomains = val
	}
	if val, ok := config["maxDepth"].(float64); ok {
		scanConfig.MaxDepth = int(val)
	}
	if val, ok := config["timeout"].(float64); ok {
		scanConfig.Timeout = int(val)
	}
	if val, ok := config["vulnerabilityScan"].(bool); ok {
		scanConfig.VulnerabilityScan = val
	}

	return scanConfig
}

func (s *Service) calculateTotalTasks(config ScanConfig) int {
	tasks := 5 // Base tasks: recon, tech detection, SSL, score, finalization

	if config.VulnerabilityScan {
		tasks += 3
	}
	if config.ComplianceScan {
		tasks += 2
	}
	if config.PerformanceScan {
		tasks += 2
	}

	return tasks
}

func (s *Service) resultToMap(result *ScanResult) map[string]interface{} {
	return map[string]interface{}{
		"id":              result.ID,
		"url":             result.URL,
		"timestamp":       result.Timestamp,
		"status":          result.Status,
		"techStack":       result.TechStack,
		"vulnerabilities": result.Vulnerabilities,
		"securityScore":   result.SecurityScore,
		"scanConfig":      result.ScanConfig,
		"duration":        result.Duration,
		"progress":        result.Progress,
		"headers":         result.Headers,
		"statusCode":      result.StatusCode,
		"responseTime":    result.ResponseTime,
		"sslInfo":         result.SSLInfo,
		"dnsInfo":         result.DNSInfo,
	}
}
