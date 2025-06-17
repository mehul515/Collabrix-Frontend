"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getMyTasks, getUserProfile, getOwnerProjects, getUserProjects, getProjectTasks } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Search,
  Grid3X3,
  List,
  Target,
  Activity,
  Folder,
  ArrowUpDown,
  AlertTriangle,
  Circle,
  Minus,
} from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernMyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("dueDate")
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchAllUserTasks = async () => {
      try {
        setLoading(true)

        // 1. Get user profile
        const userProfile = await getUserProfile()
        setCurrentUser(userProfile)

        // 2. Fetch projects (both owned and participated)
        const [ownedProjects, userMemberships] = await Promise.all([getOwnerProjects(), getUserProjects()])

        // Process owned projects
        const processedOwnedProjects = ownedProjects.map((project) => ({
          ...project,
          role: "owner",
          source: "owned",
        }))

        // Process member projects
        const processedMemberProjects = userMemberships
          .filter((membership) => membership.project && membership.project.id && membership.project.name)
          .map((membership) => ({
            ...membership.project,
            role: membership.role,
            source: "member",
            joinedAt: membership.joinedAt,
          }))

        // Combine and deduplicate projects
        const projectMap = new Map()
        processedOwnedProjects.forEach((project) => {
          projectMap.set(project.id, project)
        })
        processedMemberProjects.forEach((project) => {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project)
          }
        })

        const allProjects = Array.from(projectMap.values())

        // 3. Fetch tasks from all projects
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
          uniqueTasks.map(async (task: any) => {
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
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchAllUserTasks()
  }, [])

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="w-4 h-4" />
      case "Medium":
        return <Circle className="w-4 h-4" />
      case "Low":
        return <Minus className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
      case "Completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "In Review":
        return <Eye className="w-4 h-4 text-purple-500" />
      case "In Progress":
        return <Activity className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const taskStats = [
    {
      title: "Total Tasks",
      value: tasks.length.toString(),
      icon: Target,
      color: "text-blue-400",
    },
    {
      title: "Completed",
      value: tasks.filter((t) => t.status === "Done" || t.status === "Completed").length.toString(),
      icon: CheckCircle2,
      color: "text-green-400",
    },
    {
      title: "In Progress",
      value: tasks.filter((t) => t.status === "In Progress").length.toString(),
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "High Priority",
      value: tasks.filter((t) => t.priority === "High").length.toString(),
      icon: AlertCircle,
      color: "text-red-400",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground text-lg">Loading your tasks...</p>
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
            <h1 className="text-4xl font-bold gradient-text mb-2">My Tasks</h1>
            <p className="text-muted-foreground text-lg">Manage and track all your assigned tasks across all projects</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            {taskStats.map((stat, index) => (
              <Card key={index} className="stats-card hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary/30 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters and Search */}
          <Card className="glass-effect border-border/50 mb-8 animate-scale-in">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tasks, descriptions, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border/50 focus:border-primary"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-secondary/30 border-border/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px] bg-secondary/30 border-border/50">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] bg-secondary/30 border-border/50">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="border-l border-border mx-2" />

                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="hover-lift"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="hover-lift"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Content */}
          {filteredTasks.length === 0 ? (
            <Card className="glass-effect border-border/50 animate-fade-in">
              <CardContent className="py-20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "No tasks match your filters"
                      : "No tasks assigned"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your search terms or filters"
                      : "You don't have any tasks assigned yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div
              className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
                } animate-slide-up`}
            >
              {filteredTasks.map((task, index) => {
                const isAssignedToMe =
                  currentUser && (task.assigneeId === currentUser.id || task.assigneeName === currentUser.fullName)

                return (
                  <Card
                    key={task.id}
                    className={`task-card glass-effect border-border/50 ${viewMode === "list" ? "flex flex-row" : "flex flex-col"}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader className={`${viewMode === "list" ? "flex-1" : ""} space-y-3`}>
                      {isAssignedToMe && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          Assigned to you
                        </Badge>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getStatusIcon(task.status)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold truncate">
                              <Link href={`/task/${task.id}`} className="hover:text-primary transition-colors">
                                {task.title}
                              </Link>
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                              {task.projectRole && (
                                <Badge
                                  variant={task.projectRole === "owner" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {task.projectRole}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getPriorityVariant(task.priority)} className="flex items-center gap-1">
                            {getPriorityIcon(task.priority)}
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description || "No description provided"}
                      </p>

                      {/* Task Meta Info - Enhanced */}
                      <div className="space-y-2 p-3 bg-secondary/10 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Due:</span>
                          <span className="text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>

                        {task.assigneeName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Assignee:</span>
                            <span className={`${isAssignedToMe ? "font-semibold text-blue-600 dark:text-blue-400" : ""}`}>
                              {isAssignedToMe ? "You" : task.assigneeName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Folder className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Project:</span>
                          <Link href={`/project/${task.projectId}`} className="font-medium text-primary hover:underline">
                            {task.projectName}
                          </Link>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className={`${viewMode === "list" ? "flex items-center" : ""} pt-0`}>
                      <Button asChild className="w-full gradient-button hover-lift" size="sm">
                        <Link href={`/task/${task.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
