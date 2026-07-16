package src

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mjarkk/whatsapp-dev/go/controller/auth"
	"github.com/mjarkk/whatsapp-dev/go/controller/conversations"
	"github.com/mjarkk/whatsapp-dev/go/controller/templates"
	"github.com/mjarkk/whatsapp-dev/go/controller/webhooks"
	"github.com/mjarkk/whatsapp-dev/go/controller/websocket"
	"github.com/mjarkk/whatsapp-dev/go/lib/session"
	"github.com/mjarkk/whatsapp-dev/go/state"
)

func apiRoutes(r fiber.Router, sessions *session.Manager) {
	r.Use(func(c *fiber.Ctx) error {
		err := c.Next()
		if err == nil {
			return nil
		}

		return c.Status(400).JSON(ErrorResponse{
			Error: err.Error(),
		})
	})

	authCtrl := &auth.Controller{Sessions: sessions}
	r.Get("/auth/status", authCtrl.Status)
	r.Post("/auth/login", authCtrl.Login)
	r.Post("/auth/logout", authCtrl.Logout)

	protected := r.Group("", sessions.Middleware())

	protected.Get("/events", websocket.EventsRoute)

	protected.Get("/info", func(c *fiber.Ctx) error {
		return c.JSON(struct {
			GraphToken         string `json:"graphToken"`
			AppSecret          string `json:"appSecret"`
			PhoneNumber        string `json:"phoneNumber"`
			PhoneNumberID      string `json:"phoneNumberID"`
			WebhookURL         string `json:"webhookURL"`
			WebhookVerifyToken string `json:"webhookVerifyToken"`
		}{
			GraphToken:         state.GraphToken.Get(),
			AppSecret:          state.AppSecret.Get(),
			PhoneNumber:        state.PhoneNumber.Get(),
			PhoneNumberID:      state.PhoneNumberID.Get(),
			WebhookURL:         state.WebhookURL.Get(),
			WebhookVerifyToken: state.WebhookVerifyToken.Get(),
		})
	})

	protected.Get("/conversations", conversations.Index)
	protected.Post("/conversations", conversations.Create)
	protected.Post("/conversations/:id", conversations.CreateMessage)
	protected.Post("/conversations/:id/btnQuickReply/:btnId", conversations.BtnQuickReply)
	protected.Delete("/conversations/:id", conversations.Clear)

	protected.Get("/templates", templates.Index)
	protected.Post("/templates", templates.Create)
	protected.Patch("/templates/:id", templates.Update)
	protected.Delete("/templates/:id", templates.Delete)

	protected.Post("/webhook/test", webhooks.Test)
}
