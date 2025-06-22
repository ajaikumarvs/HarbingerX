package main

import (
	"fmt"
	"harbingerx/backend/ai"
	"harbingerx/backend/config"
)

func main() {
	fmt.Println("🔑 Testing AI API Key Functionality")
	fmt.Println("====================================")

	// Initialize services
	configManager := config.NewManager()
	aiService := ai.NewService(configManager)

	// Test Gemini API Key
	fmt.Println("\n1. Testing Gemini API Key...")
	testGeminiAPIKey := "AIzaSyBzzR2Q7QJV4z0qKHJ8yRwIOXE_DD6OwDE"

	fmt.Print("  - Testing Gemini key validation... ")
	isValid := aiService.TestAPIKey("gemini", testGeminiAPIKey)
	if isValid {
		fmt.Println("✅ SUCCESS - Gemini API key is valid!")
	} else {
		fmt.Println("❌ FAILED - Gemini API key validation failed")
	}

	// Save the API key if valid
	if isValid {
		fmt.Print("  - Saving Gemini API key... ")
		err := configManager.SaveAPIKey("gemini", testGeminiAPIKey)
		if err != nil {
			fmt.Printf("❌ FAILED: %v\n", err)
		} else {
			fmt.Println("✅ SUCCESS - API key saved")
		}
	}

	// Test AI report generation
	if isValid {
		fmt.Println("\n2. Testing AI Report Generation...")
		fmt.Print("  - Generating AI report with Gemini... ")

		mockScanResult := map[string]interface{}{
			"id":            "test-scan-ai",
			"url":           "https://example.com",
			"status":        "completed",
			"securityScore": 75,
			"vulnerabilities": []map[string]interface{}{
				{
					"severity": "medium",
					"title":    "Test Vulnerability",
					"cve":      "CVE-2023-TEST",
				},
			},
			"techStack": []map[string]interface{}{
				{
					"name":     "Nginx",
					"version":  "1.18.0",
					"category": "server",
				},
			},
		}

		report := aiService.GenerateReport(mockScanResult, "technical")
		if report["error"] != nil {
			fmt.Printf("❌ FAILED: %v\n", report["error"])
		} else {
			fmt.Println("✅ SUCCESS - AI report generated!")
			fmt.Printf("    Full Content Preview: %.100s...\n", report["fullContent"])
		}
	}

	// Test API key retrieval
	fmt.Println("\n3. Testing API Key Management...")
	fmt.Print("  - Retrieving stored API keys... ")
	keys := configManager.GetAPIKeys()
	if len(keys) > 0 {
		fmt.Printf("✅ SUCCESS - Found %d API key(s)\n", len(keys))
		for provider, key := range keys {
			masked := maskAPIKey(key)
			fmt.Printf("    %s: %s\n", provider, masked)
		}
	} else {
		fmt.Println("⚠️  No API keys found in storage")
	}

	fmt.Println("\n✅ AI Testing Complete!")
}

func maskAPIKey(key string) string {
	if len(key) < 8 {
		return "****"
	}
	return key[:4] + "..." + key[len(key)-4:]
}
