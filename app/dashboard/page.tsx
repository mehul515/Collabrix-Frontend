"use client"

import { useState, useEffect } from "react"
import {
  getUserProfile,
  getOwnerProjects,
  getUserProjects,
  getMyTasks,
  getUserPendingInvites,
  getProjectTasks,
  getProjectMembers,
} from "@/lib/api"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ChevronRight, Folder, ListChecks, CalendarDays, Clock, CircleCheck, Circle, Eye, GitPullRequest, Target, Zap, Activity, Plus } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import ProtectedRoute from "@/components/ProtectedRoute"

interface Project {
  id: string
  name: string
  description: string
  dueDate?: string
  priority: "Low" | "Medium" | "High"
  updatedAt: string
  role?: string
}

interface Task {
  id: string
  title: string
  status: "To Do" | "In Progress" | "In Review" | "Done"
  dueDate?: string
  priority: "Low" | "Medium" | "High"
  projectId: string
  projectName?: string
  updatedAt: string
}

const COLORS = {
  Done: "#22c55e",
  "In Review": "#8b5cf6",
  "In Progress": "#3b82f6",
  "To Do": "#f59e0b",
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#6b7280",
}

export default function ModernDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [projectDetails, setProjectDetails] = useState<Record<string, { taskCount: number; memberCount: number }>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Fetch user profile
        const userProfile = await getUserProfile()
        setUser(userProfile)

        // 2. Fetch projects (both owned and participated)
        const [ownedProjects, userMemberships] = await Promise.all([getOwnerProjects(), getUserProjects()])

        // Process owned projects
        const processedOwnedProjects = ownedProjects.map((project) => ({
          ...project,
          role: "owner",
          source: "owned",
        }))

        // Process member projects - getUserProjects returns memberships with project data
        const processedMemberProjects = userMemberships
          .filter((membership) => membership.project && membership.project.id && membership.project.name)
          .map((membership) => ({
            ...membership.project,
            role: membership.role,
            source: "member",
            joinedAt: membership.joinedAt,
          }))

        // Combine and deduplicate projects (in case user is both owner and member)
        const projectMap = new Map()

        // Add owned projects first (they take precedence)
        processedOwnedProjects.forEach((project) => {
          projectMap.set(project.id, project)
        })

        // Add member projects (only if not already added as owner)
        processedMemberProjects.forEach((project) => {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project)
          }
        })

        const allProjects = Array.from(projectMap.values())
        setProjects(allProjects)

        // 3. Fetch tasks from all projects (both owned and member projects)
        const allTasks = []

        // Get tasks from owned projects
        try {
          const ownedProjectTasks = await Promise.all(
            processedOwnedProjects.map(async (project) => {
              try {
                const projectTasks = await getProjectTasks(project.id)
                return Array.isArray(projectTasks) ? projectTasks : []
              } catch (error) {
                console.error(`Failed to fetch tasks for owned project ${project.id}:`, error)
                return []
              }
            }),
          )
          allTasks.push(...ownedProjectTasks.flat())
        } catch (error) {
          console.error("Failed to fetch owned project tasks:", error)
        }

        // Get tasks from member projects
        try {
          const memberProjectTasks = await Promise.all(
            processedMemberProjects.map(async (project) => {
              try {
                const projectTasks = await getProjectTasks(project.id)
                return Array.isArray(projectTasks) ? projectTasks : []
              } catch (error) {
                console.error(`Failed to fetch tasks for member project ${project.id}:`, error)
                return []
              }
            }),
          )
          allTasks.push(...memberProjectTasks.flat())
        } catch (error) {
          console.error("Failed to fetch member project tasks:", error)
        }

        // Also get user's directly assigned tasks (fallback)
        try {
          const myDirectTasks = await getMyTasks()
          allTasks.push(...myDirectTasks)
        } catch (error) {
          console.error("Failed to fetch direct tasks:", error)
        }

        // Remove duplicates based on task ID
        const uniqueTasks = allTasks.filter((task, index, self) => index === self.findIndex((t) => t.id === task.id))

        // 4. Enhance tasks with project information
        const enhancedTasks = await Promise.all(
          uniqueTasks.map(async (task: Task) => {
            try {
              // Find project name from our already fetched projects
              const project = allProjects.find((p) => p.id === task.projectId.toString())
              return {
                ...task,
                projectName: project?.name || "Unknown Project",
                projectRole: project?.role || "unknown",
              }
            } catch (error) {
              return {
                ...task,
                projectName: "Unknown Project",
                projectRole: "unknown",
              }
            }
          }),
        )

        setTasks(enhancedTasks)

        // 5. Fetch project stats (members and tasks count)
        const details: Record<string, { taskCount: number; memberCount: number }> = {}
        await Promise.all(
          allProjects.map(async (project) => {
            try {
              const [tasksResponse, membersResponse] = await Promise.all([
                getProjectTasks(project.id),
                getProjectMembers(project.id),
              ])

              details[project.id] = {
                taskCount: Array.isArray(tasksResponse) ? tasksResponse.length : 0,
                memberCount: Array.isArray(membersResponse) ? membersResponse.length : 0,
              }
            } catch (error) {
              console.error(`Failed to fetch details for project ${project.id}:`, error)
              details[project.id] = {
                taskCount: 0,
                memberCount: 0,
              }
            }
          }),
        )
        setProjectDetails(details)

        // 6. Fetch pending invites
        const pendingInvites = await getUserPendingInvites()
        setInvites(pendingInvites)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const totalProjects = projects.length
  const projectsWithDeadlines = projects.filter((p) => p.dueDate).length
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === "Done").length
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const inReviewTasks = tasks.filter((t) => t.status === "In Review").length
  const pendingInvitesCount = invites.length

  // Prepare chart data
  const taskStatusData = [
    { name: "Done", value: doneTasks },
    { name: "In Review", value: inReviewTasks },
    { name: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length },
    { name: "To Do", value: tasks.filter((t) => t.status === "To Do").length },
  ]

  const taskPriorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "High").length },
    { name: "Medium", value: tasks.filter((t) => t.priority === "Medium").length },
    { name: "Low", value: tasks.filter((t) => t.priority === "Low").length },
  ]

  // Get upcoming deadlines
  const upcomingDeadlines = [
    ...tasks
      .filter((t) => t.dueDate && t.status !== "Done")
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        type: "task" as const,
        priority: t.priority,
        status: t.status,
        projectName: t.projectName,
      })),
  ]
    .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
    .slice(0, 5)

  // Get 3 most recent projects with role information
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-effect">
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[50px] mb-1" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">

        <div className="container">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back, {user?.fullName || "User"}! 👋</h1>
            <p className="text-muted-foreground text-lg">
              {totalTasks > 0
                ? `You have ${totalTasks} tasks across ${totalProjects} projects.`
                : totalProjects > 0
                  ? `You have ${totalProjects} active projects.`
                  : "No active projects or tasks."}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <Card className="stats-card hover-lift cursor-pointer" onClick={() => router.push("/my-projects")}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {projects.filter((p) => p.dueDate).length} with deadlines
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Folder className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card hover-lift cursor-pointer" onClick={() => router.push("/my-tasks")}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="text-3xl font-bold">{tasks.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tasks.filter((t) => t.status === "Done").length} completed ({completionPercentage}%)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <ListChecks className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card hover-lift cursor-pointer" onClick={() => router.push("/my-tasks")}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Review</p>
                    <p className="text-3xl font-bold">{inReviewTasks}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inReviewTasks > 0 ? "Needs your attention" : "All reviewed"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card hover-lift cursor-pointer" onClick={() => router.push("/invites")}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                    <p className="text-3xl font-bold">{invites.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invites.length > 0 ? "Review your invites" : "No pending invites"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <Users className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-scale-in">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Task Status Overview
                </CardTitle>
                <CardDescription>Breakdown of all your tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} tasks`, "Count"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Task Priority Distribution
                </CardTitle>
                <CardDescription>Urgency level breakdown of your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taskPriorityData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" name="Tasks" radius={[0, 4, 4, 0]}>
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects Section */}
          <Card className="glass-effect border-border/50 mb-8 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Your most recently updated projects</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary hover-lift" onClick={() => router.push("/my-projects")}>
                View All Projects <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project, index) => (
                    <Card
                      key={project.id}
                      className="project-card-hover border-border/50 cursor-pointer animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                <Folder className="w-5 h-5 text-primary" />
                              </div>
                              {project.role === "owner" && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">★</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate text-sm">{project.name}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge
                                  variant={project.role === "owner" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {project.role}
                                </Badge>
                                <Badge
                                  variant={
                                    project.priority === "High"
                                      ? "destructive"
                                      : project.priority === "Medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {project.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {project.description || "No description"}
                        </p>

                        <div className="flex justify-between text-xs mb-3">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>{projectDetails[project.id]?.taskCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{projectDetails[project.id]?.memberCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {project.dueDate
                                ? Math.max(
                                  0,
                                  Math.ceil(
                                    (new Date(project.dueDate).getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24),
                                  ),
                                )
                                : "∞"}d
                            </span>
                          </div>
                        </div>

                        {/* Compact Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">
                              {projectDetails[project.id]?.taskCount > 0
                                ? Math.round(
                                  (tasks.filter((t) => t.projectId === project.id && t.status === "Done").length /
                                    projectDetails[project.id].taskCount) *
                                  100,
                                )
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-secondary/30 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-primary to-purple-500 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${projectDetails[project.id]?.taskCount > 0
                                    ? Math.round(
                                      (tasks.filter((t) => t.projectId === project.id && t.status === "Done")
                                        .length /
                                        projectDetails[project.id].taskCount) *
                                      100,
                                    )
                                    : 0
                                  }%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first project to get started</p>
                  <Button className="gradient-button hover-lift" onClick={() => router.push("/create-project")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="glass-effect border-border/50 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Your tasks due soon that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {upcomingDeadlines.map((item, index) => (
                    <div
                      key={item.id}
                      className="task-card rounded-lg p-4 cursor-pointer animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => router.push(item.type === "task" ? `/task/${item.id}` : `/project/${item.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {item.status === "Done" ? (
                              <CircleCheck className="h-5 w-5 text-green-500" />
                            ) : item.status === "In Review" ? (
                              <Eye className="h-5 w-5 text-purple-500" />
                            ) : item.status === "In Progress" ? (
                              <GitPullRequest className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{item.title}</h4>
                            {item.projectName && (
                              <p className="text-xs text-muted-foreground truncate">{item.projectName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(item.dueDate!), { addSuffix: true })}
                          </Badge>
                          <Badge
                            variant={
                              item.priority === "High"
                                ? "destructive"
                                : item.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CircleCheck className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No upcoming deadlines to worry about</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
