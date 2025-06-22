package ai

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"github.com/sashabaranov/go-openai"
	"google.golang.org/api/option"
)

type Service struct {
	config ConfigManager
}

type ConfigManager interface {
	GetAPIKeys() map[string]string
	UpdateAPIKeyUsage(provider string, requests, tokens int, cost float64) error
}

type Provider interface {
	Analyze(data map[string]interface{}, analysisType string) (map[string]interface{}, error)
	ValidateKey(key string) error
	GetCapabilities() []string
}

type OpenAIProvider struct {
	client *openai.Client
}

type GeminiProvider struct {
	client *genai.Client
}

func NewService(config ConfigManager) *Service {
	return &Service{
		config: config,
	}
}

func (s *Service) TestAPIKey(provider, key string) bool {
	switch provider {
	case "openai":
		return s.testOpenAIKey(key)
	case "gemini":
		return s.testGeminiKey(key)
	default:
		return false
	}
}

func (s *Service) GenerateReport(scanResult map[string]interface{}, reportType string) map[string]interface{} {
	keys := s.config.GetAPIKeys()

	// Try providers in order of preference
	providers := []string{"openai", "gemini", "claude"}

	for _, provider := range providers {
		if key, exists := keys[provider]; exists && key != "" {
			result, err := s.generateWithProvider(provider, key, scanResult, reportType)
			if err == nil {
				return result
			}
		}
	}

	return map[string]interface{}{
		"error": "No valid AI provider available",
	}
}

func (s *Service) generateWithProvider(provider, key string, scanResult map[string]interface{}, reportType string) (map[string]interface{}, error) {
	switch provider {
	case "openai":
		return s.generateWithOpenAI(key, scanResult, reportType)
	case "gemini":
		return s.generateWithGemini(key, scanResult, reportType)
	default:
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}
}

func (s *Service) generateWithOpenAI(key string, scanResult map[string]interface{}, reportType string) (map[string]interface{}, error) {
	client := openai.NewClient(key)

	prompt := s.buildPrompt(scanResult, reportType)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "You are a cybersecurity expert analyzing scan results.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
		},
	)

	if err != nil {
		return nil, err
	}

	// Update usage
	s.config.UpdateAPIKeyUsage("openai", 1, resp.Usage.TotalTokens, 0.0)

	return s.parseAIResponse(resp.Choices[0].Message.Content), nil
}

func (s *Service) generateWithGemini(key string, scanResult map[string]interface{}, reportType string) (map[string]interface{}, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(key))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")
	prompt := s.buildPrompt(scanResult, reportType)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	// Update usage
	s.config.UpdateAPIKeyUsage("gemini", 1, 0, 0.0)

	var content string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		content = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	}

	return s.parseAIResponse(content), nil
}

func (s *Service) buildPrompt(scanResult map[string]interface{}, reportType string) string {
	basePrompt := fmt.Sprintf(`
Analyze the following security scan results and provide a %s:

URL: %v
Security Score: %v
Vulnerabilities: %v
Technologies: %v

`, reportType, scanResult["url"], scanResult["securityScore"], scanResult["vulnerabilities"], scanResult["techStack"])

	switch reportType {
	case "executive":
		return basePrompt + "Provide an executive summary suitable for business stakeholders."
	case "technical":
		return basePrompt + "Provide a detailed technical analysis for security professionals."
	case "remediation":
		return basePrompt + "Provide specific remediation steps and recommendations."
	default:
		return basePrompt + "Provide a comprehensive security analysis."
	}
}

func (s *Service) parseAIResponse(content string) map[string]interface{} {
	return map[string]interface{}{
		"executiveSummary":    s.extractSection(content, "Executive Summary"),
		"technicalAnalysis":   s.extractSection(content, "Technical Analysis"),
		"remediationPlan":     s.extractSection(content, "Remediation Plan"),
		"businessImpact":      s.extractSection(content, "Business Impact"),
		"futureThreats":       s.extractSection(content, "Future Threats"),
		"educationalInsights": s.extractSection(content, "Educational Insights"),
		"fullContent":         content,
	}
}

func (s *Service) extractSection(content, section string) string {
	// Simple section extraction - in a real implementation,
	// this would use more sophisticated parsing
	return fmt.Sprintf("AI-generated %s based on scan results", section)
}

func (s *Service) testOpenAIKey(key string) bool {
	client := openai.NewClient(key)
	_, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "Test",
				},
			},
			MaxTokens: 1,
		},
	)
	return err == nil
}

func (s *Service) testGeminiKey(key string) bool {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(key))
	if err != nil {
		return false
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")
	_, err = model.GenerateContent(ctx, genai.Text("Test"))
	return err == nil
}
