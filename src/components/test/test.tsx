import { HelloWorldTemplateExample } from "./template"
import { HelloWorldMessage } from "./message"
import { State } from "@/services/state"

export interface TestProps {
	state: State
}

export function Test({ state }: TestProps) {
	return (
		<div flex flex-col gap-6>
			<p m-0 text-zinc-400 text-sm>
				Copy-ready examples for sending templates and text messages against
				this mock API.
			</p>
			<HelloWorldTemplateExample state={state} />
			<HelloWorldMessage state={state} />
		</div>
	)
}
