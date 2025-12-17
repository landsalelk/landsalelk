// @ts-nocheck
import { TeamManagement } from "@/components/features/teams/TeamManagement"
import { TeamAnalyticsDashboard } from "@/components/features/teams/TeamAnalyticsDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMyTeams } from "@/lib/actions/teams"
import { Users, Building2, Shield, TrendingUp } from "lucide-react"

export const metadata = {
    title: "Team Management | Landsale.lk",
    description: "Manage your real estate team, members, and collaborative listings",
}

export default async function TeamPage() {
    const teamsResult = await getMyTeams()
    const hasTeams = teamsResult.success && teamsResult.teams && teamsResult.teams.length > 0
    const team = hasTeams && teamsResult.teams ? teamsResult.teams[0] : null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                <p className="text-muted-foreground">
                    Create and manage your real estate team for collaborative property management
                </p>
            </div>

            {/* Team Status Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Status</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {hasTeams ? 'Active' : 'Not Created'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasTeams ? `${teamsResult.teams!.length} team(s)` : 'Create your team to start collaborating'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Listings</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {hasTeams ? team?.total_listings || 0 : 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Properties shared with your team
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Role</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {hasTeams ? (
                                <Badge variant={team?.role === 'owner' ? 'default' : 'secondary'}>
                                    {team?.role || 'Member'}
                                </Badge>
                            ) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your role in the team
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Management Component */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                        Create your team, invite members, and manage collaborative listings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamManagement />
                </CardContent>
            </Card>

            {/* Team Analytics Dashboard */}
            {hasTeams && team && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Team Analytics
                        </CardTitle>
                        <CardDescription>
                            Performance metrics and insights for your team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TeamAnalyticsDashboard teamId={team.$id} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}