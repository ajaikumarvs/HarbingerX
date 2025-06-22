package main

import (
	"context"
	"fmt"
	"harbingerx/backend/ai"
	"harbingerx/backend/config"
	"harbingerx/backend/scanner"
	"harbingerx/backend/storage"
	"time"
)

func main() {
	fmt.Println("🚀 HarbingerX Backend Integration Testing")
	fmt.Println("==========================================")

	// Initialize services
	ctx := context.Background()
	configManager := config.NewManager()
	storageManager := storage.NewManager()
	scannerService := scanner.NewServiceWithoutEvents(ctx, storageManager)
	aiService := ai.NewService(configManager)

	// Test 1: Configuration Management
	fmt.Println("\n1. Testing Configuration Management...")
	testConfigurationManagement(configManager)

	// Test 2: Storage Operations
	fmt.Println("\n2. Testing Storage Operations...")
	testStorageOperations(storageManager)

	// Test 3: Scan Functionality
	fmt.Println("\n3. Testing Scan Functionality...")
	scanID := testScanFunctionality(scannerService)

	// Test 4: AI Report Generation (if scanID is available)
	if scanID != "" {
		fmt.Println("\n4. Testing AI Report Generation...")
		testAIReportGeneration(aiService, storageManager, scanID)
	}

	// Test 5: Export Functionality
	if scanID != "" {
		fmt.Println("\n5. Testing Export Functionality...")
		testExportFunctionality(storageManager, scanID)
	}

	// Test 6: Dashboard Stats
	fmt.Println("\n6. Testing Dashboard Stats...")
	testDashboardStats(storageManager)

	fmt.Println("\n✅ Backend Integration Testing Complete!")
	fmt.Println("All major components have been tested.")

	// Cleanup
	defer storageManager.Close()
	defer configManager.Close()
}

func testConfigurationManagement(configManager *config.Manager) {
	// Test API key storage
	fmt.Print("  - Testing API key storage... ")
	err := configManager.SaveAPIKey("openai", "test-key-123")
	if err != nil {
		fmt.Printf("❌ Failed: %v\n", err)
		return
	}
	fmt.Println("✅ Success")

	// Test API key retrieval
	fmt.Print("  - Testing API key retrieval... ")
	keys := configManager.GetAPIKeys()
	if keys["openai"] != "test-key-123" {
		fmt.Println("❌ Failed: Key not retrieved correctly")
		return
	}
	fmt.Println("✅ Success")

	// Test configuration retrieval
	fmt.Print("  - Testing configuration retrieval... ")
	config := configManager.GetConfig()
	if config == nil {
		fmt.Println("❌ Failed: No configuration returned")
		return
	}
	fmt.Println("✅ Success")
}

func testStorageOperations(storageManager *storage.Manager) {
	// Test scan result storage
	fmt.Print("  - Testing scan result storage... ")
	testScanResult := map[string]interface{}{
		"id":            "test-scan-123",
		"url":           "https://example.com",
		"status":        "completed",
		"timestamp":     time.Now().Format(time.RFC3339),
		"securityScore": 85,
		"vulnerabilities": []map[string]interface{}{
			{
				"severity": "medium",
				"title":    "Test Vulnerability",
				"cve":      "CVE-2023-TEST",
			},
		},
	}

	err := storageManager.SaveScanResult("test-scan-123", testScanResult)
	if err != nil {
		fmt.Printf("❌ Failed: %v\n", err)
		return
	}
	fmt.Println("✅ Success")

	// Test scan result retrieval
	fmt.Print("  - Testing scan result retrieval... ")
	result := storageManager.GetScanResult("test-scan-123")
	if result == nil {
		fmt.Println("❌ Failed: No result returned")
		return
	}
	fmt.Println("✅ Success")

	// Test all scans retrieval
	fmt.Print("  - Testing all scans retrieval... ")
	allScans := storageManager.GetAllScans()
	if len(allScans) == 0 {
		fmt.Println("❌ Failed: No scans returned")
		return
	}
	fmt.Println("✅ Success")
}

func testScanFunctionality(scannerService *scanner.Service) string {
	fmt.Print("  - Testing scan start... ")

	scanConfig := map[string]interface{}{
		"scanType":          "quick",
		"includeSubdomains": false,
		"timeout":           60,
		"technicalScan":     true,
		"vulnerabilityScan": true,
	}

	scanID := scannerService.StartScan("https://httpbin.org", scanConfig)
	if scanID == "" {
		fmt.Println("❌ Failed: No scan ID returned")
		return ""
	}
	fmt.Printf("✅ Success (ID: %s)\n", scanID)

	// Test scan status
	fmt.Print("  - Testing scan status... ")
	status := scannerService.GetStatus(scanID)
	if status == nil {
		fmt.Println("❌ Failed: No status returned")
		return scanID
	}
	fmt.Printf("✅ Success (Status: %v)\n", status["status"])

	// Wait a bit for the scan to progress
	fmt.Print("  - Waiting for scan progress... ")
	time.Sleep(5 * time.Second)

	status = scannerService.GetStatus(scanID)
	fmt.Printf("✅ Status: %v\n", status["status"])

	return scanID
}

func testAIReportGeneration(aiService *ai.Service, storageManager *storage.Manager, scanID string) {
	fmt.Print("  - Testing AI report generation... ")

	// Get scan result
	scanResult := storageManager.GetScanResult(scanID)
	if scanResult == nil {
		fmt.Println("⚠️  Skipped: No scan result available")
		return
	}

	// Test report generation (will fail without valid API keys, but we can test the structure)
	report := aiService.GenerateReport(scanResult, "technical")
	if report == nil {
		fmt.Println("❌ Failed: No report returned")
		return
	}

	if report["error"] != nil {
		fmt.Printf("⚠️  Expected (no API keys): %v\n", report["error"])
		return
	}

	fmt.Println("✅ Success")
}

func testExportFunctionality(storageManager *storage.Manager, scanID string) {
	// Get scan result
	scanResult := storageManager.GetScanResult(scanID)
	if scanResult == nil {
		fmt.Println("  ⚠️  Skipped: No scan result available for export")
		return
	}

	// Test JSON export
	fmt.Print("  - Testing JSON export... ")
	jsonFile := storageManager.ExportReport(scanResult, "json", map[string]interface{}{})
	if jsonFile == "" {
		fmt.Println("❌ Failed: No JSON file returned")
		return
	}
	fmt.Printf("✅ Success: %s\n", jsonFile)

	// Test PDF export
	fmt.Print("  - Testing PDF export... ")
	pdfFile := storageManager.ExportReport(scanResult, "pdf", map[string]interface{}{
		"includeCharts": true,
		"title":         "HarbingerX Security Report",
	})
	if pdfFile == "" {
		fmt.Println("❌ Failed: No PDF file returned")
		return
	}
	fmt.Printf("✅ Success: %s\n", pdfFile)
}

func testDashboardStats(storageManager *storage.Manager) {
	fmt.Print("  - Testing dashboard stats... ")

	stats := storageManager.GetDashboardStats()
	if stats == nil {
		fmt.Println("❌ Failed: No stats returned")
		return
	}

	// Print some stats for verification
	fmt.Printf("✅ Success\n")
	fmt.Printf("    Total Scans: %v\n", stats["totalScans"])
	fmt.Printf("    Completed: %v\n", stats["completedScans"])
	fmt.Printf("    Running: %v\n", stats["runningScans"])
	fmt.Printf("    Average Score: %v\n", stats["averageScore"])
}
