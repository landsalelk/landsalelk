/**
 * Collaborative Listing Creation for Teams
 * Allows team members to create listings with shared ownership and commission splits
 */
// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  DollarSign,
  MapPin,
  Home,
  Plus,
  Minus,
  Settings,
  Share2
} from 'lucide-react'
import { AgentTeam, AgentTeamMembership } from '@/types/teams'
import { createTeamListing } from '@/lib/actions/teams'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CollaborativeListingFormProps {
  teamId: string
  teamMembers: AgentTeamMembership[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function CollaborativeListingForm({
  teamId,
  teamMembers,
  onSuccess,
  onCancel
}: CollaborativeListingFormProps) {
  const [loading, setLoading] = useState(false)

  // Basic listing form
  const [listingForm, setListingForm] = useState({
    title_en: '',
    title_si: '',
    description_en: '',
    description_si: '',
    category_id: '',
    listing_type: 'sale' as 'sale' | 'rent',
    price: '',
    currency_code: 'LKR',
    price_negotiable: false,
    country: 'Sri Lanka',
    region: '',
    city: '',
    area: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    features: [] as string[],
    images: [] as string[]
  })

  // Team collaboration settings
  const [collaborationSettings, setCollaborationSettings] = useState({
    collaboration_type: 'solo' as 'solo' | 'co_listing' | 'team_listing',
    primary_agent_id: '',
    assigned_agents: [] as string[],
    commission_split: {} as { [agent_id: string]: number }
  })

  // Initialize commission splits
  useEffect(() => {
    const initialSplits: { [agent_id: string]: number } = {}
    teamMembers.forEach(member => {
      initialSplits[member.agent_id] = 0
    })
    setCollaborationSettings(prev => ({
      ...prev,
      commission_split: initialSplits
    }))
  }, [teamMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate commission splits total 100%
      const totalCommission = Object.values(collaborationSettings.commission_split).reduce((sum, split) => sum + split, 0)
      if (totalCommission !== 100) {
        toast.error("Invalid commission split", {
          description: "Commission splits must total 100%"
        })
        return
      }

      // Validate primary agent is assigned
      if (!collaborationSettings.primary_agent_id) {
        toast.error("Primary agent required", {
          description: "Please select a primary agent for this listing"
        })
        return
      }

      const result = await createTeamListing(
        {
          user_id: teamId, // Use team as owner
          category_id: listingForm.category_id,
          title: JSON.stringify({ en: listingForm.title_en, si: listingForm.title_si }),
          description: JSON.stringify({ en: listingForm.description_en, si: listingForm.description_si }),
          slug: listingForm.title_en.toLowerCase().replace(/\s+/g, '-'),
          listing_type: listingForm.listing_type,
          status: 'draft',
          price: parseInt(listingForm.price) * 100, // Convert to cents
          currency_code: listingForm.currency_code,
          price_negotiable: listingForm.price_negotiable,
          location: JSON.stringify({
            country: listingForm.country,
            country_name: listingForm.country,
            region: listingForm.region,
            city: listingForm.city,
            area: listingForm.area,
            address: listingForm.address
          }),
          contact: JSON.stringify({
            name: 'Team Contact',
            show_email: true,
            show_phone: true
          }),
          attributes: JSON.stringify({
            bedrooms: listingForm.bedrooms ? parseInt(listingForm.bedrooms) : undefined,
            bathrooms: listingForm.bathrooms ? parseInt(listingForm.bathrooms) : undefined,
            size: listingForm.size
          }),
          features: listingForm.features,
          images: listingForm.images,
          is_premium: false,
          views_count: 0,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          ip_address: '0.0.0.0'
        },
        teamId,
        {
          collaboration_type: collaborationSettings.collaboration_type,
          primary_agent_id: collaborationSettings.primary_agent_id,
          assigned_agents: collaborationSettings.assigned_agents,
          commission_split: collaborationSettings.commission_split
        }
      )

      if (result.success) {
        toast.success("Listing created successfully", {
          description: "Your collaborative listing has been created and is ready for team management."
        })
        onSuccess?.()
      } else {
        toast.error("Error creating listing", {
          description: result.error || "Failed to create collaborative listing."
        })
      }
    } catch (error) {
      toast.error("Error creating listing", {
        description: "An unexpected error occurred."
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCommissionSplit = (agentId: string, value: number) => {
    setCollaborationSettings(prev => ({
      ...prev,
      commission_split: {
        ...prev.commission_split,
        [agentId]: Math.max(0, Math.min(100, value))
      }
    }))
  }

  const toggleAgentAssignment = (agentId: string) => {
    setCollaborationSettings(prev => {
      const isAssigned = prev.assigned_agents.includes(agentId)
      const newAssigned = isAssigned
        ? prev.assigned_agents.filter(id => id !== agentId)
        : [...prev.assigned_agents, agentId]

      return {
        ...prev,
        assigned_agents: newAssigned
      }
    })
  }

  const getTotalCommission = () => {
    return Object.values(collaborationSettings.commission_split).reduce((sum, split) => sum + split, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Collaborative Listing</CardTitle>
        <CardDescription>
          Create a listing with team collaboration features and shared commission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Collaboration Settings */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Collaboration Settings
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="collaboration_type">Collaboration Type</Label>
                <Select
                  value={collaborationSettings.collaboration_type}
                  onValueChange={(value) => setCollaborationSettings(prev => ({ ...prev, collaboration_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Listing</SelectItem>
                    <SelectItem value="co_listing">Co-Listing</SelectItem>
                    <SelectItem value="team_listing">Team Listing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="primary_agent">Primary Agent *</Label>
                <Select
                  value={collaborationSettings.primary_agent_id}
                  onValueChange={(value) => setCollaborationSettings(prev => ({ ...prev, primary_agent_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.agent_id} value={member.agent_id}>
                        {member.agent_id} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Total Commission Split</Label>
                <div className={`text-lg font-semibold ${getTotalCommission() === 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {getTotalCommission()}%
                </div>
                {getTotalCommission() !== 100 && (
                  <p className="text-xs text-red-600">Must total 100%</p>
                )}
              </div>
            </div>

            {/* Agent Assignment & Commission */}
            <div className="space-y-3">
              <Label>Assign Agents & Set Commission</Label>
              {teamMembers.map(member => (
                <div key={member.agent_id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={collaborationSettings.assigned_agents.includes(member.agent_id)}
                      onCheckedChange={() => toggleAgentAssignment(member.agent_id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.agent_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.agent_id}</p>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={collaborationSettings.commission_split[member.agent_id] || 0}
                      onChange={(e) => updateCommissionSplit(member.agent_id, parseInt(e.target.value) || 0)}
                      className="w-20"
                      placeholder="%"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Listing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Listing Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title_en">Title (English) *</Label>
                <Input
                  id="title_en"
                  value={listingForm.title_en}
                  onChange={(e) => setListingForm(prev => ({ ...prev, title_en: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title_si">Title (Sinhala)</Label>
                <Input
                  id="title_si"
                  value={listingForm.title_si}
                  onChange={(e) => setListingForm(prev => ({ ...prev, title_si: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description_en">Description (English) *</Label>
                <Textarea
                  id="description_en"
                  value={listingForm.description_en}
                  onChange={(e) => setListingForm(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description_si">Description (Sinhala)</Label>
                <Textarea
                  id="description_si"
                  value={listingForm.description_si}
                  onChange={(e) => setListingForm(prev => ({ ...prev, description_si: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={listingForm.category_id}
                  onValueChange={(value) => setListingForm(prev => ({ ...prev, category_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="listing_type">Listing Type</Label>
                <Select
                  value={listingForm.listing_type}
                  onValueChange={(value) => setListingForm(prev => ({ ...prev, listing_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={listingForm.price}
                  onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  value={listingForm.region}
                  onChange={(e) => setListingForm(prev => ({ ...prev, region: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={listingForm.city}
                  onChange={(e) => setListingForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={listingForm.address}
                onChange={(e) => setListingForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={listingForm.bedrooms}
                  onChange={(e) => setListingForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={listingForm.bathrooms}
                  onChange={(e) => setListingForm(prev => ({ ...prev, bathrooms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="size">Size (sqft)</Label>
                <Input
                  id="size"
                  value={listingForm.size}
                  onChange={(e) => setListingForm(prev => ({ ...prev, size: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || getTotalCommission() !== 100}>
              {loading ? 'Creating...' : 'Create Collaborative Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}