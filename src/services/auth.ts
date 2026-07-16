import { getUrl } from "./fetch"

export interface AuthStatus {
	required: boolean
	authenticated: boolean
}

export async function getAuthStatus(): Promise<AuthStatus> {
	const response = await window.fetch(getUrl("/api/auth/status"), {
		credentials: "include",
	})
	if (!response.ok) {
		throw new Error("Failed to load auth status")
	}
	return response.json()
}

export async function login(username: string, password: string): Promise<void> {
	const response = await window.fetch(getUrl("/api/auth/login"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	})

	if (!response.ok) {
		let errMsg = await response.text()
		try {
			errMsg = JSON.parse(errMsg).error
		} catch {
			// Ignore
		}
		throw new Error(errMsg || "Login failed")
	}
}

export async function logout(): Promise<void> {
	const response = await window.fetch(getUrl("/api/auth/logout"), {
		method: "POST",
		credentials: "include",
	})
	if (!response.ok) {
		throw new Error("Logout failed")
	}
}
