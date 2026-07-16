/* @refresh reload */
import "./theme.css"
import "./global.css"

import "virtual:uno.css"

import { Root } from "./pages/Root"
import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "@/components/ui/sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Root />
		<Toaster />
	</React.StrictMode>,
)
