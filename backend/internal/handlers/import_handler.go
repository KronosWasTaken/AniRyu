package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ImportHandler struct {
	importService services.ImportService
}

func NewImportHandler(importService services.ImportService) *ImportHandler {
	return &ImportHandler{
		importService: importService,
	}
}

type ImportRequest struct {
	Username string `json:"username" binding:"required"`
}

type ImportResponse struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

func (h *ImportHandler) ImportUserList(c *gin.Context) {
	var req ImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Validate username
	if req.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username is required",
		})
		return
	}

	// Import user's list
	if err := h.importService.ImportUserList(c.Request.Context(), req.Username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to import user list",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, ImportResponse{
		Message: "Successfully imported user list",
		Success: true,
	})
}

func (h *ImportHandler) ImportUserListWithProgress(c *gin.Context) {
	var req ImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Validate username
	if req.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username is required",
		})
		return
	}

	// Set up SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "Cache-Control")

	// Create progress channel
	progressChan := make(chan services.ImportProgress, 100)

	// Start import in goroutine
	go func() {
		defer close(progressChan)
		if err := h.importService.ImportUserListWithProgress(c.Request.Context(), req.Username, progressChan); err != nil {
			progressChan <- services.ImportProgress{
				Type:    "error",
				Status:  "error",
				Message: fmt.Sprintf("Import failed: %v", err),
			}
		}
	}()

	// Stream progress updates
	for progress := range progressChan {
		data, err := json.Marshal(progress)
		if err != nil {
			continue
		}

		// Send SSE event
		fmt.Fprintf(c.Writer, "data: %s\n\n", string(data))
		c.Writer.Flush()
	}
}

func (h *ImportHandler) GetImportStatus(c *gin.Context) {
	// This could be enhanced to track import progress
	c.JSON(http.StatusOK, gin.H{
		"status":  "ready",
		"message": "Import service is ready",
	})
}
