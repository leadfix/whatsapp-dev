import { useEffect, useState } from "react"
import { App } from "./App"
import { Login } from "./Login"
import { AuthStatus, getAuthStatus } from "@/services/auth"

export function Root() {
	const [auth, setAuth] = useState<AuthStatus | null>(null)
	const [error, setError] = useState("")

	const refreshAuth = async () => {
		try {
			const status = await getAuthStatus()
			setAuth(status)
			setError("")
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load auth status")
		}
	}

	useEffect(() => {
		refreshAuth()

		const onUnauthorized = () => {
			setAuth((prev) =>
				prev
					? { ...prev, authenticated: false }
					: { required: true, authenticated: false },
			)
		}
		window.addEventListener("whatsapp-dev:unauthorized", onUnauthorized)
		return () => {
			window.removeEventListener("whatsapp-dev:unauthorized", onUnauthorized)
		}
	}, [])

	if (error) {
		return (
			<div
				min-h-screen
				flex
				items-center
				justify-center
				bg-zinc-950
				text-red-400
				p-4
			>
				{error}
			</div>
		)
	}

	if (!auth) {
		return (
			<div
				min-h-screen
				flex
				items-center
				justify-center
				bg-zinc-950
				text-zinc-400
			>
				Loading...
			</div>
		)
	}

	if (auth.required && !auth.authenticated) {
		return (
			<Login
				onSuccess={() =>
					setAuth({
						required: true,
						authenticated: true,
					})
				}
			/>
		)
	}

	return (
		<App
			showLogout={auth.required}
			onLogout={() =>
				setAuth({
					required: auth.required,
					authenticated: false,
				})
			}
		/>
	)
}
