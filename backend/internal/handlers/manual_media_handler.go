package handlers

import (
	"net/http"
	"time"

	"anilist-backend/internal/models"
	"anilist-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type ManualMediaHandler struct {
	animeRepo repositories.AnimeRepository
	mangaRepo repositories.MangaRepository
}

type ManualMediaRequest struct {
	MediaID               *int   `json:"media_id,omitempty"`
	MediaType             string `json:"media_type" binding:"required"`
	Title                 string `json:"title" binding:"required"`
	Status                string `json:"status" binding:"required"`
	Score                 int    `json:"score,omitempty"`
	Progress              int    `json:"progress,omitempty"`
	Total                 int    `json:"total,omitempty"`
	Image                 string `json:"image,omitempty"`
	Notes                 string `json:"notes,omitempty"`
	IsAdult               bool   `json:"is_adult"`
	HiddenFromStatusLists bool   `json:"hidden_from_status_lists"`
}

func NewManualMediaHandler(animeRepo repositories.AnimeRepository, mangaRepo repositories.MangaRepository) *ManualMediaHandler {
	return &ManualMediaHandler{
		animeRepo: animeRepo,
		mangaRepo: mangaRepo,
	}
}

func (h *ManualMediaHandler) AddManualMedia(c *gin.Context) {
	var req ManualMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mediaID := 0
	if req.MediaID != nil {
		mediaID = *req.MediaID
	}

	if mediaID == 0 {
		mediaID = int(-time.Now().UnixNano() / int64(time.Millisecond))
	}

	// Ensure uniqueness
	for {
		exists := false
		var err error
		switch req.MediaType {
		case "anime":
			exists, err = h.animeRepo.Exists(mediaID)
		case "manga":
			exists, err = h.mangaRepo.Exists(mediaID)
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media type"})
			return
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check if entry exists"})
			return
		}

		if !exists {
			break
		}
		mediaID--
	}

	switch req.MediaType {
	case "anime":
		anime := &models.Anime{
			MediaID:               mediaID,
			Title:                 req.Title,
			Status:                models.Status(req.Status),
			Score:                 req.Score,
			Progress:              req.Progress,
			Total:                 req.Total,
			Image:                 req.Image,
			Notes:                 req.Notes,
			IsAdult:               req.IsAdult,
			HiddenFromStatusLists: req.HiddenFromStatusLists,
		}
		if err := h.animeRepo.Create(anime); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add anime"})
			return
		}
	case "manga":
		manga := &models.Manga{
			MediaID:               mediaID,
			Title:                 req.Title,
			Status:                models.Status(req.Status),
			Score:                 req.Score,
			Progress:              req.Progress,
			Total:                 req.Total,
			Image:                 req.Image,
			Notes:                 req.Notes,
			IsAdult:               req.IsAdult,
			HiddenFromStatusLists: req.HiddenFromStatusLists,
		}
		if err := h.mangaRepo.Create(manga); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add manga"})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media type"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "media_id": mediaID})
}
