package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"anilist-backend/internal/models"
	"anilist-backend/internal/repositories"
)

type ImportService interface {
	ImportUserList(ctx context.Context, username string) error
	ImportUserListWithProgress(ctx context.Context, username string, progressChan chan<- ImportProgress) error
}

type ImportProgress struct {
	Type    string `json:"type"` // "anime" or "manga"
	Current int    `json:"current"`
	Total   int    `json:"total"`
	Title   string `json:"title"`
	Status  string `json:"status"` // "starting", "progressing", "completed", "error"
	Message string `json:"message"`
}

type importService struct {
	animeRepo repositories.AnimeRepository
	mangaRepo repositories.MangaRepository
	anilist   AniListService
}

func NewImportService(animeRepo repositories.AnimeRepository, mangaRepo repositories.MangaRepository, anilist AniListService) ImportService {
	return &importService{
		animeRepo: animeRepo,
		mangaRepo: mangaRepo,
		anilist:   anilist,
	}
}

const userMediaListQuery = `
query($userId: Int, $userName: String, $type: MediaType) {
  MediaListCollection(userId: $userId, userName: $userName, type: $type) {
    lists {
      name
      isCustomList
      isCompletedList: isSplitCompletedList
      entries {
        id
        mediaId
        status
        score
        progress
        progressVolumes
        notes
        media {
          id
          title {
            userPreferred
            romaji
            english
            native
          }
          episodes
          chapters
          coverImage {
            extraLarge
          }
          isAdult
        }
      }
    }
  }
}
`

type AniListResponse struct {
	Data struct {
		MediaListCollection struct {
			Lists []struct {
				Name    string                  `json:"name"`
				Entries []AniListMediaListEntry `json:"entries"`
			} `json:"lists"`
		} `json:"MediaListCollection"`
	} `json:"data"`
}

type AniListMediaListEntry struct {
	ID              int     `json:"id"`
	MediaID         int     `json:"mediaId"`
	Status          string  `json:"status"`
	Score           float64 `json:"score"`
	Progress        int     `json:"progress"`
	ProgressVolumes int     `json:"progressVolumes"`
	Notes           string  `json:"notes"`
	// Additional metadata fields
	StartedAt             *int64 `json:"startedAt"`
	CompletedAt           *int64 `json:"completedAt"`
	UpdatedAt             *int64 `json:"updatedAt"`
	Repeat                int    `json:"repeat"`
	HiddenFromStatusLists bool   `json:"hiddenFromStatusLists"`
	Media                 struct {
		ID    int `json:"id"`
		Title struct {
			UserPreferred string `json:"userPreferred"`
			Romaji        string `json:"romaji"`
			English       string `json:"english"`
			Native        string `json:"native"`
		} `json:"title"`
		Episodes   *int `json:"episodes"`
		Chapters   *int `json:"chapters"`
		IsAdult    bool `json:"isAdult"`
		CoverImage struct {
			ExtraLarge string `json:"extraLarge"`
		} `json:"coverImage"`
		StartDate struct {
			Year  *int `json:"year"`
			Month *int `json:"month"`
			Day   *int `json:"day"`
		} `json:"startDate"`
		EndDate struct {
			Year  *int `json:"year"`
			Month *int `json:"month"`
			Day   *int `json:"day"`
		} `json:"endDate"`
	} `json:"media"`
}

func (s *importService) ImportUserList(ctx context.Context, username string) error {
	// Import anime list
	if err := s.importMediaList(ctx, username, "ANIME"); err != nil {
		return fmt.Errorf("failed to import anime list: %w", err)
	}

	// Import manga list (optional - user might not have manga)
	if err := s.importMediaList(ctx, username, "MANGA"); err != nil {
		// Log the error but don't fail the entire import
		fmt.Printf("Warning: failed to import manga list: %v\n", err)
	}

	return nil
}

