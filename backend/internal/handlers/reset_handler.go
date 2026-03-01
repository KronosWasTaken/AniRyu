package handlers

import (
  "net/http"

  "anilist-backend/internal/models"

  "github.com/gin-gonic/gin"
  "gorm.io/gorm"
)

type ResetHandler struct {
  db *gorm.DB
}

func NewResetHandler(db *gorm.DB) *ResetHandler {
  return &ResetHandler{db: db}
}

func (h *ResetHandler) ResetDatabase(c *gin.Context) {
  if err := h.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&models.Anime{}).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear anime entries", "details": err.Error()})
    return
  }

  if err := h.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&models.Manga{}).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear manga entries", "details": err.Error()})
    return
  }

  c.JSON(http.StatusOK, gin.H{"success": true, "message": "Database cleared"})
}
