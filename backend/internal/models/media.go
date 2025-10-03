package models

import (
	"time"

	"gorm.io/gorm"
)

type MediaType string

const (
	MediaTypeAnime MediaType = "anime"
	MediaTypeManga MediaType = "manga"
)

type Status string

const (
	StatusWatching  Status = "watching"
	StatusReading   Status = "reading"
	StatusCompleted Status = "completed"
	StatusOnHold    Status = "on_hold"
	StatusDropped   Status = "dropped"
	StatusPlanning  Status = "planning"
	StatusRepeating Status = "repeating"
)

type Anime struct {
	ID                    uint           `json:"id" gorm:"primaryKey"`
	Title                 string         `json:"title" gorm:"not null"`
	MediaID               int            `json:"media_id" gorm:"uniqueIndex;not null"`
	Status                Status         `json:"status" gorm:"not null;default:'planning'"`
	Score                 int            `json:"score" gorm:"default:0"`
	Progress              int            `json:"progress" gorm:"default:0"`
	Total                 int            `json:"total" gorm:"default:0"`
	Image                 string         `json:"image"`
	Notes                 string         `json:"notes"`
	IsAdult               bool           `json:"is_adult" gorm:"default:false"`
	StartDate             *time.Time     `json:"start_date"`
	CompletedDate         *time.Time     `json:"completed_date"`
	ReleaseDate           *time.Time     `json:"release_date"`
	LastUpdated           *time.Time     `json:"last_updated"`
	LastAdded             *time.Time     `json:"last_added"`
	RepeatCount           int            `json:"repeat_count" gorm:"default:0"`
	HiddenFromStatusLists bool           `json:"hidden_from_status_lists" gorm:"default:false"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

type Manga struct {
	ID                    uint           `json:"id" gorm:"primaryKey"`
	Title                 string         `json:"title" gorm:"not null"`
	MediaID               int            `json:"media_id" gorm:"uniqueIndex;not null"`
	Status                Status         `json:"status" gorm:"not null;default:'planning'"`
	Score                 int            `json:"score" gorm:"default:0"`
	Progress              int            `json:"progress" gorm:"default:0"`
	Total                 int            `json:"total" gorm:"default:0"`
	Image                 string         `json:"image"`
	Notes                 string         `json:"notes"`
	IsAdult               bool           `json:"is_adult" gorm:"default:false"`
	StartDate             *time.Time     `json:"start_date"`
	CompletedDate         *time.Time     `json:"completed_date"`
	ReleaseDate           *time.Time     `json:"release_date"`
	LastUpdated           *time.Time     `json:"last_updated"`
	LastAdded             *time.Time     `json:"last_added"`
	RepeatCount           int            `json:"repeat_count" gorm:"default:0"`
	HiddenFromStatusLists bool           `json:"hidden_from_status_lists" gorm:"default:false"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

type MediaEntry struct {
	Title    string `json:"title"`
	MediaID  int    `json:"media_id"`
	Status   string `json:"status"`
	Score    int    `json:"score"`
	Progress int    `json:"progress"`
	Total    int    `json:"total"`
	Image    string `json:"image"`
	Notes    string `json:"notes"`
	IsAdult  bool   `json:"isAdult"`
}

type UpdateRequest struct {
	MediaType             string `json:"media_type" binding:"required"`
	MediaID               int    `json:"media_id" binding:"required"`
	Progress              int    `json:"progress"`
	Score                 int    `json:"score"`
	Status                string `json:"status"`
	Notes                 string `json:"notes"`
	HiddenFromStatusLists bool   `json:"hidden_from_status_lists"`
}

type EditAnimeRequest struct {
	Status                *string `json:"status"`
	Score                 *int    `json:"score"`
	Progress              *int    `json:"progress"`
	Notes                 *string `json:"notes"`
	HiddenFromStatusLists *bool   `json:"hidden_from_status_lists"`
}

type EditMangaRequest struct {
	Status                *string `json:"status"`
	Score                 *int    `json:"score"`
	Progress              *int    `json:"progress"`
	Notes                 *string `json:"notes"`
	HiddenFromStatusLists *bool   `json:"hidden_from_status_lists"`
}

type AddMediaRequest struct {
	MediaID               int    `json:"media_id" binding:"required"`
	MediaType             string `json:"media_type" binding:"required"`
	Status                string `json:"status,omitempty"`
	Rating                int    `json:"rating,omitempty"`
	Progress              int    `json:"progress,omitempty"`
	Notes                 string `json:"notes,omitempty"`
	HiddenFromStatusLists bool   `json:"hidden_from_status_lists,omitempty"`
}

type DeleteRequest struct {
	MediaType string `json:"media_type" binding:"required"`
	MediaID   int    `json:"media_id" binding:"required"`
}

type SearchRequest struct {
	Query string `form:"query" binding:"required"`
}

type AniListMedia struct {
	ID    int    `json:"id"`
	Type  string `json:"type"`
	Title struct {
		English string `json:"english"`
		Romaji  string `json:"romaji"`
		Native  string `json:"native"`
	} `json:"title"`
	CoverImage struct {
		Large      string `json:"large"`
		ExtraLarge string `json:"extraLarge"`
	} `json:"coverImage"`
	Episodes  *int `json:"episodes"`
	Chapters  *int `json:"chapters"`
	IsAdult   bool `json:"isAdult"`
	StartDate struct {
		Year  int `json:"year"`
		Month int `json:"month"`
		Day   int `json:"day"`
	} `json:"startDate"`
	Format string `json:"format"`
	Status string `json:"status"`
}

type AniListSearchResponse struct {
	Data struct {
		Anime struct {
			Results []AniListMedia `json:"results"`
		} `json:"anime"`
		Manga struct {
			Results []AniListMedia `json:"results"`
		} `json:"manga"`
	} `json:"data"`
}
