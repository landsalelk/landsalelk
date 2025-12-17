// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getTeamAnalytics, getTeamLeaderboard } from "@/lib/actions/teams"
import { TrendingUp, Users, Target, Award, Calendar, BarChart3 } from "lucide-react"

interface TeamAnalyticsDashboardProps {
  teamId: string
}

export async function TeamAnalyticsDashboard({ teamId }: TeamAnalyticsDashboardProps) {
  const [analytics, leaderboard] = await Promise.all([
    getTeamAnalytics(teamId),
    getTeamLeaderboard(teamId, 'month')
  ])

  if (!analytics.success || !analytics.analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Analytics</CardTitle>
          <CardDescription>Failed to load team analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load team performance data.</p>
        </CardContent>
      </Card>
    )
  }

  const { overview, member_performance, monthly_trends, top_performers } = analytics.analytics

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_leads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.active_leads} active, {overview.closed_leads} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview.conversion_rate.toFixed(1)}%
            </div>
            <Progress value={overview.conversion_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Listings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_listings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.avg_listing_to_lead_ratio.toFixed(2)} leads per listing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{member_performance.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {top_performers.length} top performers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
          <CardDescription>Team members with highest conversion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {top_performers.map((performer, index) => (
              <div key={performer.member_id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{performer.conversion_rate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">
                    {performer.closed_leads}/{performer.total_leads} closed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Performance</CardTitle>
          <CardDescription>Detailed performance metrics for all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Member</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-center p-2">Total Leads</th>
                  <th className="text-center p-2">Closed</th>
                  <th className="text-center p-2">Conversion Rate</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {member_performance.map((member) => (
                  <tr key={member.member_id} className="border-b">
                    <td className="p-2 font-medium">{member.name}</td>
                    <td className="p-2">
                      <Badge variant="outline">{member.role}</Badge>
                    </td>
                    <td className="p-2 text-center">{member.total_leads}</td>
                    <td className="p-2 text-center">{member.closed_leads}</td>
                    <td className="p-2 text-center">
                      <span className={`font-medium ${member.conversion_rate >= 30 ? 'text-green-600' :
                          member.conversion_rate >= 20 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {member.conversion_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={
                        member.conversion_rate >= 30 ? 'default' :
                          member.conversion_rate >= 20 ? 'secondary' :
                            'destructive'
                      }>
                        {member.conversion_rate >= 30 ? 'Excellent' :
                          member.conversion_rate >= 20 ? 'Good' :
                            'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Lead generation and conversion trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthly_trends.slice(-6).map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <p className="font-medium">{new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">{trend.leads} leads generated</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{trend.conversion_rate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{trend.closed} closed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {leaderboard.success && leaderboard.leaderboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Monthly Leaderboard
            </CardTitle>
            <CardDescription>Team ranking based on performance scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.leaderboard.map((entry) => (
                <div key={entry.member_id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                          entry.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.score} pts</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.stats.conversion_rate.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}