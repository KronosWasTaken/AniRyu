package handlers

import (
	"net/http"
	"strconv"

	"anilist-backend/internal/models"
	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type MangaHandler struct {
	service        services.MangaService
	anilistService services.AniListService
}

func NewMangaHandler(service services.MangaService, anilistService services.AniListService) *MangaHandler {
	return &MangaHandler{service: service, anilistService: anilistService}
}

func (h *MangaHandler) GetList(c *gin.Context) {
	manga, err := h.service.GetList()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve manga list"})
		return
	}

	c.JSON(http.StatusOK, manga)
}

func (h *MangaHandler) AddMedia(c *gin.Context) {
	var req models.AddMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if manga already exists
	exists, err := h.service.CheckExists(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check if manga exists"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Already in list"})
		return
	}

	// Fetch media details from AniList
	mediaDetails, err := h.anilistService.GetMediaDetails(req.MediaID, "MANGA")
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

	chapters := 0
	if mediaDetails.Chapters != nil {
		chapters = *mediaDetails.Chapters
	}

	// Use ExtraLarge if available, fallback to Large
	imageURL := mediaDetails.CoverImage.Large
	if mediaDetails.CoverImage.ExtraLarge != "" {
		imageURL = mediaDetails.CoverImage.ExtraLarge
	}

	err = h.service.AddMedia(
		req.MediaID,
		title,
		"plan-to-read", // Default status
		0,              // Default score
		0,              // Default progress
		chapters,
		imageURL,
		"", // Default notes
		mediaDetails.IsAdult,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add manga"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Manga added successfully"})
}

func (h *MangaHandler) UpdateEntry(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update manga entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MangaHandler) DeleteEntry(c *gin.Context) {
	mediaIDStr := c.Param("id")
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media ID"})
		return
	}

	err = h.service.DeleteEntry(mediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete manga entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MangaHandler) GetDeleted(c *gin.Context) {
	manga, err := h.service.GetDeleted()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve deleted manga list"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": manga})
}

func (h *MangaHandler) Restore(c *gin.Context) {
	var req struct {
		MediaID int `json:"media_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.service.Restore(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore manga entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Manga entry restored successfully"})
}

func (h *MangaHandler) PermanentlyDelete(c *gin.Context) {
	var req struct {
		MediaID int `json:"media_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.service.PermanentlyDelete(req.MediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to permanently delete manga entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Manga entry permanently deleted"})
}
