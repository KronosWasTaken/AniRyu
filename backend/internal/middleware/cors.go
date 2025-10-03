package middleware

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS(allowedOrigins string) gin.HandlerFunc {
	config := cors.DefaultConfig()

	if allowedOrigins == "*" {
		config.AllowAllOrigins = true
	} else {
		config.AllowOrigins = []string{allowedOrigins}
	}

	config.AllowMethods = []string{
		http.MethodGet,
		http.MethodPost,
		http.MethodPut,
		http.MethodDelete,
		http.MethodOptions,
	}

	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Accept",
		"Authorization",
		"X-Requested-With",
		"Access-Control-Allow-Origin",
	}

	config.AllowCredentials = true

	return cors.New(config)
}
