package services

import (
	"anilist-backend/internal/models"
	"anilist-backend/internal/repositories"
)

type AnimeService interface {
	GetList() ([]models.MediaEntry, error)
	AddMedia(mediaID int, title string, status string, score, progress, total int, image, notes string, isAdult bool) error
	UpdateEntry(mediaID int, progress, score int, status string) error
	DeleteEntry(mediaID int) error
	CheckExists(mediaID int) (bool, error)
	GetDeleted() ([]models.Anime, error)
	Restore(mediaID int) error
	PermanentlyDelete(mediaID int) error
}

type animeService struct {
	repo repositories.AnimeRepository
}

func NewAnimeService(repo repositories.AnimeRepository) AnimeService {
	return &animeService{repo: repo}
}

func (s *animeService) GetList() ([]models.MediaEntry, error) {
	anime, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	entries := make([]models.MediaEntry, len(anime))
	for i, a := range anime {
		entries[i] = models.MediaEntry{
			Title:    a.Title,
			MediaID:  a.MediaID,
			Status:   string(a.Status),
			Score:    a.Score,
			Progress: a.Progress,
			Total:    a.Total,
			Image:    a.Image,
			Notes:    a.Notes,
			IsAdult:  a.IsAdult,
		}
	}

	return entries, nil
}

func (s *animeService) AddMedia(mediaID int, title string, status string, score, progress, total int, image, notes string, isAdult bool) error {
	anime := &models.Anime{
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

	return s.repo.Create(anime)
}

func (s *animeService) UpdateEntry(mediaID int, progress, score int, status string) error {
	anime, err := s.repo.GetByMediaID(mediaID)
	if err != nil {
		return err
	}

	anime.Progress = progress
	anime.Score = score
	anime.Status = models.Status(status)

	return s.repo.Update(anime)
}

func (s *animeService) DeleteEntry(mediaID int) error {
	return s.repo.Delete(mediaID)
}

func (s *animeService) CheckExists(mediaID int) (bool, error) {
	return s.repo.Exists(mediaID)
}

func (s *animeService) GetDeleted() ([]models.Anime, error) {
	return s.repo.GetDeleted()
}

func (s *animeService) Restore(mediaID int) error {
	return s.repo.Restore(mediaID)
}

func (s *animeService) PermanentlyDelete(mediaID int) error {
	return s.repo.PermanentlyDelete(mediaID)
}
