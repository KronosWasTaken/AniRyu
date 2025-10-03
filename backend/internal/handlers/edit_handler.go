package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"anilist-backend/internal/models"
	"anilist-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type EditHandler struct {
	animeRepo repositories.AnimeRepository
	mangaRepo repositories.MangaRepository
}

func NewEditHandler(animeRepo repositories.AnimeRepository, mangaRepo repositories.MangaRepository) *EditHandler {
	return &EditHandler{
		animeRepo: animeRepo,
		mangaRepo: mangaRepo,
	}
}

func mapFrontendStatusToBackend(frontendStatus string) models.Status {
	switch strings.ToLower(frontendStatus) {
	case "watching":
		return models.StatusWatching
	case "reading":
		return models.StatusReading
	case "completed":
		return models.StatusCompleted
	case "on-hold", "on_hold":
		return models.StatusOnHold
	case "dropped":
		return models.StatusDropped
	case "plan-to-watch", "plan-to-read", "planning":
		return models.StatusPlanning
	case "repeating":
		return models.StatusRepeating
	default:
		return models.StatusPlanning // default fallback
	}
}

func (h *EditHandler) EditAnime(c *gin.Context) {
	mediaIDStr := c.Param("id")
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid media ID",
		})
		return
	}

	var req models.EditAnimeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Check if anime exists
	exists, err := h.animeRepo.Exists(mediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check if anime exists",
		})
		return
	}

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Anime not found",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})

	if req.Status != nil {
		updates["status"] = mapFrontendStatusToBackend(*req.Status)
	}
	if req.Score != nil {
		updates["score"] = *req.Score
	}
	if req.Progress != nil {
		updates["progress"] = *req.Progress
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}
	if req.HiddenFromStatusLists != nil {
		updates["hidden_from_status_lists"] = *req.HiddenFromStatusLists
	}

	// Update timestamps based on status changes
	if req.Status != nil {
		now := time.Now()
		mappedStatus := mapFrontendStatusToBackend(*req.Status)
		switch mappedStatus {
		case models.StatusWatching:
			if updates["start_date"] == nil {
				updates["start_date"] = &now
			}
		case models.StatusCompleted:
			updates["completed_date"] = &now
		}
	}

	// Update last_updated timestamp
	updates["last_updated"] = time.Now()

	// Perform the update
	if err := h.animeRepo.EditAnime(mediaID, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update anime",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Anime updated successfully",
	})
}

func (h *EditHandler) EditManga(c *gin.Context) {
	mediaIDStr := c.Param("id")
	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid media ID",
		})
		return
	}

	var req models.EditMangaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Check if manga exists
	exists, err := h.mangaRepo.Exists(mediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check if manga exists",
		})
		return
	}

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Manga not found",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})

	if req.Status != nil {
		updates["status"] = mapFrontendStatusToBackend(*req.Status)
	}
	if req.Score != nil {
		updates["score"] = *req.Score
	}
	if req.Progress != nil {
		updates["progress"] = *req.Progress
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}
	if req.HiddenFromStatusLists != nil {
		updates["hidden_from_status_lists"] = *req.HiddenFromStatusLists
	}

	// Update timestamps based on status changes
	if req.Status != nil {
		now := time.Now()
		mappedStatus := mapFrontendStatusToBackend(*req.Status)
		switch mappedStatus {
		case models.StatusReading:
			if updates["start_date"] == nil {
				updates["start_date"] = &now
			}
		case models.StatusCompleted:
			updates["completed_date"] = &now
		}
	}

	// Update last_updated timestamp
	updates["last_updated"] = time.Now()

	// Perform the update
	if err := h.mangaRepo.EditManga(mediaID, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update manga",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Manga updated successfully",
	})
}
