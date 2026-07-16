package session

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

const CookieName = "whatsapp_dev_session"

type Manager struct {
	username string
	password string
	token    string
	enabled  bool
}

func New(username, password string) *Manager {
	enabled := username != "" || password != ""
	token := ""
	if enabled {
		sum := sha256.Sum256([]byte(username + "\x00" + password))
		token = hex.EncodeToString(sum[:])
	}

	return &Manager{
		username: username,
		password: password,
		token:    token,
		enabled:  enabled,
	}
}

func (m *Manager) Enabled() bool {
	return m.enabled
}

func (m *Manager) ValidateCredentials(username, password string) bool {
	if !m.enabled {
		return true
	}

	usernameOK := subtle.ConstantTimeCompare([]byte(username), []byte(m.username)) == 1
	passwordOK := subtle.ConstantTimeCompare([]byte(password), []byte(m.password)) == 1
	return usernameOK && passwordOK
}

func (m *Manager) SetCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     CookieName,
		Value:    m.token,
		Path:     "/",
		HTTPOnly: true,
		SameSite: "Lax",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
	})
}

func (m *Manager) ClearCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		SameSite: "Lax",
		Expires:  time.Unix(0, 0),
	})
}

func (m *Manager) IsAuthenticated(c *fiber.Ctx) bool {
	if !m.enabled {
		return true
	}

	if subtle.ConstantTimeCompare([]byte(c.Cookies(CookieName)), []byte(m.token)) == 1 {
		return true
	}

	authHeader := c.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Basic ") {
		return false
	}

	decoded, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(authHeader, "Basic "))
	if err != nil {
		return false
	}

	parts := strings.SplitN(string(decoded), ":", 2)
	if len(parts) != 2 {
		return false
	}

	return m.ValidateCredentials(parts[0], parts[1])
}

func (m *Manager) Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if m.IsAuthenticated(c) {
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}
}
