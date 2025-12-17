"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyFormSchema, PropertyFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, MapPin, Home, List, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getRegions } from "@/lib/actions/location"

const steps = [
    { id: 1, name: "Type & Location", icon: MapPin },
    { id: 2, name: "Details", icon: Home },
    { id: 3, name: "Features", icon: List },
    { id: 4, name: "Media & Contact", icon: ImageIcon },
]

interface PostAdFormProps {
    teamId?: string
}

export function PostAdForm({ teamId }: PostAdFormProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [regions, setRegions] = useState<{ id: string, name: string, slug: string }[]>([])
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
    const router = useRouter()

    // Fetch regions on mount
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const data = await getRegions()
                setRegions(data)
            } catch (error) {
                toast.error("Failed to load locations. Please refresh.")
            }
        }
        fetchRegions()
    }, [])

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema) as any,
        defaultValues: {
            type: "land",
            priceNegotiable: false,
            features: [],
            images: [],
            // New Due Diligence Defaults
            deedType: "other",
            accessRoadWidth: 0,
            hasSurveyPlan: false,
            hasCleanDeeds: false,
            hazards: [],
            boundariesMarked: false,
            sellerType: "owner",
        },
        mode: "onChange",
    })

    const propertyType = form.watch("type")

    const validateStep = async (step: number) => {
        let fieldsToValidate: (keyof PropertyFormValues)[] = []

        switch (step) {
            case 1:
                fieldsToValidate = ["type", "district", "city", "address"]
                break
            case 2:
                fieldsToValidate = ["title", "price", "size"]
                break
            case 3:
                fieldsToValidate = ["description", "deedType", "accessRoadWidth", "sellerType"]
                if (propertyType !== "land") {
                    fieldsToValidate.push("bedrooms", "bathrooms")
                }
                break
            case 4:
                fieldsToValidate = ["contactName", "contactPhone"]
                break
        }

        const result = await form.trigger(fieldsToValidate)
        if (!result) {
            toast.error("Please fix the errors before proceeding")
        }
        return result
    }

    const handleNext = async () => {
        const isValid = await validateStep(currentStep)
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length))
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const onSubmit = async (data: PropertyFormValues) => {
        setIsSubmitting(true)
        const toastId = toast.loading("Creating your listing...")

        try {
            const { createProperty } = await import("@/lib/actions/property")
            const result = await createProperty(data, teamId)

            if (result?.error) {
                // Show user-friendly error message
                toast.error("Unable to post your listing", {
                    description: result.error,
                    duration: 5000,
                    action: {
                        label: "Help",
                        onClick: () => window.open("/support", "_blank")
                    }
                })
            } else {
                // Success will be handled by redirect
                toast.success("Listing posted successfully!", {
                    description: "Your property is now pending review and will appear in search results soon.",
                    duration: 3000
                })
            }
        } catch (error) {
            console.error("Unexpected error posting listing:", error)
            toast.error("Something went wrong", {
                description: "We couldn't post your listing due to a technical issue. Please try again or contact support.",
                duration: 5000,
                action: {
                    label: "Contact Support",
                    onClick: () => window.open("mailto:support@landsale.lk", "_blank")
                }
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper */}
            <nav aria-label="Progress" className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-300 -z-10"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const Icon = step.icon
                        const isActive = step.id === currentStep
                        const isCompleted = step.id < currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-950 px-2 z-10">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        isActive ? "border-emerald-600 bg-emerald-600 text-white" :
                                            isCompleted ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "border-slate-300 dark:border-slate-700 text-slate-400"
                                    )}
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn("text-xs font-medium", isActive ? "text-emerald-600" : "text-slate-500")}>
                                    {step.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </nav>

            <Card className="border-emerald-100 dark:border-emerald-900/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">{steps[currentStep - 1].name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Step 1: Type & Location */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Property Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col md:flex-row gap-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="land" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">Land</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="house" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">House</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="commercial" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">Commercial</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="district"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Province</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const region = regions.find(r => r.name === value)
                                                            if (region) {
                                                                setSelectedRegionId(region.id)
                                                                form.setValue("city", "")
                                                            }
                                                            field.onChange(value)
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Province" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {regions.map((region) => (
                                                                <SelectItem key={region.id} value={region.name}>
                                                                    {region.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <CityAutocomplete
                                                            regionId={selectedRegionId}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                            disabled={!selectedRegionId}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Street address" {...field} />
                                                </FormControl>
                                                <FormDescription>Address can be hidden from public view if desired.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ad Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 10 Perch Land for Sale in Malabe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price (LKR)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rs</span>
                                                            <Input type="number" placeholder="Total Price" className="pl-9" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="size"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Size</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 10.5 Perches" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="priceNegotiable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Suggest Price is Negotiable</FormLabel>
                                                    <FormDescription>
                                                        Buyers are more likely to contact negotiable prices.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 3: Features & Due Diligence */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-100 dark:border-emerald-900/50">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>
                                            Providing accurate due diligence information helps build trust with buyers and can speed up the sale process.
                                        </AlertDescription>
                                    </Alert>

                                    {/* Property Specifics */}
                                    {propertyType !== "land" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="bedrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bedrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bathrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bathrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your property in detail. Highlight key selling points like location advantages, utilities, and nearby amenities."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Legal & Ownership Section */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-1 rounded">
                                                <List className="w-4 h-4" />
                                            </span>
                                            Legal & Ownership
                                        </h3>

                                        <FormField
                                            control={form.control}
                                            name="deedType"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>Deed Type</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl><RadioGroupItem value="sinnakkara" /></FormControl>
                                                                <FormLabel className="font-normal text-sm">Sinnakkara (Freehold)</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl><RadioGroupItem value="jayabhoomi" /></FormControl>
                                                                <FormLabel className="font-normal text-sm">Jayabhoomi</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl><RadioGroupItem value="swarnabhoomi" /></FormControl>
                                                                <FormLabel className="font-normal text-sm">Swarnabhoomi</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl><RadioGroupItem value="permit" /></FormControl>
                                                                <FormLabel className="font-normal text-sm">Permit / LDO</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl><RadioGroupItem value="other" /></FormControl>
                                                                <FormLabel className="font-normal text-sm">Other / Not Sure</FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="sellerType"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>Selling As</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Seller Type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="owner">Owner</SelectItem>
                                                                    <SelectItem value="agent">Registered Agent</SelectItem>
                                                                    <SelectItem value="land_sale">Land Sale Company</SelectItem>
                                                                    <SelectItem value="poa">Power of Attorney (POA)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        {field.value === 'poa' && (
                                                            <FormDescription className="text-amber-600 font-medium">
                                                                Buyers are advised to verify POA validity with a lawyer.
                                                            </FormDescription>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                            <FormField
                                                control={form.control}
                                                name="hasCleanDeeds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm">Clear 30-Year History</FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="hasSurveyPlan"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm">Survey Plan Available</FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="boundariesMarked"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm">Boundaries Marked</FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Physical Details */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-1 rounded">
                                                <MapPin className="w-4 h-4" />
                                            </span>
                                            Physical Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="accessRoadWidth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Access Road Width (Feet)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Minimum 10ft highly recommended.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-3">
                                                <FormLabel>Potential Hazards</FormLabel>
                                                <div className="space-y-2">
                                                    {[{ label: "Flood Prone Area", value: "flood" }, { label: "Landslide Risk", value: "landslide" }, { label: "Wild Animal Threats", value: "wild" }].map((hazard) => (
                                                        <div key={hazard.value} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={hazard.value}
                                                                checked={(form.watch("hazards") || []).includes(hazard.value)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = form.getValues("hazards") || [];
                                                                    if (checked) {
                                                                        form.setValue("hazards", [...current, hazard.value]);
                                                                    } else {
                                                                        form.setValue("hazards", current.filter((h) => h !== hazard.value));
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={hazard.value} className="text-sm font-medium leading-none cursor-pointer">
                                                                {hazard.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Utilities available</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {["Water", "Electricity", "Three Phase"].map((feature) => (
                                                    <div key={feature} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={feature}
                                                            checked={(form.watch("features") || []).includes(feature)}
                                                            onCheckedChange={(checked) => {
                                                                const current = form.getValues("features") || [];
                                                                if (checked) {
                                                                    form.setValue("features", [...current, feature]);
                                                                } else {
                                                                    form.setValue("features", current.filter((f) => f !== feature));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={feature} className="text-sm font-medium leading-none cursor-pointer">
                                                            {feature}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Media & Contact */}
                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <FormLabel>Property Images</FormLabel>
                                        <FormDescription>Upload up to 10 images. The first image will be the cover photo.</FormDescription>

                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value || []}
                                                            onChange={(newUrls) => field.onChange(newUrls)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contactName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="07X XXX XXXX" type="tel" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="07X XXX XXXX" type="tel" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Buyers can contact you directly via WhatsApp. Leave blank if same as mobile.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50 dark:bg-slate-900/50 p-6 border-t">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                        Back
                    </Button>

                    {currentStep < steps.length ? (
                        <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                                </>
                            ) : "Post Ad"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
