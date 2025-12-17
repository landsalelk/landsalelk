"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
    password: string
    showRequirements?: boolean
}

interface Requirement {
    label: string
    met: boolean
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
    const analysis = useMemo(() => {
        const requirements: Requirement[] = [
            { label: "At least 8 characters", met: password.length >= 8 },
            { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
            { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
            { label: "Contains number", met: /[0-9]/.test(password) },
            { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
        ]

        const metCount = requirements.filter(r => r.met).length

        let strength: "weak" | "fair" | "good" | "strong" = "weak"
        let color = "bg-red-500"
        let label = "Weak"

        if (metCount >= 5) {
            strength = "strong"
            color = "bg-emerald-500"
            label = "Strong"
        } else if (metCount >= 4) {
            strength = "good"
            color = "bg-green-500"
            label = "Good"
        } else if (metCount >= 3) {
            strength = "fair"
            color = "bg-yellow-500"
            label = "Fair"
        }

        return { requirements, metCount, strength, color, label }
    }, [password])

    if (!password) return null

    const widthClass = {
        1: "w-1/5",
        2: "w-2/5",
        3: "w-3/5",
        4: "w-4/5",
        5: "w-full",
    }[analysis.metCount] || "w-0"

    return (
        <div className="space-y-2 mt-2">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-300",
                            analysis.color,
                            widthClass
                        )}
                    />
                </div>
                <p className={cn(
                    "text-xs font-medium",
                    analysis.strength === "weak" && "text-red-600",
                    analysis.strength === "fair" && "text-yellow-600",
                    analysis.strength === "good" && "text-green-600",
                    analysis.strength === "strong" && "text-emerald-600"
                )}>
                    Password strength: {analysis.label}
                </p>
            </div>

            {/* Requirements List */}
            {showRequirements && (
                <ul className="text-xs space-y-1">
                    {analysis.requirements.map((req, i) => (
                        <li key={i} className={cn(
                            "flex items-center gap-1.5",
                            req.met ? "text-emerald-600" : "text-muted-foreground"
                        )}>
                            {req.met ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <X className="h-3 w-3" />
                            )}
                            {req.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// Form Validation Helper Component
interface FormFieldErrorProps {
    error?: string
}

export function FormFieldError({ error }: FormFieldErrorProps) {
    if (!error) return null

    return (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <X className="h-3 w-3" />
            {error}
        </p>
    )
}

// Email Validation Helper
export function validateEmail(email: string): string | null {
    if (!email) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address"
    return null
}

// Password Validation Helper
export function validatePassword(password: string): string | null {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    return null
}

// Name Validation Helper
export function validateName(name: string): string | null {
    if (!name) return "Name is required"
    if (name.length < 2) return "Name must be at least 2 characters"
    return null
}
