"use client"

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react"
import { SignInDialog } from "@/components/auth/sign-in-dialog"

type Role = "SUPPORTER" | "CREATOR"

type AuthModalContextValue = {
	open: boolean
	setOpen: (open: boolean) => void
	/** Opens the dialog; default tab is Supporter unless you pass `creator`. */
	openSignIn: (intent?: "supporter" | "creator") => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const [defaultRole, setDefaultRole] = useState<Role>("SUPPORTER")

	const openSignIn = useCallback((intent?: "supporter" | "creator") => {
		setDefaultRole(intent === "creator" ? "CREATOR" : "SUPPORTER")
		setOpen(true)
	}, [])

	const value = useMemo(
		() => ({ open, setOpen, openSignIn }),
		[open, openSignIn],
	)

	return (
		<AuthModalContext.Provider value={value}>
			{children}
			<SignInDialog
				open={open}
				onOpenChange={setOpen}
				defaultRole={defaultRole}
			/>
		</AuthModalContext.Provider>
	)
}

export function useAuthModal() {
	const ctx = useContext(AuthModalContext)
	if (!ctx) {
		throw new Error("useAuthModal must be used within AuthModalProvider")
	}
	return ctx
}
