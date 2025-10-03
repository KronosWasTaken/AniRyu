package handlers

import (
	"net/http"
	"strconv"

	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	anilistService services.AniListService
	animeService   services.AnimeService
	mangaService   services.MangaService
}

func NewSearchHandler(anilistService services.AniListService, animeService services.AnimeService, mangaService services.MangaService) *SearchHandler {
	return &SearchHandler{
		anilistService: anilistService,
		animeService:   animeService,
		mangaService:   mangaService,
	}
}

func (h *SearchHandler) Search(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter is required"})
		return
	}

	results, err := h.anilistService.Search(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search AniList"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *SearchHandler) CheckExists(c *gin.Context) {
	mediaIDStr := c.Query("media_id")
	mediaType := c.Query("type")

	if mediaIDStr == "" || mediaType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media_id and type parameters are required"})
		return
	}

	mediaID, err := strconv.Atoi(mediaIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid media_id"})
		return
	}

	var exists bool
	switch mediaType {
	case "anime":
		exists, err = h.animeService.CheckExists(mediaID)
	case "manga":
		exists, err = h.mangaService.CheckExists(mediaID)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type. Must be 'anime' or 'manga'"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check if media exists"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}
