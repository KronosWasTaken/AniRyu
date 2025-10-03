package repositories

import (
	"anilist-backend/internal/models"

	"gorm.io/gorm"
)

type MangaRepository interface {
	GetAll() ([]models.Manga, error)
	GetByMediaID(mediaID int) (*models.Manga, error)
	Create(manga *models.Manga) error
	Update(manga *models.Manga) error
	Delete(mediaID int) error
	Exists(mediaID int) (bool, error)
	EditManga(mediaID int, updates map[string]interface{}) error
	Upsert(manga *models.Manga) error
	GetDeleted() ([]models.Manga, error)
	Restore(mediaID int) error
	PermanentlyDelete(mediaID int) error
}

type mangaRepository struct {
	db *gorm.DB
}

func NewMangaRepository(db *gorm.DB) MangaRepository {
	return &mangaRepository{db: db}
}

func (r *mangaRepository) GetAll() ([]models.Manga, error) {
	var manga []models.Manga
	err := r.db.Find(&manga).Error
	return manga, err
}

func (r *mangaRepository) GetByMediaID(mediaID int) (*models.Manga, error) {
	var manga models.Manga
	err := r.db.Where("media_id = ?", mediaID).First(&manga).Error
	if err != nil {
		return nil, err
	}
	return &manga, nil
}

func (r *mangaRepository) Create(manga *models.Manga) error {
	return r.db.Create(manga).Error
}

func (r *mangaRepository) Update(manga *models.Manga) error {
	return r.db.Where("media_id = ?", manga.MediaID).Updates(manga).Error
}

func (r *mangaRepository) Delete(mediaID int) error {
	return r.db.Where("media_id = ?", mediaID).Delete(&models.Manga{}).Error
}

func (r *mangaRepository) Exists(mediaID int) (bool, error) {
	var count int64
	err := r.db.Model(&models.Manga{}).Where("media_id = ?", mediaID).Count(&count).Error
	return count > 0, err
}

func (r *mangaRepository) EditManga(mediaID int, updates map[string]interface{}) error {
	// Add updated_at timestamp
	updates["updated_at"] = gorm.Expr("CURRENT_TIMESTAMP")

	return r.db.Model(&models.Manga{}).Where("media_id = ?", mediaID).Updates(updates).Error
}

func (r *mangaRepository) Upsert(manga *models.Manga) error {
	// First, check if a record exists (including soft-deleted ones)
	var existingManga models.Manga
	err := r.db.Unscoped().Where("media_id = ?", manga.MediaID).First(&existingManga).Error

	if err != nil {
		// Record doesn't exist at all, create new one
		if err == gorm.ErrRecordNotFound {
			return r.db.Create(manga).Error
		}
		return err
	}

	// Record exists, check if it's soft-deleted
	if existingManga.DeletedAt.Valid {
		// Restore the soft-deleted record and update it
		manga.ID = existingManga.ID
		manga.CreatedAt = existingManga.CreatedAt
		return r.db.Unscoped().Where("media_id = ?", manga.MediaID).Updates(manga).Error
	} else {
		// Record exists and is not deleted, just update it
		return r.db.Where("media_id = ?", manga.MediaID).Updates(manga).Error
	}
}

func (r *mangaRepository) GetDeleted() ([]models.Manga, error) {
	var manga []models.Manga
	err := r.db.Unscoped().Where("deleted_at IS NOT NULL").Find(&manga).Error
	return manga, err
}

func (r *mangaRepository) Restore(mediaID int) error {
	return r.db.Unscoped().Model(&models.Manga{}).Where("media_id = ?", mediaID).Update("deleted_at", nil).Error
}

func (r *mangaRepository) PermanentlyDelete(mediaID int) error {
	return r.db.Unscoped().Where("media_id = ?", mediaID).Delete(&models.Manga{}).Error
}
