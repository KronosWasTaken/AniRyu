package database

import (
	"os"
	"path/filepath"

	"anilist-backend/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(dbPath string) (*gorm.DB, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	if err := migrate(db); err != nil {
		return nil, err
	}

	return db, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Anime{},
		&models.Manga{},
	)
}
