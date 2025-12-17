"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MapPin, Phone, User, Briefcase, Mail, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createAgentProfile } from "@/lib/actions/agents"
import { getCurrentUser } from "@/lib/appwrite/server"
import Link from "next/link"

interface AgentFormData {
    fullName: string
    email: string
    phone: string
    whatsapp: string
    bio: string
    experience: string
}

const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
]

const SPECIALIZATIONS = [
    "Residential Land", "Commercial Property", "Agricultural Land",
    "Tea Estates", "Coconut Estates", "Beach Property", "Hill Country"
]

interface AgentRegistrationFormProps {
    userId?: string
    userEmail?: string
    userName?: string
}

export function AgentRegistrationForm({ userId, userEmail, userName }: AgentRegistrationFormProps) {
    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<AgentFormData>({
        defaultValues: {
            fullName: userName || "",
            email: userEmail || ""
        }
    })

    // Pre-fill form if user data is provided
    useEffect(() => {
        if (userName) setValue("fullName", userName)
        if (userEmail) setValue("email", userEmail)
    }, [userName, userEmail, setValue])

    const toggleArea = (area: string) => {
        setSelectedAreas(prev =>
            prev.includes(area)
                ? prev.filter(a => a !== area)
                : prev.length < 5 ? [...prev, area] : prev
        )
    }

    const toggleSpec = (spec: string) => {
        setSelectedSpecs(prev =>
            prev.includes(spec)
                ? prev.filter(s => s !== spec)
                : [...prev, spec]
        )
    }

    const onSubmit = async (data: AgentFormData) => {
        // Validate user is logged in
        if (!userId) {
            toast.error("Please log in to register as an agent")
            return
        }

        if (selectedAreas.length === 0) {
            toast.error("Please select at least one service area")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createAgentProfile({
                userId,
                fullName: data.fullName,
                phone: data.phone,
                whatsapp: data.whatsapp || data.phone,
                bio: data.bio,
                experience: parseInt(data.experience) || 0,
                serviceAreas: selectedAreas,
                specializations: selectedSpecs
            })

            if (result.success) {
                setIsSuccess(true)
                toast.success("Application Submitted!", {
                    description: "We'll review your profile and activate it within 24 hours."
                })
            } else {
                toast.error(result.error || "Something went wrong. Please try again.")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Show login prompt if not authenticated
    if (!userId) {
        return (
            <Card className="max-w-2xl mx-auto border-amber-200/50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Login Required</CardTitle>
                            <CardDescription className="text-base mt-1">
                                Please log in to register as a Landsale Agent.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            You need to be logged in to submit an agent application.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild>
                                <Link href="/login?redirect=/agents">Log In</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/signup?redirect=/agents">Sign Up</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Show success state
    if (isSuccess) {
        return (
            <Card className="max-w-2xl mx-auto border-emerald-200/50 shadow-xl">
                <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                    <p className="text-muted-foreground mb-6">
                        We'll review your profile and activate it within 24 hours.
                        You'll receive an SMS notification once approved.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl mx-auto border-emerald-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                        <Briefcase className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Become a Landsale Agent</CardTitle>
                        <CardDescription className="text-base mt-1">
                            Get exclusive leads sent directly to you. Free to join.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" /> Full Name
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="Your professional name"
                                {...register("fullName", { required: "Name is required" })}
                            />
                            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" /> Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                            </Label>
                            <Input
                                id="phone"
                                placeholder="07X XXX XXXX"
                                {...register("phone", { required: "Phone is required" })}
                            />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number (for leads)</Label>
                            <Input
                                id="whatsapp"
                                placeholder="Same as phone or different"
                                {...register("whatsapp")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">About You (Short Bio)</Label>
                        <Textarea
                            id="bio"
                            placeholder="E.g., 10+ years experience in Gampaha land sales..."
                            rows={3}
                            {...register("bio")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                            id="experience"
                            type="number"
                            placeholder="5"
                            {...register("experience")}
                        />
                    </div>

                    {/* Service Areas */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            Service Areas (Select up to 5)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {DISTRICTS.map(district => (
                                <Badge
                                    key={district}
                                    variant={selectedAreas.includes(district) ? "default" : "outline"}
                                    className={`cursor-pointer transition-all ${selectedAreas.includes(district)
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                        }`}
                                    onClick={() => toggleArea(district)}
                                >
                                    {selectedAreas.includes(district) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {district}
                                </Badge>
                            ))}
                        </div>
                        {selectedAreas.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {selectedAreas.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Specializations */}
                    <div className="space-y-3">
                        <Label>Specializations (Optional)</Label>
                        <div className="flex flex-wrap gap-2">
                            {SPECIALIZATIONS.map(spec => (
                                <Badge
                                    key={spec}
                                    variant={selectedSpecs.includes(spec) ? "default" : "outline"}
                                    className={`cursor-pointer transition-all ${selectedSpecs.includes(spec)
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "hover:bg-blue-50 dark:hover:bg-blue-950"
                                        }`}
                                    onClick={() => toggleSpec(spec)}
                                >
                                    {spec}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        By submitting, you agree to receive lead notifications via SMS/WhatsApp.
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
