package src

import (
	"embed"
	"fmt"
	"log"
	"math/rand"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/mjarkk/whatsapp-dev/go/lib/session"
)

// ErrorResponse is the response send by the server when an error occurs
type ErrorResponse struct {
	Error string `json:"error"`
}

// StartWebserverOptions are the options for the webserver
type StartWebserverOptions struct {
	Addr              string
	BasicAuthUsername string
	BasicAuthPassword string
	Rand              *rand.Rand
	Dist              embed.FS
}

// StartWebserver starts the webserver
func StartWebserver(opts StartWebserverOptions) {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	sessions := session.New(opts.BasicAuthUsername, opts.BasicAuthPassword)

	app.Use(compress.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3001,http://127.0.0.1:3001",
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))
	app.Use(logger.New())

	apiRoutes(app.Group("/api"), sessions)
	mockRoutes(app.Group(""))

	// SPA stays public so the login page can load; API routes enforce auth.
	app.Group("", filesystem.New(filesystem.Config{
		PathPrefix: "dist",
		Index:      "index.html",
		Root:       http.FS(opts.Dist),
	}))

	fmt.Println("Running Web server at", opts.Addr)
	if sessions.Enabled() {
		fmt.Println("HTTP auth enabled: UI requires login when HTTP_USERNAME/HTTP_PASSWORD are set")
	}
	log.Fatal(app.Listen(opts.Addr))
}
