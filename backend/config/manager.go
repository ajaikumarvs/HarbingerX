package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/syndtr/goleveldb/leveldb"
)

type Manager struct {
	db    *leveldb.DB
	mutex sync.RWMutex
}

type APIKeyConfig struct {
	Provider      string    `json:"provider"`
	Key           string    `json:"key"`
	IsValid       bool      `json:"isValid"`
	LastValidated time.Time `json:"lastValidated"`
	Usage         Usage     `json:"usage"`
}

type Usage struct {
	Requests int     `json:"requests"`
	Tokens   int     `json:"tokens"`
	Cost     float64 `json:"cost"`
}

type AppConfig struct {
	APIKeys           map[string]APIKeyConfig `json:"apiKeys"`
	DefaultScanConfig ScanConfig              `json:"defaultScanConfig"`
	ExportSettings    ExportSettings          `json:"exportSettings"`
	Theme             string                  `json:"theme"`
	Notifications     NotificationSettings    `json:"notifications"`
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

type ExportSettings struct {
	DefaultFormat     string   `json:"defaultFormat"`
	IncludeCharts     bool     `json:"includeCharts"`
	IncludeAIAnalysis bool     `json:"includeAIAnalysis"`
	Branding          Branding `json:"branding"`
}

type Branding struct {
	CompanyName string `json:"companyName"`
	Logo        string `json:"logo"`
	Colors      Colors `json:"colors"`
}

type Colors struct {
	Primary   string `json:"primary"`
	Secondary string `json:"secondary"`
}

type NotificationSettings struct {
	ScanComplete       bool   `json:"scanComplete"`
	VulnerabilityFound bool   `json:"vulnerabilityFound"`
	HighRiskDetected   bool   `json:"highRiskDetected"`
	Email              string `json:"email"`
	Webhook            string `json:"webhook"`
}

func NewManager() *Manager {
	// Create config directory
	configDir := getConfigDir()
	if err := os.MkdirAll(configDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create config directory: %v", err))
	}

	// Open database
	dbPath := filepath.Join(configDir, "config.db")
	db, err := leveldb.OpenFile(dbPath, nil)
	if err != nil {
		panic(fmt.Sprintf("Failed to open config database: %v", err))
	}

	manager := &Manager{
		db: db,
	}

	// Initialize default config if not exists
	manager.initializeDefaults()

	return manager
}

func (m *Manager) SaveAPIKey(provider, key string) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	apiKeyConfig := APIKeyConfig{
		Provider:      provider,
		Key:           key,
		IsValid:       false, // Will be validated separately
		LastValidated: time.Now(),
		Usage: Usage{
			Requests: 0,
			Tokens:   0,
			Cost:     0.0,
		},
	}

	data, err := json.Marshal(apiKeyConfig)
	if err != nil {
		return err
	}

	return m.db.Put([]byte("apikey_"+provider), data, nil)
}

func (m *Manager) GetAPIKeys() map[string]string {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	keys := make(map[string]string)
	iter := m.db.NewIterator(nil, nil)
	defer iter.Release()

	for iter.Next() {
		key := string(iter.Key())
		if !strings.HasPrefix(key, "apikey_") {
			continue
		}

		var apiKeyConfig APIKeyConfig
		if err := json.Unmarshal(iter.Value(), &apiKeyConfig); err != nil {
			continue
		}

		provider := key[7:] // Remove "apikey_" prefix
		keys[provider] = apiKeyConfig.Key
	}

	return keys
}

func (m *Manager) GetConfig() map[string]interface{} {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	// Get main config
	data, err := m.db.Get([]byte("app_config"), nil)
	if err != nil {
		return m.getDefaultConfig()
	}

	var config AppConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return m.getDefaultConfig()
	}

	return map[string]interface{}{
		"apiKeys":           config.APIKeys,
		"defaultScanConfig": config.DefaultScanConfig,
		"exportSettings":    config.ExportSettings,
		"theme":             config.Theme,
		"notifications":     config.Notifications,
	}
}

func (m *Manager) UpdateConfig(configUpdate map[string]interface{}) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// Get current config
	currentConfig := m.getDefaultAppConfig()
	data, err := m.db.Get([]byte("app_config"), nil)
	if err == nil {
		json.Unmarshal(data, &currentConfig)
	}

	// Update fields
	if theme, ok := configUpdate["theme"].(string); ok {
		currentConfig.Theme = theme
	}

	if exportSettings, ok := configUpdate["exportSettings"].(map[string]interface{}); ok {
		m.updateExportSettings(&currentConfig.ExportSettings, exportSettings)
	}

	if notifications, ok := configUpdate["notifications"].(map[string]interface{}); ok {
		m.updateNotificationSettings(&currentConfig.Notifications, notifications)
	}

	if defaultScanConfig, ok := configUpdate["defaultScanConfig"].(map[string]interface{}); ok {
		m.updateScanConfig(&currentConfig.DefaultScanConfig, defaultScanConfig)
	}

	// Save updated config
	data, err = json.Marshal(currentConfig)
	if err != nil {
		return err
	}

	return m.db.Put([]byte("app_config"), data, nil)
}

func (m *Manager) ValidateAPIKey(provider, key string) bool {
	// This would typically make an API call to validate the key
	// For now, just check if the key is not empty
	return key != ""
}

