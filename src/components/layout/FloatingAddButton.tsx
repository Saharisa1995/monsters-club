import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FloatingAddButtonProps = {
  onClick: () => void
  className?: string
}

export function FloatingAddButton({ onClick, className }: FloatingAddButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onClick}
      className={cn(
        "fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-[max(1rem,calc(50%-220px))] z-30 h-14 w-14 rounded-full shadow-lg",
        className,
      )}
      aria-label="Add habit"
    >
      <Plus className="h-7 w-7" />
    </Button>
  )
}
