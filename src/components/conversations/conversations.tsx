import { Button } from "@/components/ui/button"
import { fetch } from "@/services/fetch"
import { useEffect, useState } from "react"
import { useConversationsStore } from "@/services/state"
import { NewChatDialog } from "./new"
import { Conversation } from "./conversation"

export function Conversations() {
	const [newConversationOpen, setNewConversationOpen] = useState(false)
	const { conversations, setConversations, newConversation } =
		useConversationsStore()

	const getData = async () => {
		const conversationsResponse = await fetch("/api/conversations")
		setConversations(await conversationsResponse.json())
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<>
			<div mb-4 flex flex-wrap gap-4 justify-between items-center>
				<p m-0 text-zinc-400 text-sm>
					Inspect inbound and outbound messages for each phone number.
				</p>
				<Button onClick={() => setNewConversationOpen(true)}>
					New conversation!
				</Button>
			</div>
			{conversations ? (
				<div flex flex-wrap gap-4>
					{conversations.map((conversation) => (
						<Conversation
							conversation={conversation}
							key={conversation.phoneNumberId}
						/>
					))}
				</div>
			) : undefined}
			<NewChatDialog
				open={newConversationOpen}
				newConversation={newConversation}
				close={() => setNewConversationOpen(false)}
			/>
		</>
	)
}
