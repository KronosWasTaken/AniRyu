package main

import (
	"log"

	"anilist-backend/internal/config"
	"anilist-backend/internal/database"
	"anilist-backend/internal/handlers"
	"anilist-backend/internal/middleware"
	"anilist-backend/internal/repositories"
	"anilist-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	db, err := database.Initialize(cfg.Database.Path)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	animeRepo := repositories.NewAnimeRepository(db)
	mangaRepo := repositories.NewMangaRepository(db)

	animeService := services.NewAnimeService(animeRepo)
	mangaService := services.NewMangaService(mangaRepo)
	anilistService := services.NewAniListService(cfg.AniList.APIURL)
	importService := services.NewImportService(animeRepo, mangaRepo, anilistService)

	animeHandler := handlers.NewAnimeHandler(animeService, anilistService)
	mangaHandler := handlers.NewMangaHandler(mangaService, anilistService)
	searchHandler := handlers.NewSearchHandler(anilistService, animeService, mangaService)
	importHandler := handlers.NewImportHandler(importService)
	editHandler := handlers.NewEditHandler(animeRepo, mangaRepo)
	addMediaHandler := handlers.NewAddMediaHandler(animeService, mangaService, anilistService)

	router := setupRouter(cfg, animeHandler, mangaHandler, searchHandler, importHandler, editHandler, addMediaHandler)

	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Starting server on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(cfg *config.Config, animeHandler *handlers.AnimeHandler, mangaHandler *handlers.MangaHandler, searchHandler *handlers.SearchHandler, importHandler *handlers.ImportHandler, editHandler *handlers.EditHandler, addMediaHandler *handlers.AddMediaHandler) *gin.Engine {
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api")
	{
		api.GET("/rating_type", func(c *gin.Context) {
			c.JSON(200, gin.H{"rating_type": cfg.Rating.Type})
		})

		anime := api.Group("/list")
		{
			anime.GET("/anime", animeHandler.GetList)
			anime.POST("/anime", animeHandler.AddMedia)
			anime.DELETE("/anime/:id", animeHandler.DeleteEntry)
		}

		api.GET("/anime/deleted", animeHandler.GetDeleted)
		api.POST("/anime/restore", animeHandler.Restore)
		api.DELETE("/anime/permanent", animeHandler.PermanentlyDelete)

		manga := api.Group("/list")
		{
			manga.GET("/manga", mangaHandler.GetList)
			manga.POST("/manga", mangaHandler.AddMedia)
			manga.DELETE("/manga/:id", mangaHandler.DeleteEntry)
		}

		api.GET("/manga/deleted", mangaHandler.GetDeleted)
		api.POST("/manga/restore", mangaHandler.Restore)
		api.DELETE("/manga/permanent", mangaHandler.PermanentlyDelete)

		api.GET("/search", searchHandler.Search)
		api.GET("/check_exists", searchHandler.CheckExists)

		api.POST("/add_media", addMediaHandler.AddMedia)

		api.POST("/import", importHandler.ImportUserList)
		api.POST("/import/progress", importHandler.ImportUserListWithProgress)
		api.GET("/import/status", importHandler.GetImportStatus)

		api.PUT("/anime/:id", editHandler.EditAnime)
		api.PUT("/manga/:id", editHandler.EditManga)
	}

	return router
}
