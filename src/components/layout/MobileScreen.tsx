import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type MobileScreenProps = {
  children: ReactNode
  className?: string
}

/** Centered mobile PWA column — auth, onboarding, loading */
export function MobileScreen({ children, className }: MobileScreenProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background px-5",
        "pt-[calc(20px+env(safe-area-inset-top))] pb-[calc(20px+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  )
}

type AuthCardProps = {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}
