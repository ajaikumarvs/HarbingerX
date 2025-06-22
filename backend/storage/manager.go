package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/syndtr/goleveldb/leveldb"
)

type Manager struct {
	db    *leveldb.DB
	mutex sync.RWMutex
}

func NewManager() *Manager {
	// Create data directory
	dataDir := getDataDir()
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create data directory: %v", err))
	}

	// Open database
	dbPath := filepath.Join(dataDir, "scans.db")
	db, err := leveldb.OpenFile(dbPath, nil)
	if err != nil {
		panic(fmt.Sprintf("Failed to open storage database: %v", err))
	}

	return &Manager{
		db: db,
	}
}

func (m *Manager) SaveScanResult(scanID string, result map[string]interface{}) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	data, err := json.Marshal(result)
	if err != nil {
		return err
	}

	return m.db.Put([]byte("scan_"+scanID), data, nil)
}

func (m *Manager) GetScanResult(scanID string) map[string]interface{} {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	data, err := m.db.Get([]byte("scan_"+scanID), nil)
	if err != nil {
		return nil
	}

	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		return nil
	}

	return result
}

func (m *Manager) GetAllScans() []map[string]interface{} {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	var scans []map[string]interface{}
	iter := m.db.NewIterator(nil, nil)
	defer iter.Release()

	for iter.Next() {
		key := string(iter.Key())
		if !strings.HasPrefix(key, "scan_") {
			continue
		}

		var scan map[string]interface{}
		if err := json.Unmarshal(iter.Value(), &scan); err != nil {
			continue
		}

		scans = append(scans, scan)
	}

	// Sort by timestamp (newest first)
	sort.Slice(scans, func(i, j int) bool {
		ti, _ := time.Parse(time.RFC3339, scans[i]["timestamp"].(string))
		tj, _ := time.Parse(time.RFC3339, scans[j]["timestamp"].(string))
		return ti.After(tj)
	})

	return scans
}

func (m *Manager) DeleteScan(scanID string) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	return m.db.Delete([]byte("scan_"+scanID), nil)
}

func (m *Manager) UpdateScanProgress(scanID string, progress map[string]interface{}) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// Get existing scan
	data, err := m.db.Get([]byte("scan_"+scanID), nil)
	if err != nil {
		return err
	}

	var scan map[string]interface{}
	if err := json.Unmarshal(data, &scan); err != nil {
		return err
	}

	// Update progress
	scan["progress"] = progress

	// Save back
	updatedData, err := json.Marshal(scan)
	if err != nil {
		return err
	}

	return m.db.Put([]byte("scan_"+scanID), updatedData, nil)
}

func (m *Manager) SearchScans(query string, filters map[string]interface{}) []map[string]interface{} {
	scans := m.GetAllScans()
	var filtered []map[string]interface{}

	for _, scan := range scans {
		if m.matchesFilters(scan, query, filters) {
			filtered = append(filtered, scan)
		}
	}

	return filtered
}

func (m *Manager) GetDashboardStats() map[string]interface{} {
	scans := m.GetAllScans()

	stats := map[string]interface{}{
		"totalScans":         len(scans),
		"completedScans":     0,
		"runningScans":       0,
		"failedScans":        0,
		"averageScore":       0.0,
		"totalVulns":         0,
		"criticalVulns":      0,
		"highVulns":          0,
		"recentActivity":     []map[string]interface{}{},
		"topVulnerabilities": []map[string]interface{}{},
		"scoreDistribution":  map[string]int{},
	}

	var totalScore float64
	completedCount := 0
	vulnCounts := make(map[string]int)

	for _, scan := range scans {
		status := scan["status"].(string)
		switch status {
		case "completed":
			stats["completedScans"] = stats["completedScans"].(int) + 1
			completedCount++
			if score, ok := scan["securityScore"].(float64); ok {
				totalScore += score
			}
		case "running":
			stats["runningScans"] = stats["runningScans"].(int) + 1
		case "failed":
			stats["failedScans"] = stats["failedScans"].(int) + 1
		}

		// Count vulnerabilities
		if vulns, ok := scan["vulnerabilities"].([]interface{}); ok {
			for _, vuln := range vulns {
				if v, ok := vuln.(map[string]interface{}); ok {
					severity := v["severity"].(string)
					vulnCounts[severity]++
					stats["totalVulns"] = stats["totalVulns"].(int) + 1

					if severity == "critical" {
						stats["criticalVulns"] = stats["criticalVulns"].(int) + 1
					} else if severity == "high" {
						stats["highVulns"] = stats["highVulns"].(int) + 1
					}
				}
			}
		}
	}

	if completedCount > 0 {
		stats["averageScore"] = totalScore / float64(completedCount)
	}

	return stats
}

