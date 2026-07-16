import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/services/auth"

export interface LoginProps {
	onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError("")
		setIsSubmitting(true)
		try {
			await login(username, password)
			onSuccess()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div
			min-h-screen
			flex
			items-center
			justify-center
			px-4
			bg-zinc-950
			text-zinc-100
		>
			<div
				w-full
				max-w-md
				bg-zinc-900
				border
				border-zinc-800
				rounded-lg
				p-6
				shadow-lg
			>
				<div mb-6>
					<h1 m-0 text-2xl>
						Whatsapp Dev
					</h1>
					<p m-0 mt-2 text-sm text-zinc-400>
						Sign in to access staging data and the developer UI.
					</p>
				</div>

				<form flex flex-col gap-4 onSubmit={onSubmit}>
					<div flex flex-col gap-2>
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							name="username"
							autoComplete="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>
					<div flex flex-col gap-2>
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{error ? (
						<p m-0 text-sm text-red-400 role="alert">
							{error}
						</p>
					) : undefined}

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</div>
		</div>
	)
}