func (s *importService) ImportUserListWithProgress(ctx context.Context, username string, progressChan chan<- ImportProgress) error {
	// Send starting message
	progressChan <- ImportProgress{
		Type:    "combined",
		Status:  "starting",
		Message: "Starting import process...",
	}

	// Get total counts first
	animeList, err := s.fetchUserMediaList(ctx, username, "ANIME")
	if err != nil {
		progressChan <- ImportProgress{
			Type:    "combined",
			Status:  "error",
			Message: fmt.Sprintf("Failed to fetch anime list: %v", err),
		}
		return fmt.Errorf("failed to fetch anime list: %w", err)
	}

	mangaList, err := s.fetchUserMediaList(ctx, username, "MANGA")
	if err != nil {
		// Log the error but don't fail the entire import
		fmt.Printf("Warning: failed to fetch manga list: %v\n", err)
		mangaList = []AniListMediaListEntry{} // Empty list
	}

	animeTotal := len(animeList)
	mangaTotal := len(mangaList)
	combinedTotal := animeTotal + mangaTotal
	currentProgress := 0

	// Import anime with combined progress
	if err := s.importMediaListWithCombinedProgress(ctx, username, "ANIME", animeList, progressChan, &currentProgress, combinedTotal); err != nil {
		progressChan <- ImportProgress{
			Type:    "combined",
			Status:  "error",
			Message: fmt.Sprintf("Failed to import anime: %v", err),
		}
		return fmt.Errorf("failed to import anime: %w", err)
	}

	// Import manga with combined progress (optional)
	if err := s.importMediaListWithCombinedProgress(ctx, username, "MANGA", mangaList, progressChan, &currentProgress, combinedTotal); err != nil {
		// Log the error but don't fail the entire import
		progressChan <- ImportProgress{
			Type:    "combined",
			Status:  "error",
			Message: fmt.Sprintf("Warning: Failed to import manga: %v", err),
		}
	}

	// Send completion message
	progressChan <- ImportProgress{
		Type:    "combined",
		Status:  "completed",
		Current: combinedTotal,
		Total:   combinedTotal,
		Message: "Import completed successfully!",
	}

	return nil
}

func (s *importService) importMediaListWithCombinedProgress(_ context.Context, _ string, mediaType string, mediaList []AniListMediaListEntry, progressChan chan<- ImportProgress, currentProgress *int, totalProgress int) error {
	total := len(mediaList)

	if total == 0 {
		return nil // No entries to process
	}

	// Import each entry
	for _, entry := range mediaList {
		*currentProgress++

		progressChan <- ImportProgress{
			Type:    "combined",
			Status:  "progressing",
			Current: *currentProgress,
			Total:   totalProgress,
			Title:   s.getBestTitle(entry.Media.Title),
			Message: fmt.Sprintf("Importing %s: %d/%d - %s", mediaType, *currentProgress, totalProgress, s.getBestTitle(entry.Media.Title)),
		}

		switch mediaType {
		case "ANIME":
			anime := &models.Anime{
				MediaID:  entry.MediaID,
				Title:    s.getBestTitle(entry.Media.Title),
				Status:   s.mapAniListStatus(entry.Status),
				Score:    int(entry.Score),
				Progress: entry.Progress,
				Total:    s.getIntValue(entry.Media.Episodes),
				Image:    entry.Media.CoverImage.ExtraLarge,
				Notes:    entry.Notes,
				IsAdult:  entry.Media.IsAdult,
				// Additional metadata
				StartDate:             s.parseUnixTimestamp(entry.StartedAt),
				CompletedDate:         s.parseUnixTimestamp(entry.CompletedAt),
				LastUpdated:           s.parseUnixTimestamp(entry.UpdatedAt),
				ReleaseDate:           s.parseAniListDate(entry.Media.StartDate.Year, entry.Media.StartDate.Month, entry.Media.StartDate.Day),
				RepeatCount:           entry.Repeat,
				HiddenFromStatusLists: entry.HiddenFromStatusLists,
			}

			// Use upsert to handle both create and update cases
			if err := s.animeRepo.Upsert(anime); err != nil {
				return fmt.Errorf("failed to upsert anime: %w", err)
			}
		case "MANGA":
			manga := &models.Manga{
				MediaID:  entry.MediaID,
				Title:    s.getBestTitle(entry.Media.Title),
				Status:   s.mapAniListStatus(entry.Status),
				Score:    int(entry.Score),
				Progress: entry.ProgressVolumes,
				Total:    s.getIntValue(entry.Media.Chapters),
				Image:    entry.Media.CoverImage.ExtraLarge,
				Notes:    entry.Notes,
				IsAdult:  entry.Media.IsAdult,
				// Additional metadata
				StartDate:             s.parseUnixTimestamp(entry.StartedAt),
				CompletedDate:         s.parseUnixTimestamp(entry.CompletedAt),
				LastUpdated:           s.parseUnixTimestamp(entry.UpdatedAt),
				ReleaseDate:           s.parseAniListDate(entry.Media.StartDate.Year, entry.Media.StartDate.Month, entry.Media.StartDate.Day),
				RepeatCount:           entry.Repeat,
				HiddenFromStatusLists: entry.HiddenFromStatusLists,
			}

			// Use upsert to handle both create and update cases
			if err := s.mangaRepo.Upsert(manga); err != nil {
				return fmt.Errorf("failed to upsert manga: %w", err)
			}
		}
	}

	return nil
}

