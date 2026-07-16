import { fetch } from "@/services/fetch"
import { Fragment, useEffect, useState } from "react"
import { Conversations } from "@/components/conversations/conversations"
import { Templates } from "@/components/templates/templates"
import { Test } from "@/components/test/test"
import { State, useConversationsStore } from "@/services/state"
import { EventsWebsocket } from "@/services/websocket"
import { cn } from "@/lib/utils"

type TabId = "conversations" | "templates" | "examples"

const tabs: Array<{ id: TabId; label: string }> = [
	{ id: "conversations", label: "Conversations" },
	{ id: "templates", label: "Templates" },
	{ id: "examples", label: "API Examples" },
]

export function App() {
	const [state, setState] = useState<State>({
		graphToken: "",
		appSecret: "",
		phoneNumber: "",
		phoneNumberID: "",
		webhookURL: "",
	})
	const [activeTab, setActiveTab] = useState<TabId>("conversations")

	const getData = async () => {
		const stateResponse = await fetch("/api/info")
		setState(await stateResponse.json())
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<div min-h-screen bg-zinc-950 text-zinc-100>
			<div
				px-5
				py-4
				bg-zinc-900
				border-b
				border-zinc-800
				flex
				flex-wrap
				items-center
				justify-between
				gap-4
			>
				<div>
					<h1 m-0 text-2xl>
						Whatsapp Dev
					</h1>
					<p m-0 text-sm text-zinc-400>
						{state.phoneNumber}{" "}
						<span italic>
							(id: {state.phoneNumberID})
						</span>
					</p>
				</div>
			</div>

			<nav
				px-5
				pt-4
				flex
				gap-1
				border-b
				border-zinc-800
				bg-zinc-950
				overflow-x-auto
			>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-4 py-2 text-sm font-medium rounded-t-md border border-b-0 transition-colors",
							activeTab === tab.id
								? "bg-zinc-900 text-zinc-100 border-zinc-700"
								: "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200",
						)}
					>
						{tab.label}
					</button>
				))}
			</nav>

			<div p-4>
				{activeTab === "conversations" ? <Conversations /> : undefined}
				{activeTab === "templates" ? <Templates /> : undefined}
				{activeTab === "examples" ? <Test state={state} /> : undefined}
			</div>

			<WebsocketHandler />
		</div>
	)
}

function WebsocketHandler() {
	const { addMessage } = useConversationsStore()

	useEffect(() => {
		const ws = new EventsWebsocket((data) => {
			console.log("websocket message:", data)
			if (data.type === "message") {
				addMessage(data.message)
			}
		})
		ws.start()
		return () => ws.close()
	}, [])

	return <Fragment></Fragment>
}
