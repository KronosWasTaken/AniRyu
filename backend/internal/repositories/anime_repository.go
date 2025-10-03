package repositories

import (
	"anilist-backend/internal/models"

	"gorm.io/gorm"
)

type AnimeRepository interface {
	GetAll() ([]models.Anime, error)
	GetByMediaID(mediaID int) (*models.Anime, error)
	Create(anime *models.Anime) error
	Update(anime *models.Anime) error
	Delete(mediaID int) error
	Exists(mediaID int) (bool, error)
	EditAnime(mediaID int, updates map[string]interface{}) error
	Upsert(anime *models.Anime) error
	GetDeleted() ([]models.Anime, error)
	Restore(mediaID int) error
	PermanentlyDelete(mediaID int) error
}

type animeRepository struct {
	db *gorm.DB
}

func NewAnimeRepository(db *gorm.DB) AnimeRepository {
	return &animeRepository{db: db}
}

func (r *animeRepository) GetAll() ([]models.Anime, error) {
	var anime []models.Anime
	err := r.db.Find(&anime).Error
	return anime, err
}

func (r *animeRepository) GetByMediaID(mediaID int) (*models.Anime, error) {
	var anime models.Anime
	err := r.db.Where("media_id = ?", mediaID).First(&anime).Error
	if err != nil {
		return nil, err
	}
	return &anime, nil
}

func (r *animeRepository) Create(anime *models.Anime) error {
	return r.db.Create(anime).Error
}

func (r *animeRepository) Update(anime *models.Anime) error {
	return r.db.Where("media_id = ?", anime.MediaID).Updates(anime).Error
}

func (r *animeRepository) Delete(mediaID int) error {
	return r.db.Where("media_id = ?", mediaID).Delete(&models.Anime{}).Error
}

func (r *animeRepository) Exists(mediaID int) (bool, error) {
	var count int64
	err := r.db.Model(&models.Anime{}).Where("media_id = ?", mediaID).Count(&count).Error
	return count > 0, err
}

func (r *animeRepository) EditAnime(mediaID int, updates map[string]interface{}) error {
	// Add updated_at timestamp
	updates["updated_at"] = gorm.Expr("CURRENT_TIMESTAMP")

	return r.db.Model(&models.Anime{}).Where("media_id = ?", mediaID).Updates(updates).Error
}

func (r *animeRepository) Upsert(anime *models.Anime) error {
	// First, check if a record exists (including soft-deleted ones)
	var existingAnime models.Anime
	err := r.db.Unscoped().Where("media_id = ?", anime.MediaID).First(&existingAnime).Error

	if err != nil {
		// Record doesn't exist at all, create new one
		if err == gorm.ErrRecordNotFound {
			return r.db.Create(anime).Error
		}
		return err
	}

	// Record exists, check if it's soft-deleted
	if existingAnime.DeletedAt.Valid {
		// Restore the soft-deleted record and update it
		anime.ID = existingAnime.ID
		anime.CreatedAt = existingAnime.CreatedAt
		return r.db.Unscoped().Where("media_id = ?", anime.MediaID).Updates(anime).Error
	} else {
		// Record exists and is not deleted, just update it
		return r.db.Where("media_id = ?", anime.MediaID).Updates(anime).Error
	}
}

func (r *animeRepository) GetDeleted() ([]models.Anime, error) {
	var anime []models.Anime
	err := r.db.Unscoped().Where("deleted_at IS NOT NULL").Find(&anime).Error
	return anime, err
}

func (r *animeRepository) Restore(mediaID int) error {
	return r.db.Unscoped().Model(&models.Anime{}).Where("media_id = ?", mediaID).Update("deleted_at", nil).Error
}

func (r *animeRepository) PermanentlyDelete(mediaID int) error {
	return r.db.Unscoped().Where("media_id = ?", mediaID).Delete(&models.Anime{}).Error
}
