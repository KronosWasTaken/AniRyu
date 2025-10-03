package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"anilist-backend/internal/models"
)

type AniListService interface {
	Search(query string) (*models.AniListSearchResponse, error)
	GetMediaDetails(mediaID int, mediaType string) (*models.AniListMedia, error)
}

type anilistService struct {
	apiURL     string
	httpClient *http.Client
}

func NewAniListService(apiURL string) AniListService {
	return &anilistService{
		apiURL: apiURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *anilistService) Search(query string) (*models.AniListSearchResponse, error) {
	searchQuery := `
		query($search: String) {
			anime: Page(perPage: 12) {
				results: media(type: ANIME, search: $search) {
					id
					type
					title {
						english
						romaji
						native
					}
					coverImage {
						large
						extraLarge
					}
					format
					status
					episodes
					startDate {
						year
					}
					isAdult
				}
			}
			manga: Page(perPage: 12) {
				results: media(type: MANGA, search: $search) {
					id
					type
					title {
						english
						romaji
						native
					}
					coverImage {
						large
						extraLarge
					}
					format
					status
					chapters
					startDate {
						year
					}
					isAdult
				}
			}
		}
	`

	requestBody := map[string]interface{}{
		"query": searchQuery,
		"variables": map[string]string{
			"search": query,
		},
	}

	return s.makeGraphQLRequest(requestBody)
}

func (s *anilistService) GetMediaDetails(mediaID int, mediaType string) (*models.AniListMedia, error) {
	detailsQuery := `
		query media($id: Int, $type: MediaType, $isAdult: Boolean) {
			Media(id: $id, type: $type, isAdult: $isAdult) {
				id
				title {
					userPreferred
					romaji
					english
					native
				}
				coverImage {
					extraLarge
					large
				}
				episodes
				chapters
				isAdult
				startDate {
					year
					month
					day
				}
				format
				status
			}
		}
	`

	// Convert mediaType to uppercase for GraphQL
	var graphqlType string
	switch mediaType {
	case "anime":
		graphqlType = "ANIME"
	case "manga":
		graphqlType = "MANGA"
	default:
		return nil, fmt.Errorf("invalid media type: %s", mediaType)
	}

	requestBody := map[string]interface{}{
		"query": detailsQuery,
		"variables": map[string]interface{}{
			"id":      mediaID,
			"type":    graphqlType,
			"isAdult": false,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", s.apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "AniList-Backend/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("AniList API error - Status: %d, Body: %s\n", resp.StatusCode, string(body))
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var response struct {
		Data struct {
			Media models.AniListMedia `json:"Media"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		fmt.Printf("JSON unmarshal error: %v, Body: %s\n", err, string(body))
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if len(response.Errors) > 0 {
		fmt.Printf("GraphQL errors: %v\n", response.Errors)
		return nil, fmt.Errorf("GraphQL errors: %v", response.Errors)
	}

	if response.Data.Media.ID == 0 {
		fmt.Printf("Media not found - Response: %+v\n", response)
		return nil, fmt.Errorf("media not found")
	}

	return &response.Data.Media, nil
}

func (s *anilistService) makeGraphQLRequest(requestBody map[string]interface{}) (*models.AniListSearchResponse, error) {
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", s.apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "AniList-Backend/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var response models.AniListSearchResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &response, nil
}