func (m *Manager) UpdateAPIKeyUsage(provider string, requests, tokens int, cost float64) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	data, err := m.db.Get([]byte("apikey_"+provider), nil)
	if err != nil {
		return err
	}

	var apiKeyConfig APIKeyConfig
	if err := json.Unmarshal(data, &apiKeyConfig); err != nil {
		return err
	}

	apiKeyConfig.Usage.Requests += requests
	apiKeyConfig.Usage.Tokens += tokens
	apiKeyConfig.Usage.Cost += cost

	data, err = json.Marshal(apiKeyConfig)
	if err != nil {
		return err
	}

	return m.db.Put([]byte("apikey_"+provider), data, nil)
}

func (m *Manager) initializeDefaults() {
	// Check if config already exists
	_, err := m.db.Get([]byte("app_config"), nil)
	if err == nil {
		return // Config already exists
	}

	// Create default config
	defaultConfig := m.getDefaultAppConfig()
	data, err := json.Marshal(defaultConfig)
	if err != nil {
		return
	}

	m.db.Put([]byte("app_config"), data, nil)
}

func (m *Manager) getDefaultAppConfig() AppConfig {
	return AppConfig{
		APIKeys: make(map[string]APIKeyConfig),
		DefaultScanConfig: ScanConfig{
			ScanType:          "standard",
			IncludeSubdomains: false,
			MaxDepth:          3,
			Timeout:           30,
			UserAgent:         "HarbingerX/1.0",
			Headers:           make(map[string]string),
			ExcludePaths:      []string{},
			TechnicalScan:     true,
			VulnerabilityScan: true,
			ComplianceScan:    false,
			PerformanceScan:   false,
		},
		ExportSettings: ExportSettings{
			DefaultFormat:     "pdf",
			IncludeCharts:     true,
			IncludeAIAnalysis: true,
			Branding: Branding{
				CompanyName: "HarbingerX Security",
				Logo:        "",
				Colors: Colors{
					Primary:   "#6366f1",
					Secondary: "#4f46e5",
				},
			},
		},
		Theme: "dark",
		Notifications: NotificationSettings{
			ScanComplete:       true,
			VulnerabilityFound: true,
			HighRiskDetected:   true,
			Email:              "",
			Webhook:            "",
		},
	}
}

func (m *Manager) getDefaultConfig() map[string]interface{} {
	config := m.getDefaultAppConfig()
	return map[string]interface{}{
		"apiKeys":           config.APIKeys,
		"defaultScanConfig": config.DefaultScanConfig,
		"exportSettings":    config.ExportSettings,
		"theme":             config.Theme,
		"notifications":     config.Notifications,
	}
}

func (m *Manager) updateExportSettings(current *ExportSettings, updates map[string]interface{}) {
	if format, ok := updates["defaultFormat"].(string); ok {
		current.DefaultFormat = format
	}
	if includeCharts, ok := updates["includeCharts"].(bool); ok {
		current.IncludeCharts = includeCharts
	}
	if includeAIAnalysis, ok := updates["includeAIAnalysis"].(bool); ok {
		current.IncludeAIAnalysis = includeAIAnalysis
	}
	if branding, ok := updates["branding"].(map[string]interface{}); ok {
		if companyName, ok := branding["companyName"].(string); ok {
			current.Branding.CompanyName = companyName
		}
		if colors, ok := branding["colors"].(map[string]interface{}); ok {
			if primary, ok := colors["primary"].(string); ok {
				current.Branding.Colors.Primary = primary
			}
			if secondary, ok := colors["secondary"].(string); ok {
				current.Branding.Colors.Secondary = secondary
			}
		}
	}
}

func (m *Manager) updateNotificationSettings(current *NotificationSettings, updates map[string]interface{}) {
	if scanComplete, ok := updates["scanComplete"].(bool); ok {
		current.ScanComplete = scanComplete
	}
	if vulnerabilityFound, ok := updates["vulnerabilityFound"].(bool); ok {
		current.VulnerabilityFound = vulnerabilityFound
	}
	if highRiskDetected, ok := updates["highRiskDetected"].(bool); ok {
		current.HighRiskDetected = highRiskDetected
	}
	if email, ok := updates["email"].(string); ok {
		current.Email = email
	}
	if webhook, ok := updates["webhook"].(string); ok {
		current.Webhook = webhook
	}
}

func (m *Manager) updateScanConfig(current *ScanConfig, updates map[string]interface{}) {
	if scanType, ok := updates["scanType"].(string); ok {
		current.ScanType = scanType
	}
	if includeSubdomains, ok := updates["includeSubdomains"].(bool); ok {
		current.IncludeSubdomains = includeSubdomains
	}
	if maxDepth, ok := updates["maxDepth"].(float64); ok {
		current.MaxDepth = int(maxDepth)
	}
	if timeout, ok := updates["timeout"].(float64); ok {
		current.Timeout = int(timeout)
	}
	if technicalScan, ok := updates["technicalScan"].(bool); ok {
		current.TechnicalScan = technicalScan
	}
	if vulnerabilityScan, ok := updates["vulnerabilityScan"].(bool); ok {
		current.VulnerabilityScan = vulnerabilityScan
	}
	if complianceScan, ok := updates["complianceScan"].(bool); ok {
		current.ComplianceScan = complianceScan
	}
	if performanceScan, ok := updates["performanceScan"].(bool); ok {
		current.PerformanceScan = performanceScan
	}
}

func getConfigDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ".harbingerx"
	}
	return filepath.Join(homeDir, ".harbingerx")
}

func (m *Manager) Close() error {
	return m.db.Close()
}
