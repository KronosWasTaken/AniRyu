package handlers

import (
	"net/http"
	"strconv"

	"anilist-backend/internal/models"
	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AnimeHandler struct {
	service        services.AnimeService
	anilistService services.AniListService
}

func NewAnimeHandler(service services.AnimeService, anilistService services.AniListService) *AnimeHandler {
	return &AnimeHandler{service: service, anilistService: anilistService}
}

func (h *AnimeHandler) GetList(c *gin.Context) {
	anime, err := h.service.GetList()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve anime list"})
		return
	}

	c.JSON(http.StatusOK, anime)
}

func (h *AnimeHandler) AddMedia(c *gin.Context) {
	var req models.AddMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if anime already exists
	exists, err := h.service.CheckExists(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check if anime exists"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Already in list"})
		return
	}

	// Fetch media details from AniList
	mediaDetails, err := h.anilistService.GetMediaDetails(req.MediaID, "ANIME")
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

	episodes := 0
	if mediaDetails.Episodes != nil {
		episodes = *mediaDetails.Episodes
	}

	// Use ExtraLarge if available, fallback to Large
	imageURL := mediaDetails.CoverImage.Large
	if mediaDetails.CoverImage.ExtraLarge != "" {
		imageURL = mediaDetails.CoverImage.ExtraLarge
	}

	err = h.service.AddMedia(
		req.MediaID,
		title,
		"plan-to-watch", // Default status
		0,               // Default score
		0,               // Default progress
		episodes,
		imageURL,
		"", // Default notes
		mediaDetails.IsAdult,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add anime"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Anime added successfully"})
}

func (h *AnimeHandler) UpdateEntry(c *gin.Context) {
	mediaIDStr := c.Param("id")
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media ID"})
		return
	}

	var req models.UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.service.UpdateEntry(mediaID, req.Progress, req.Score, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update anime entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *AnimeHandler) DeleteEntry(c *gin.Context) {
	mediaIDStr := c.Param("id")
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media ID"})
		return
	}

	err = h.service.DeleteEntry(mediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete anime entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *AnimeHandler) GetDeleted(c *gin.Context) {
	anime, err := h.service.GetDeleted()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve deleted anime list"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": anime})
}

func (h *AnimeHandler) Restore(c *gin.Context) {
	var req struct {
		MediaID int `json:"media_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.service.Restore(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore anime entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Anime entry restored successfully"})
}

func (h *AnimeHandler) PermanentlyDelete(c *gin.Context) {
	var req struct {
		MediaID int `json:"media_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.service.PermanentlyDelete(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to permanently delete anime entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Anime entry permanently deleted"})
}