func (s *importService) importMediaList(ctx context.Context, username string, mediaType string) error {
	// Fetch user's media list from AniList using the new approach
	mediaList, err := s.fetchUserMediaList(ctx, username, mediaType)
	if err != nil {
		return fmt.Errorf("failed to fetch %s list: %w", mediaType, err)
	}

	total := len(mediaList)
	fmt.Printf("Importing %s: %d entries found\n", mediaType, total)

	// Import each entry
	for i, entry := range mediaList {
		fmt.Printf("Importing %s: %d/%d - %s\n", mediaType, i+1, total, s.getBestTitle(entry.Media.Title))
		switch mediaType {
		case "ANIME":
			anime := &models.Anime{
				MediaID:  entry.MediaID,
				Title:    s.getBestTitle(entry.Media.Title),
				Status:   s.mapAniListStatus(entry.Status),
				Score:    int(entry.Score),
				Progress: entry.Progress,
				Total:    s.getIntValue(entry.Media.Episodes),
				Image:    entry.Media.CoverImage.ExtraLarge,
				Notes:    entry.Notes,
				IsAdult:  entry.Media.IsAdult,
			}

			// Check if anime already exists
			exists, err := s.animeRepo.Exists(entry.MediaID)
			if err != nil {
				return fmt.Errorf("failed to check if anime exists: %w", err)
			}

			if exists {
				// Update existing entry
				if err := s.animeRepo.Update(anime); err != nil {
					return fmt.Errorf("failed to update anime: %w", err)
				}
			} else {
				// Create new entry
				if err := s.animeRepo.Create(anime); err != nil {
					return fmt.Errorf("failed to create anime: %w", err)
				}
			}
		case "MANGA":
			manga := &models.Manga{
				MediaID:  entry.MediaID,
				Title:    s.getBestTitle(entry.Media.Title),
				Status:   s.mapAniListStatus(entry.Status),
				Score:    int(entry.Score),
				Progress: entry.ProgressVolumes, // Use progressVolumes for manga
				Total:    s.getIntValue(entry.Media.Chapters),
				Image:    entry.Media.CoverImage.ExtraLarge,
				Notes:    entry.Notes,
				IsAdult:  entry.Media.IsAdult,
			}

			// Check if manga already exists
			exists, err := s.mangaRepo.Exists(entry.MediaID)
			if err != nil {
				return fmt.Errorf("failed to check if manga exists: %w", err)
			}

			if exists {
				// Update existing entry
				if err := s.mangaRepo.Update(manga); err != nil {
					return fmt.Errorf("failed to update manga: %w", err)
				}
			} else {
				// Create new entry
				if err := s.mangaRepo.Create(manga); err != nil {
					return fmt.Errorf("failed to create manga: %w", err)
				}
			}
		}
	}

	return nil
}

func (s *importService) fetchUserMediaList(ctx context.Context, username string, mediaType string) ([]AniListMediaListEntry, error) {
	reqBody := map[string]interface{}{
		"query": userMediaListQuery,
		"variables": map[string]interface{}{
			"userName": username,
			"type":     mediaType,
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://graphql.anilist.co",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to AniList API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("anilist api error: %d - %s", resp.StatusCode, string(body))
	}

	var response AniListResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode AniList response: %w", err)
	}

	// Flatten all entries from all lists
	var allEntries []AniListMediaListEntry
	for _, list := range response.Data.MediaListCollection.Lists {
		allEntries = append(allEntries, list.Entries...)
	}

	return allEntries, nil
}

func (s *importService) getIntValue(ptr *int) int {
	if ptr == nil {
		return 0
	}
	return *ptr
}

func (s *importService) parseAniListDate(year, month, day *int) *time.Time {
	if year == nil || month == nil || day == nil {
		return nil
	}

	date := time.Date(*year, time.Month(*month), *day, 0, 0, 0, 0, time.UTC)
	return &date
}

func (s *importService) parseUnixTimestamp(timestamp *int64) *time.Time {
	if timestamp == nil {
		return nil
	}

	date := time.Unix(*timestamp, 0)
	return &date
}

func (s *importService) getBestTitle(title struct {
	UserPreferred string `json:"userPreferred"`
	Romaji        string `json:"romaji"`
	English       string `json:"english"`
	Native        string `json:"native"`
}) string {
	if title.UserPreferred != "" {
		return title.UserPreferred
	}
	if title.English != "" {
		return title.English
	}
	if title.Romaji != "" {
		return title.Romaji
	}
	return title.Native
}

func (s *importService) mapAniListStatus(status string) models.Status {
	switch status {
	case "CURRENT":
		return models.StatusWatching
	case "PLANNING":
		return models.StatusPlanning
	case "COMPLETED":
		return models.StatusCompleted
	case "DROPPED":
		return models.StatusDropped
	case "PAUSED":
		return models.StatusOnHold
	default:
		return models.StatusPlanning
	}
}
