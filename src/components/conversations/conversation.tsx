import { ShowMessage } from "./singleMessage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetch, post } from "@/services/fetch"
import { FormEvent, useEffect, useRef, useState } from "react"
import { useConversationsStore, type Conversation } from "@/services/state"
import { TrashIcon } from "@radix-ui/react-icons"

export interface ConversationProps {
	conversation: Conversation
}

export function Conversation(props: ConversationProps) {
	const { updateConversation, removeConversation } = useConversationsStore()
	const [msgCount, setMsgCount] = useState(0)
	const [isClearing, setIsClearing] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const onSendMessage = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const target = e.target as HTMLFormElement

		const formData = new FormData(target)
		const message = Object.fromEntries(formData).message
		if (message === "") return

		target.reset()
		const response = await post(`/api/conversations/${props.conversation.ID}`, {
			message,
		})
		updateConversation(await response.json())
	}

	const onClearConversation = async () => {
		if (isClearing) return
		if (
			!window.confirm(
				`Clear conversation with ${props.conversation.phoneNumber}? This cannot be undone.`,
			)
		) {
			return
		}

		setIsClearing(true)
		try {
			await fetch(`/api/conversations/${props.conversation.ID}`, {
				method: "DELETE",
			})
			removeConversation(props.conversation.ID)
		} finally {
			setIsClearing(false)
		}
	}

	useEffect(() => {
		if (msgCount === props.conversation.messages.length) {
			return
		}

		const smooth = msgCount > 0
		setMsgCount(props.conversation.messages.length)

		const parentEl = messagesEndRef.current?.parentElement?.parentElement
		if (!parentEl) {
			return
		}

		parentEl.scroll({
			top: parentEl.scrollHeight - parentEl.getBoundingClientRect().height,
			behavior: smooth ? "smooth" : "instant",
		})
	}, [props])

	return (
		<div key={props.conversation.phoneNumber} bg-zinc-900 w-100 rounded>
			<h4
				m-0
				p-3
				border-solid
				border-0
				border-b-2
				border-zinc-700
				text-zinc-200
				flex
				items-center
				justify-between
				gap-2
			>
				<span>{props.conversation.phoneNumber}</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onClearConversation}
					disabled={isClearing}
					title="Clear conversation"
					aria-label="Clear conversation"
				>
					<TrashIcon />
				</Button>
			</h4>
			<div h-130 overflow-y-auto>
				<div flex flex-col justify-end>
					{props.conversation.messages.map((message) => (
						<ShowMessage key={message.whatsappID} message={message} />
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>
			<form bg-zinc-700 onSubmit={onSendMessage}>
				<Input type="text" name="message" placeholder="message" />
			</form>
		</div>
	)
}
