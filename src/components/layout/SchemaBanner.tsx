import type { ReactNode } from "react"
import { SCHEMA_MIGRATION_HINT } from "@/lib/api"
import { useApp } from "@/context/AppContext"

export function SchemaBanner({ className = "" }: { className?: string }) {
  const { data } = useApp()
  if (!data || data.schemaV2) return null

  return (
    <div
      className={`rounded-2xl border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-amber-950 ${className}`}
      role="status"
    >
      <strong>Database upgrade needed.</strong> {SCHEMA_MIGRATION_HINT}
    </div>
  )
}

export function SchemaGate({ children }: { children: ReactNode }) {
  return (
    <>
      <SchemaBanner className="mt-3" />
      {children}
    </>
  )
}
