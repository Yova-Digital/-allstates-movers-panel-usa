import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "pending" | "completed" | "cancelled" | "in-progress"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/20 text-green-500 hover:bg-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/20 text-red-500 hover:bg-red-500/20",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
