package main

import (
	"context"
	"harbingerx/backend/ai"
	"harbingerx/backend/config"
	"harbingerx/backend/scanner"
	"harbingerx/backend/storage"
)

// App struct
type App struct {
	ctx     context.Context
	scanner *scanner.Service
	ai      *ai.Service
	config  *config.Manager
	storage *storage.Manager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize services
	a.config = config.NewManager()
	a.storage = storage.NewManager()
	a.scanner = scanner.NewService(ctx, a.storage)
	a.ai = ai.NewService(a.config)
}

// StartScan initiates a new security scan
func (a *App) StartScan(url string, scanConfig map[string]interface{}) string {
	return a.scanner.StartScan(url, scanConfig)
}

// GetScanStatus returns the current status of a scan
func (a *App) GetScanStatus(scanID string) map[string]interface{} {
	return a.scanner.GetStatus(scanID)
}

// CancelScan stops a running scan
func (a *App) CancelScan(scanID string) error {
	return a.scanner.CancelScan(scanID)
}

// GetScanResult returns the complete scan result
func (a *App) GetScanResult(scanID string) map[string]interface{} {
	return a.storage.GetScanResult(scanID)
}

// GetAllScans returns all stored scan results
func (a *App) GetAllScans() []map[string]interface{} {
	return a.storage.GetAllScans()
}

// DeleteScan removes a scan from storage
func (a *App) DeleteScan(scanID string) error {
	return a.storage.DeleteScan(scanID)
}

// SaveAPIKey stores an API key for AI services
func (a *App) SaveAPIKey(provider string, key string) error {
	return a.config.SaveAPIKey(provider, key)
}

// GetAPIKeys returns all configured API keys
func (a *App) GetAPIKeys() map[string]string {
	return a.config.GetAPIKeys()
}

// TestAPIKey validates an API key
func (a *App) TestAPIKey(provider string, key string) bool {
	return a.ai.TestAPIKey(provider, key)
}

// GetConfig returns the current application configuration
func (a *App) GetConfig() map[string]interface{} {
	return a.config.GetConfig()
}

// UpdateConfig updates the application configuration
func (a *App) UpdateConfig(config map[string]interface{}) error {
	return a.config.UpdateConfig(config)
}

// GenerateAIReport creates an AI-powered analysis report
func (a *App) GenerateAIReport(scanID string, reportType string) map[string]interface{} {
	scanResult := a.storage.GetScanResult(scanID)
	if scanResult == nil {
		return map[string]interface{}{
			"error": "Scan not found",
		}
	}

	return a.ai.GenerateReport(scanResult, reportType)
}

// ExportReport exports a scan report in specified format
func (a *App) ExportReport(scanID string, format string, options map[string]interface{}) string {
	scanResult := a.storage.GetScanResult(scanID)
	if scanResult == nil {
		return ""
	}

	return a.storage.ExportReport(scanResult, format, options)
}

// GetDashboardStats returns statistics for the dashboard
func (a *App) GetDashboardStats() map[string]interface{} {
	return a.storage.GetDashboardStats()
}

// SearchScans searches through scan history
func (a *App) SearchScans(query string, filters map[string]interface{}) []map[string]interface{} {
	return a.storage.SearchScans(query, filters)
}

// GetTrendData returns historical trend data
func (a *App) GetTrendData(period string) map[string]interface{} {
	return a.storage.GetTrendData(period)
}
