package auth

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/mjarkk/whatsapp-dev/go/lib/session"
)

type Controller struct {
	Sessions *session.Manager
}

func (ctrl *Controller) Status(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"required":      ctrl.Sessions.Enabled(),
		"authenticated": ctrl.Sessions.IsAuthenticated(c),
	})
}

func (ctrl *Controller) Login(c *fiber.Ctx) error {
	if !ctrl.Sessions.Enabled() {
		return c.JSON(fiber.Map{
			"ok": true,
		})
	}

	request := struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{}
	if err := c.BodyParser(&request); err != nil {
		return err
	}
	if request.Username == "" || request.Password == "" {
		return errors.New("username and password are required")
	}
	if !ctrl.Sessions.ValidateCredentials(request.Username, request.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid username or password",
		})
	}

	ctrl.Sessions.SetCookie(c)
	return c.JSON(fiber.Map{
		"ok": true,
	})
}

func (ctrl *Controller) Logout(c *fiber.Ctx) error {
	ctrl.Sessions.ClearCookie(c)
	return c.JSON(fiber.Map{
		"ok": true,
	})
}
