/**
 * Team Management Dashboard for Real Estate Agents
 * Allows agents to create teams, manage members, and collaborate on listings
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  Plus,
  Settings,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { AgentTeam, AgentTeamMembership, AgentTeamRole } from '@/types/teams'
import { createAgentTeam, getMyTeams, addTeamMember, getTeamMembers, updateTeamMemberRole, removeTeamMember } from '@/lib/actions/teams'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TeamManagementProps {
  userId?: string
  agentId?: string
}

export function TeamManagement({ userId = '', agentId = '' }: TeamManagementProps) {
  const [teams, setTeams] = useState<AgentTeam[]>([])
  const [selectedTeam, setSelectedTeam] = useState<AgentTeam | null>(null)
  const [teamMembers, setTeamMembers] = useState<AgentTeamMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState({
    agency_name: '',
    license_number: '',
    office_address: '',
    office_phone: '',
    office_email: '',
    service_areas: '',
    specializations: '',
    team_type: 'independent' as 'agency' | 'brokerage' | 'franchise' | 'independent',
    max_members: 10
  })

  const [addMemberForm, setAddMemberForm] = useState({
    user_id: '',
    role: 'agent' as AgentTeamRole,
    commission_split: 50,
    monthly_fee: 0
  })

  useEffect(() => {
    loadTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.$id)
    }
  }, [selectedTeam])

  const loadTeams = async () => {
    try {
      const result = await getMyTeams()
      if (result.success && result.teams) {
        setTeams(result.teams)
        if (result.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(result.teams[0])
        }
      }
    } catch (error) {
      toast.error("Error loading teams", {
        description: "Failed to load your teams. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async (teamId: string) => {
    try {
      const result = await getTeamMembers(teamId)
      if (result.success && result.members) {
        setTeamMembers(result.members)
      }
    } catch (error) {
      toast.error("Error loading team members", {
        description: "Failed to load team members."
      })
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createAgentTeam({
        ...createForm,
        service_areas: createForm.service_areas.split(',').map(s => s.trim()),
        specializations: createForm.specializations.split(',').map(s => s.trim()),
        initial_members: [{
          user_id: userId,
          role: 'owner',
          commission_split: 100
        }]
      })

      if (result.success && result.team) {
        toast.success("Team created successfully", {
          description: "Your real estate team has been created."
        })
        setTeams([...teams, result.team])
        setSelectedTeam(result.team)
        setShowCreateForm(false)
        setCreateForm({
          agency_name: '',
          license_number: '',
          office_address: '',
          office_phone: '',
          office_email: '',
          service_areas: '',
          specializations: '',
          team_type: 'independent',
          max_members: 10
        })
      } else {
        toast.error("Error creating team", {
          description: result.error || "Failed to create team."
        })
      }
    } catch (error) {
      toast.error("Error creating team", {
        description: "An unexpected error occurred."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return

    setLoading(true)
    try {
      const result = await addTeamMember(selectedTeam.$id, addMemberForm)
      if (result.success && result.membership) {
        toast.success("Member added successfully", {
          description: "Team member has been added to your team."
        })
        setTeamMembers([...teamMembers, result.membership])
        setShowAddMemberForm(false)
        setAddMemberForm({
          user_id: '',
          role: 'agent',
          commission_split: 50,
          monthly_fee: 0
        })
      } else {
        toast.error("Error adding member", {
          description: result.error || "Failed to add team member."
        })
      }
    } catch (error) {
      toast.error("Error adding member", {
        description: "An unexpected error occurred."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMemberRole = async (membershipId: string, newRole: AgentTeamRole) => {
    if (!selectedTeam) return

    try {
      const result = await updateTeamMemberRole(selectedTeam.$id, membershipId, newRole)
      if (result.success) {
        toast.success("Role updated successfully", {
          description: "Team member role has been updated."
        })
        loadTeamMembers(selectedTeam.$id)
      } else {
        toast.error("Error updating role", {
          description: result.error || "Failed to update member role."
        })
      }
    } catch (error) {
      toast.error("Error updating role", {
        description: "An unexpected error occurred."
      })
    }
  }

  const handleRemoveMember = async (membershipId: string) => {
    if (!selectedTeam) return

    try {
      const result = await removeTeamMember(selectedTeam.$id, membershipId)
      if (result.success) {
        toast.success("Member removed successfully", {
          description: "Team member has been removed from your team."
        })
        loadTeamMembers(selectedTeam.$id)
      } else {
        toast.error("Error removing member", {
          description: result.error || "Failed to remove team member."
        })
      }
    } catch (error) {
      toast.error("Error removing member", {
        description: "An unexpected error occurred."
      })
    }
  }

  const getRoleBadgeColor = (role: AgentTeamRole) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-orange-100 text-orange-800'
      case 'senior': return 'bg-blue-100 text-blue-800'
      case 'agent': return 'bg-green-100 text-green-800'
      case 'junior': return 'bg-yellow-100 text-yellow-800'
      case 'assistant': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading teams...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your real estate team and collaborate with agents</p>
        </div>
        {!showCreateForm && teams.length === 0 && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      {/* No Teams State */}
      {teams.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first real estate team to start collaborating</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Real Estate Team</CardTitle>
            <CardDescription>Set up your agency team for collaborative listings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency_name">Agency Name *</Label>
                  <Input
                    id="agency_name"
                    value={createForm.agency_name}
                    onChange={(e) => setCreateForm({ ...createForm, agency_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={createForm.license_number}
                    onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="office_address">Office Address</Label>
                <Textarea
                  id="office_address"
                  value={createForm.office_address}
                  onChange={(e) => setCreateForm({ ...createForm, office_address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="office_phone">Office Phone</Label>
                  <Input
                    id="office_phone"
                    value={createForm.office_phone}
                    onChange={(e) => setCreateForm({ ...createForm, office_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="office_email">Office Email</Label>
                  <Input
                    id="office_email"
                    type="email"
                    value={createForm.office_email}
                    onChange={(e) => setCreateForm({ ...createForm, office_email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service_areas">Service Areas * (comma-separated)</Label>
                <Input
                  id="service_areas"
                  value={createForm.service_areas}
                  onChange={(e) => setCreateForm({ ...createForm, service_areas: e.target.value })}
                  placeholder="Colombo, Kandy, Galle"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specializations">Specializations * (comma-separated)</Label>
                <Input
                  id="specializations"
                  value={createForm.specializations}
                  onChange={(e) => setCreateForm({ ...createForm, specializations: e.target.value })}
                  placeholder="Residential, Commercial, Luxury"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team_type">Team Type *</Label>
                  <Select
                    value={createForm.team_type}
                    onValueChange={(value) => setCreateForm({ ...createForm, team_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="brokerage">Brokerage</SelectItem>
                      <SelectItem value="franchise">Franchise</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max_members">Max Members *</Label>
                  <Input
                    id="max_members"
                    type="number"
                    min="1"
                    max="100"
                    value={createForm.max_members}
                    onChange={(e) => setCreateForm({ ...createForm, max_members: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Create Team
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Dashboard */}
      {teams.length > 0 && selectedTeam && (
        <div className="space-y-6">
          {/* Team Selector */}
          <div className="flex justify-between items-center">
            <Select value={selectedTeam.$id} onValueChange={(teamId) => {
              const team = teams.find(t => t.$id === teamId)
              if (team) setSelectedTeam(team)
            }}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.$id} value={team.$id}>
                    {team.agency_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </div>

          {/* Team Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  of {selectedTeam.max_members} max members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
                {selectedTeam.is_verified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-600" />
                )}
              </CardHeader>
              <CardContent>
                <Badge variant={selectedTeam.is_verified ? "default" : "secondary"}>
                  {selectedTeam.verification_status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Areas</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedTeam.service_areas.length}</div>
                <p className="text-xs text-muted-foreground">
                  districts covered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Details */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="details">Team Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button onClick={() => setShowAddMemberForm(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>

              {showAddMemberForm && (
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="user_id">User ID *</Label>
                          <Input
                            id="user_id"
                            value={addMemberForm.user_id}
                            onChange={(e) => setAddMemberForm({ ...addMemberForm, user_id: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={addMemberForm.role}
                            onValueChange={(value) => setAddMemberForm({ ...addMemberForm, role: value as AgentTeamRole })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="senior">Senior Agent</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="junior">Junior Agent</SelectItem>
                              <SelectItem value="assistant">Assistant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="commission_split">Commission Split (%)</Label>
                          <Input
                            id="commission_split"
                            type="number"
                            min="0"
                            max="100"
                            value={addMemberForm.commission_split}
                            onChange={(e) => setAddMemberForm({ ...addMemberForm, commission_split: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthly_fee">Monthly Fee</Label>
                          <Input
                            id="monthly_fee"
                            type="number"
                            min="0"
                            value={addMemberForm.monthly_fee}
                            onChange={(e) => setAddMemberForm({ ...addMemberForm, monthly_fee: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddMemberForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading}>
                          Add Member
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {teamMembers.map(member => (
                  <Card key={member.$id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.userId} />
                          <AvatarFallback>
                            {member.userId?.slice(0, 2).toUpperCase() || 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{member.userId}</h4>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.commission_split}% Commission</p>
                          {member.monthly_fee > 0 && (
                            <p className="text-xs text-muted-foreground">${member.monthly_fee}/month</p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => handleUpdateMemberRole(member.$id, newRole as AgentTeamRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="junior">Junior</SelectItem>
                              <SelectItem value="assistant">Assistant</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.$id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Agency Name</Label>
                      <p className="font-medium">{selectedTeam.agency_name}</p>
                    </div>
                    <div>
                      <Label>License Number</Label>
                      <p className="font-medium">{selectedTeam.license_number || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Office Address</Label>
                    <p className="font-medium">{selectedTeam.office_address || 'Not provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Office Phone</Label>
                      <p className="font-medium">{selectedTeam.office_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Office Email</Label>
                      <p className="font-medium">{selectedTeam.office_email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Service Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTeam.service_areas.map(area => (
                        <Badge key={area} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Specializations</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTeam.specializations.map(spec => (
                        <Badge key={spec} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Analytics and performance metrics for your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{selectedTeam.stats.total_listings}</div>
                      <p className="text-sm text-muted-foreground">Total Listings</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedTeam.stats.total_sales}</div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedTeam.stats.average_rating}</div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Messages</CardTitle>
                  <CardDescription>Communication and announcements within your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      Team messaging features coming soon. This will allow team-wide announcements,
                      listing updates, and lead alerts.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}