func (m *Manager) GetTrendData(period string) map[string]interface{} {
	scans := m.GetAllScans()

	// Calculate trends based on period
	trends := map[string]interface{}{
		"scores":          []map[string]interface{}{},
		"vulnerabilities": []map[string]interface{}{},
		"scanCount":       []map[string]interface{}{},
	}

	// Group scans by time period
	timeGroups := make(map[string][]map[string]interface{})

	for _, scan := range scans {
		if timestampStr, ok := scan["timestamp"].(string); ok {
			timestamp, err := time.Parse(time.RFC3339, timestampStr)
			if err != nil {
				continue
			}

			var key string
			switch period {
			case "daily":
				key = timestamp.Format("2006-01-02")
			case "weekly":
				year, week := timestamp.ISOWeek()
				key = fmt.Sprintf("%d-W%02d", year, week)
			case "monthly":
				key = timestamp.Format("2006-01")
			default:
				key = timestamp.Format("2006-01-02")
			}

			timeGroups[key] = append(timeGroups[key], scan)
		}
	}

	// Calculate aggregated data for each time period
	for timeKey, groupScans := range timeGroups {
		var totalScore float64
		var vulnCount int
		completedCount := 0

		for _, scan := range groupScans {
			if scan["status"].(string) == "completed" {
				completedCount++
				if score, ok := scan["securityScore"].(float64); ok {
					totalScore += score
				}

				if vulns, ok := scan["vulnerabilities"].([]interface{}); ok {
					vulnCount += len(vulns)
				}
			}
		}

		avgScore := 0.0
		if completedCount > 0 {
			avgScore = totalScore / float64(completedCount)
		}

		trends["scores"] = append(trends["scores"].([]map[string]interface{}), map[string]interface{}{
			"date":  timeKey,
			"score": avgScore,
		})

		trends["vulnerabilities"] = append(trends["vulnerabilities"].([]map[string]interface{}), map[string]interface{}{
			"date":  timeKey,
			"count": vulnCount,
		})

		trends["scanCount"] = append(trends["scanCount"].([]map[string]interface{}), map[string]interface{}{
			"date":  timeKey,
			"count": len(groupScans),
		})
	}

	return trends
}

func (m *Manager) ExportReport(scanResult map[string]interface{}, format string, options map[string]interface{}) string {
	switch format {
	case "pdf":
		return m.exportToPDF(scanResult, options)
	case "json":
		return m.exportToJSON(scanResult, options)
	default:
		return ""
	}
}

func (m *Manager) exportToPDF(scanResult map[string]interface{}, options map[string]interface{}) string {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	// Title
	pdf.Cell(40, 10, "HarbingerX Security Report")
	pdf.Ln(12)

	// URL
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("URL: %v", scanResult["url"]))
	pdf.Ln(8)

	// Security Score
	pdf.Cell(40, 10, fmt.Sprintf("Security Score: %v/100", scanResult["securityScore"]))
	pdf.Ln(8)

	// Timestamp
	pdf.Cell(40, 10, fmt.Sprintf("Scan Date: %v", scanResult["timestamp"]))
	pdf.Ln(12)

	// Vulnerabilities section
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Vulnerabilities")
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 10)
	if vulns, ok := scanResult["vulnerabilities"].([]interface{}); ok {
		for _, vuln := range vulns {
			if v, ok := vuln.(map[string]interface{}); ok {
				pdf.Cell(40, 6, fmt.Sprintf("- %s (%s)", v["title"], v["severity"]))
				pdf.Ln(6)
			}
		}
	}

	// Save to file
	filename := fmt.Sprintf("report_%s_%d.pdf",
		strings.ReplaceAll(scanResult["id"].(string), "-", ""),
		time.Now().Unix())
	filepath := filepath.Join(getDataDir(), filename)

	if err := pdf.OutputFileAndClose(filepath); err != nil {
		return ""
	}

	return filepath
}

func (m *Manager) exportToJSON(scanResult map[string]interface{}, options map[string]interface{}) string {
	filename := fmt.Sprintf("report_%s_%d.json",
		strings.ReplaceAll(scanResult["id"].(string), "-", ""),
		time.Now().Unix())
	filepath := filepath.Join(getDataDir(), filename)

	data, err := json.MarshalIndent(scanResult, "", "  ")
	if err != nil {
		return ""
	}

	if err := os.WriteFile(filepath, data, 0644); err != nil {
		return ""
	}

	return filepath
}

func (m *Manager) matchesFilters(scan map[string]interface{}, query string, filters map[string]interface{}) bool {
	// Text search
	if query != "" {
		url := strings.ToLower(scan["url"].(string))
		if !strings.Contains(url, strings.ToLower(query)) {
			return false
		}
	}

	// Status filter
	if status, ok := filters["status"].(string); ok && status != "" {
		if scan["status"].(string) != status {
			return false
		}
	}

	// Severity filter (based on highest vulnerability severity)
	if severity, ok := filters["severity"].(string); ok && severity != "" {
		if !m.hasVulnerabilityWithSeverity(scan, severity) {
			return false
		}
	}

	return true
}

func (m *Manager) hasVulnerabilityWithSeverity(scan map[string]interface{}, severity string) bool {
	if vulns, ok := scan["vulnerabilities"].([]interface{}); ok {
		for _, vuln := range vulns {
			if v, ok := vuln.(map[string]interface{}); ok {
				if v["severity"].(string) == severity {
					return true
				}
			}
		}
	}
	return false
}

func getDataDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ".harbingerx/data"
	}
	return filepath.Join(homeDir, ".harbingerx", "data")
}

func (m *Manager) Close() error {
	return m.db.Close()
}
