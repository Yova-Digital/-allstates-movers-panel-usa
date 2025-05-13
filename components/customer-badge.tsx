import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CustomerBadgeProps {
  isReturning: boolean
  className?: string
}

export function CustomerBadge({ isReturning, className }: CustomerBadgeProps) {
  if (!isReturning) return null

  return (
    <Badge variant="outline" className={cn("bg-purple-500/20 text-purple-500 hover:bg-purple-500/20", className)}>
      Returning Customer
    </Badge>
  )
}
