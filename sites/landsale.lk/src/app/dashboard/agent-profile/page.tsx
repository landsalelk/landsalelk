"use client"

import { useEffect, useState, useRef } from "react"
import { getMyAgentProfile, updateAgentProfile, addVerificationDocument } from "@/lib/actions/agents"
import { getStorage, BUCKETS } from "@/lib/appwrite/client"
import { ID } from "appwrite"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    User, Shield, Upload, FileText, MapPin, Phone,
    MessageCircle, CheckCircle2, Clock, AlertTriangle,
    Briefcase, Star, TrendingUp, Palmtree
} from "lucide-react"

// Districts list
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

interface AgentProfile {
    id: string
    userId: string
    name: string
    email: string
    phone: string
    whatsapp: string
    bio: string
    avatarUrl?: string
    experienceYears: number
    serviceAreas: string[]
    specializations: string[]
    isVerified: boolean
    status: string
    rating: number
    reviewCount: number
    dealsCount: number
    verificationDocuments: any[]
    vacationMode: boolean
    createdAt: string
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        pending: { label: 'Pending Review', color: 'bg-yellow-500', icon: <Clock className="w-3 h-3" /> },
        pending_review: { label: 'Documents Under Review', color: 'bg-orange-500', icon: <Clock className="w-3 h-3" /> },
        active: { label: 'Active', color: 'bg-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        suspended: { label: 'Suspended', color: 'bg-red-500', icon: <AlertTriangle className="w-3 h-3" /> },
    }

    const { label, color, icon } = config[status] || config.pending

    return (
        <Badge className={`${color} text-white flex items-center gap-1`}>
            {icon}
            {label}
        </Badge>
    )
}

export default function AgentProfilePage() {
    const [profile, setProfile] = useState<AgentProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        bio: '',
        experienceYears: 0,
        vacationMode: false
    })
    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            // Get user ID from session (in a real app, get from auth context)
            const response = await fetch('/api/auth/session')
            const session = await response.json()

            if (!session?.userId) {
                toast.error("Please log in to view your agent profile")
                setLoading(false)
                return
            }

            const result = await getMyAgentProfile(session.userId)

            if (result.success && result.profile) {
                setProfile(result.profile)
                setFormData({
                    name: result.profile.name,
                    phone: result.profile.phone,
                    whatsapp: result.profile.whatsapp,
                    bio: result.profile.bio,
                    experienceYears: result.profile.experienceYears,
                    vacationMode: result.profile.vacationMode
                })
                setSelectedAreas(result.profile.serviceAreas)
                setSelectedSpecs(result.profile.specializations)
            }
        } catch (error) {
            console.error("Failed to load profile:", error)
            toast.error("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        if (!profile) return

        setSaving(true)
        try {
            const result = await updateAgentProfile(profile.id, {
                ...formData,
                serviceAreas: selectedAreas,
                specializations: selectedSpecs
            })

            if (result.success) {
                toast.success("Profile updated successfully!")
                loadProfile()
            } else {
                toast.error(result.error || "Failed to update profile")
            }
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'nic' | 'business_reg' | 'license') => {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return
        }

        setUploading(true)
        try {
            const storage = getStorage()
            const uploadedFile = await storage.createFile(
                BUCKETS.AGENT_DOCUMENTS || 'agent_documents',
                ID.unique(),
                file
            )

            const result = await addVerificationDocument(profile.id, {
                fileId: uploadedFile.$id,
                documentType: docType,
                fileName: file.name
            })

            if (result.success) {
                toast.success("Document uploaded successfully!")
                loadProfile()
            } else {
                toast.error(result.error || "Failed to save document reference")
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Failed to upload document")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="py-12 text-center">
                    <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Agent Profile Found</h3>
                    <p className="text-muted-foreground mb-6">
                        You haven't registered as an agent yet.
                    </p>
                    <Button asChild>
                        <a href="/agents#register">Become an Agent</a>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Agent Profile</h1>
                    <p className="text-muted-foreground">Manage your agent profile and verification</p>
                </div>
                <StatusBadge status={profile.status} />
            </div>

            {/* Pending Verification Banner */}
            {profile.status === 'pending' && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="py-4 flex items-center gap-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                            <h4 className="font-semibold">Verification Pending</h4>
                            <p className="text-sm text-muted-foreground">
                                Upload your verification documents below to get verified. Verified agents receive more leads!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold">{profile.rating.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">{profile.reviewCount} reviews</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                        <div className="text-2xl font-bold">{profile.dealsCount}</div>
                        <div className="text-sm text-muted-foreground">Deals Closed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Briefcase className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{profile.experienceYears}</div>
                        <div className="text-sm text-muted-foreground">Years Exp.</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <MapPin className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">{profile.serviceAreas.length}</div>
                        <div className="text-sm text-muted-foreground">Service Areas</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="verification">Verification</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update your public profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                    <Input
                                        id="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Tell buyers about your experience and expertise..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Areas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Areas</CardTitle>
                            <CardDescription>Select up to 5 districts you cover</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {DISTRICTS.map(district => (
                                    <Badge
                                        key={district}
                                        variant={selectedAreas.includes(district) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleArea(district)}
                                    >
                                        {district}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specializations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Specializations</CardTitle>
                            <CardDescription>Select your areas of expertise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {SPECIALIZATIONS.map(spec => (
                                    <Badge
                                        key={spec}
                                        variant={selectedSpecs.includes(spec) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleSpec(spec)}
                                    >
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </TabsContent>

                {/* Verification Tab */}
                <TabsContent value="verification" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Verification Documents
                            </CardTitle>
                            <CardDescription>
                                Upload documents to verify your identity and become a trusted agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* NIC Upload */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <h4 className="font-medium">National ID Card (NIC)</h4>
                                            <p className="text-sm text-muted-foreground">Front and back copy</p>
                                        </div>
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*,.pdf"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'nic')}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading ? "Uploading..." : "Upload"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Business License Upload */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-green-500" />
                                        <div>
                                            <h4 className="font-medium">Business Registration</h4>
                                            <p className="text-sm text-muted-foreground">Optional - if you have a registered business</p>
                                        </div>
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className="hidden"
                                            id="business-upload"
                                            onChange={(e) => handleFileUpload(e, 'business_reg')}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('business-upload')?.click()}
                                            disabled={uploading}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents List */}
                            {profile.verificationDocuments.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-medium mb-3">Uploaded Documents</h4>
                                    <div className="space-y-2">
                                        {profile.verificationDocuments.map((doc: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span>{doc.file_name}</span>
                                                <Badge variant="outline" className="ml-auto">{doc.document_type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability Settings</CardTitle>
                            <CardDescription>Control your visibility and lead preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Vacation Mode */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Palmtree className="w-6 h-6 text-orange-500" />
                                    <div>
                                        <h4 className="font-medium">Vacation Mode</h4>
                                        <p className="text-sm text-muted-foreground">
                                            When enabled, you won't appear in agent searches and won't receive new leads
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.vacationMode}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vacationMode: checked }))}
                                />
                            </div>

                            <Button onClick={handleSaveProfile} disabled={saving}>
                                {saving ? "Saving..." : "Save Settings"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
