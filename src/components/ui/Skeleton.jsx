import { cn } from "@/lib/utils"

/**
 * Skeleton component for loading states.
 * Uses the .skeleton class for a shimmer effect.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
