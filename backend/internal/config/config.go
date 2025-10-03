package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	CORS     CORSConfig
	AniList  AniListConfig
	Rating   RatingConfig
}

type ServerConfig struct {
	Host        string
	Port        string
	Environment string
}

type DatabaseConfig struct {
	Path string
}

type CORSConfig struct {
	AllowedOrigins string
}

type AniListConfig struct {
	APIURL string
}

type RatingConfig struct {
	Type string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
	}

	return &Config{
		Server: ServerConfig{
			Host:        getEnv("HOST", "localhost"),
			Port:        getEnv("PORT", "3001"),
			Environment: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Path: getEnv("DB_PATH", "./data/list.db"),
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnv("ALLOWED_ORIGINS", "*"),
		},
		AniList: AniListConfig{
			APIURL: getEnv("ANILIST_API_URL", "https://graphql.anilist.co"),
		},
		Rating: RatingConfig{
			Type: getEnv("RATING_TYPE", "stars"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
