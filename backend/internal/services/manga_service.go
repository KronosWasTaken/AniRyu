package services

import (
	"anilist-backend/internal/models"
	"anilist-backend/internal/repositories"
)

type MangaService interface {
	GetList() ([]models.MediaEntry, error)
	AddMedia(mediaID int, title string, status string, score, progress, total int, image, notes string, isAdult bool) error
	UpdateEntry(mediaID int, progress, score int, status string) error
	DeleteEntry(mediaID int) error
	CheckExists(mediaID int) (bool, error)
	GetDeleted() ([]models.Manga, error)
	Restore(mediaID int) error
	PermanentlyDelete(mediaID int) error
}

type mangaService struct {
	repo repositories.MangaRepository
}

func NewMangaService(repo repositories.MangaRepository) MangaService {
	return &mangaService{repo: repo}
}

func (s *mangaService) GetList() ([]models.MediaEntry, error) {
	manga, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	entries := make([]models.MediaEntry, len(manga))
	for i, m := range manga {
		entries[i] = models.MediaEntry{
			Title:    m.Title,
			MediaID:  m.MediaID,
			Status:   string(m.Status),
			Score:    m.Score,
			Progress: m.Progress,
			Total:    m.Total,
			Image:    m.Image,
			Notes:    m.Notes,
			IsAdult:  m.IsAdult,
		}
	}

	return entries, nil
}

func (s *mangaService) AddMedia(mediaID int, title string, status string, score, progress, total int, image, notes string, isAdult bool) error {
	manga := &models.Manga{
		Title:    title,
		MediaID:  mediaID,
		Status:   models.Status(status),
		Score:    score,
		Progress: progress,
		Total:    total,
		Image:    image,
		Notes:    notes,
		IsAdult:  isAdult,
	}

	return s.repo.Create(manga)
}

func (s *mangaService) UpdateEntry(mediaID int, progress, score int, status string) error {
	manga, err := s.repo.GetByMediaID(mediaID)
	if err != nil {
		return err
	}

	manga.Progress = progress
	manga.Score = score
	manga.Status = models.Status(status)

	return s.repo.Update(manga)
}

func (s *mangaService) DeleteEntry(mediaID int) error {
	return s.repo.Delete(mediaID)
}

func (s *mangaService) CheckExists(mediaID int) (bool, error) {
	return s.repo.Exists(mediaID)
}

func (s *mangaService) GetDeleted() ([]models.Manga, error) {
	return s.repo.GetDeleted()
}

func (s *mangaService) Restore(mediaID int) error {
	return s.repo.Restore(mediaID)
}

func (s *mangaService) PermanentlyDelete(mediaID int) error {
	return s.repo.PermanentlyDelete(mediaID)
}
