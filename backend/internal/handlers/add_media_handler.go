package handlers

import (
	"net/http"

	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AddMediaHandler struct {
	animeService   services.AnimeService
	mangaService   services.MangaService
	anilistService services.AniListService
}

func NewAddMediaHandler(animeService services.AnimeService, mangaService services.MangaService, anilistService services.AniListService) *AddMediaHandler {
	return &AddMediaHandler{
		animeService:   animeService,
		mangaService:   mangaService,
		anilistService: anilistService,
	}
}

type AddMediaRequest struct {
	MediaID   int     `json:"media_id" binding:"required"`
	MediaType string  `json:"media_type" binding:"required"`
	Status    string  `json:"status,omitempty"`
	Rating    float64 `json:"rating,omitempty"`
	Progress  int     `json:"progress,omitempty"`
	Notes     string  `json:"notes,omitempty"`
}

func (h *AddMediaHandler) AddMedia(c *gin.Context) {
	var req AddMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if media already exists
	var exists bool
	var err error

	switch req.MediaType {
	case "anime":
		exists, err = h.animeService.CheckExists(req.MediaID)
	case "manga":
		exists, err = h.mangaService.CheckExists(req.MediaID)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media type"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check if media exists"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Already in list"})
		return
	}

	// Fetch media details from AniList
	mediaDetails, err := h.anilistService.GetMediaDetails(req.MediaID, req.MediaType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch media details from AniList"})
		return
	}

	// Extract title (prefer English, fallback to Romaji, then Native)
	title := mediaDetails.Title.English
	if title == "" {
		title = mediaDetails.Title.Romaji
	}
	if title == "" {
		title = mediaDetails.Title.Native
	}
	if title == "" {
		title = "Unknown Title"
	}

	// Use ExtraLarge if available, fallback to Large
	imageURL := mediaDetails.CoverImage.Large
	if mediaDetails.CoverImage.ExtraLarge != "" {
		imageURL = mediaDetails.CoverImage.ExtraLarge
	}

	// Use form data or defaults
	status := req.Status
	if status == "" {
		status = "plan-to-watch"
	}

	rating := req.Rating
	progress := req.Progress
	notes := req.Notes

	// Add media based on type
	switch req.MediaType {
	case "anime":
		episodes := 0
		if mediaDetails.Episodes != nil {
			episodes = *mediaDetails.Episodes
		}

		err = h.animeService.AddMedia(
			req.MediaID,
			title,
			status,
			int(rating),
			progress,
			episodes,
			imageURL,
			notes,
			mediaDetails.IsAdult,
		)
	case "manga":
		chapters := 0
		if mediaDetails.Chapters != nil {
			chapters = *mediaDetails.Chapters
		}

		err = h.mangaService.AddMedia(
			req.MediaID,
			title,
			status,
			int(rating),
			progress,
			chapters,
			imageURL,
			notes,
			mediaDetails.IsAdult,
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add media"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"title": title, "success": true})
}
