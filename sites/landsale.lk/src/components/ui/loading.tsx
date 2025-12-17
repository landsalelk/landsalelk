import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    return (
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
    )
}

interface LoadingOverlayProps {
    message?: string
    children?: React.ReactNode
}

export function LoadingOverlay({ message = "Loading...", children }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card shadow-lg border">
                <LoadingSpinner size="lg" />
                <p className="text-lg font-medium text-foreground">{message}</p>
                {children}
            </div>
        </div>
    )
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    children: React.ReactNode
}

export function LoadingButton({ loading, children, className, disabled, ...props }: LoadingButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" />}
            {children}
        </button>
    )
}

// Inline loader for content areas
export function InlineLoader({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="md" />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
    )
}

// Page loader for full-page loading states
export function PageLoader({ message = "Loading page..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-lg font-medium text-foreground">{message}</p>
        </div>
    )
}
