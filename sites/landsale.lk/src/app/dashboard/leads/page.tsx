"use client"

import { useEffect, useState, useCallback } from "react"
import { getDatabases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/client"
import { Client } from "appwrite"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    Phone, MessageCircle, MapPin, IndianRupee, Clock,
    AlertCircle, CheckCircle2, User, Bell, Filter,
    TrendingUp, Calendar, ChevronRight
} from "lucide-react"

// Lead status types
type LeadStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'negotiation' | 'closed' | 'lost'

interface Lead {
    $id: string
    $createdAt: string
    property_id: string
    property_title: string
    city: string
    district: string
    price: number
    seller_phone: string
    status: LeadStatus
    priority: 'low' | 'medium' | 'high'
    notes: string[]
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: 'New', color: 'bg-blue-500', icon: <Bell className="w-3 h-3" /> },
    contacted: { label: 'Contacted', color: 'bg-yellow-500', icon: <Phone className="w-3 h-3" /> },
    viewing_scheduled: { label: 'Viewing Scheduled', color: 'bg-purple-500', icon: <Calendar className="w-3 h-3" /> },
    negotiation: { label: 'Negotiation', color: 'bg-orange-500', icon: <TrendingUp className="w-3 h-3" /> },
    closed: { label: 'Closed Won', color: 'bg-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
    lost: { label: 'Lost', color: 'bg-gray-500', icon: <AlertCircle className="w-3 h-3" /> },
}

function LeadCard({ lead, onStatusChange, onAddNote }: {
    lead: Lead
    onStatusChange: (leadId: string, status: LeadStatus) => void
    onAddNote: (leadId: string, note: string) => void
}) {
    const [showNoteInput, setShowNoteInput] = useState(false)
    const [noteText, setNoteText] = useState("")

    const statusConfig = STATUS_CONFIG[lead.status]
    const isNew = lead.status === 'new'

    const handleAddNote = () => {
        if (noteText.trim()) {
            onAddNote(lead.$id, noteText)
            setNoteText("")
            setShowNoteInput(false)
        }
    }

    return (
        <Card className={`transition-all ${isNew ? 'ring-2 ring-blue-500 shadow-lg animate-pulse-slow' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{lead.property_title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {lead.city}, {lead.district}
                        </CardDescription>
                    </div>
                    <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Price */}
                <div className="flex items-center gap-2 text-lg font-bold text-emerald-600">
                    <IndianRupee className="w-4 h-4" />
                    Rs. {lead.price.toLocaleString()}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`tel:${lead.seller_phone}`, '_self')}
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(`https://wa.me/${lead.seller_phone.replace(/\D/g, '')}`, '_blank')}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                    </Button>
                </div>

                {/* Status Update */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Select
                        value={lead.status}
                        onValueChange={(value) => onStatusChange(lead.$id, value as LeadStatus)}
                    >
                        <SelectTrigger className="flex-1 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                        {config.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Notes Section */}
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Notes</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowNoteInput(!showNoteInput)}
                        >
                            + Add Note
                        </Button>
                    </div>

                    {showNoteInput && (
                        <div className="space-y-2 mb-2">
                            <Textarea
                                placeholder="e.g., Called client, scheduled viewing for Saturday..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAddNote}>Save Note</Button>
                                <Button size="sm" variant="outline" onClick={() => setShowNoteInput(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {lead.notes && lead.notes.length > 0 && (
                        <div className="space-y-1">
                            {lead.notes.slice(-3).map((note, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    {note}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(lead.$createdAt).toLocaleDateString('en-LK', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default function AgentLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
    const [agentProfile, setAgentProfile] = useState<any>(null)

    // Fetch leads for the current agent
    const fetchLeads = useCallback(async () => {
        try {
            const databases = getDatabases()
            // Note: In production, filter by agent_user_id from session
            const result = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENT_LEADS || 'agent_leads'
            )
            setLeads(result.documents as unknown as Lead[])
        } catch (error) {
            console.error("Failed to fetch leads:", error)
            toast.error("Failed to load leads")
        } finally {
            setLoading(false)
        }
    }, [])

    // Subscribe to Realtime updates
    useEffect(() => {
        fetchLeads()

        // Setup Realtime subscription
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

        if (!endpoint || !projectId) return

        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)

        const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.AGENT_LEADS || 'agent_leads'}.documents`

        const unsubscribe = client.subscribe(channel, (response) => {
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                // New lead arrived!
                toast.success("🎉 New Lead Arrived!", {
                    description: "A new property lead has been assigned to you!",
                    duration: 10000,
                })

                // Play sound (optional)
                try {
                    const audio = new Audio('/sounds/notification.mp3')
                    audio.play().catch(() => { })
                } catch (e) { }

                // Refresh leads
                fetchLeads()
            }

            if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                fetchLeads()
            }
        })

        return () => unsubscribe()
    }, [fetchLeads])

    // Update lead status
    const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        try {
            const databases = getDatabases()
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.AGENT_LEADS || 'agent_leads',
                leadId,
                { status: newStatus }
            )

            setLeads(prev => prev.map(lead =>
                lead.$id === leadId ? { ...lead, status: newStatus } : lead
            ))

            toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Failed to update status")
        }
    }

    // Add note to lead
    const handleAddNote = async (leadId: string, note: string) => {
        try {
            const lead = leads.find(l => l.$id === leadId)
            const updatedNotes = [...(lead?.notes || []), `${new Date().toLocaleString()}: ${note}`]

            const databases = getDatabases()
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.AGENT_LEADS || 'agent_leads',
                leadId,
                { notes: updatedNotes }
            )

            setLeads(prev => prev.map(l =>
                l.$id === leadId ? { ...l, notes: updatedNotes } : l
            ))

            toast.success("Note added!")
        } catch (error) {
            console.error("Failed to add note:", error)
            toast.error("Failed to add note")
        }
    }

    // Filter leads
    const filteredLeads = filter === 'all'
        ? leads
        : leads.filter(lead => lead.status === filter)

    // Stats
    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        active: leads.filter(l => !['closed', 'lost'].includes(l.status)).length,
        closed: leads.filter(l => l.status === 'closed').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Leads</h1>
                    <p className="text-muted-foreground">Manage your property leads in real-time</p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Leads</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                        {config.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Leads</div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                        <div className="text-sm text-muted-foreground">New Leads</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
                        <div className="text-sm text-muted-foreground">Closed Won</div>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Grid */}
            {filteredLeads.length === 0 ? (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Leads Yet</h3>
                        <p className="text-muted-foreground">
                            When sellers post properties in your service area, leads will appear here in real-time!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeads.map(lead => (
                        <LeadCard
                            key={lead.$id}
                            lead={lead}
                            onStatusChange={handleStatusChange}
                            onAddNote={handleAddNote}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
