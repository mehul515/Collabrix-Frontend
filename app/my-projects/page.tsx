"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserProjects } from "@/lib/api"
import { format } from "date-fns"
import Link from "next/link"
import {
  Calendar,
  FolderOpen,
  Plus,
  Star,
  TrendingUp,
  Zap,
  Search,
  Grid3X3,
  List,
  AlertTriangle,
  Circle,
  Minus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import ProtectedRoute from "@/components/ProtectedRoute"

type ProjectMember = {
  id: string
  role: string
  joinedAt: string
  project: {
    id: string
    name: string
    description: string
    priority: string
    status: string
    tags: string[]
  }
}

const roleColor = (role: string) => (role === "owner" ? "default" : "secondary")

const priorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "outline"
    case "MEDIUM":
      return "secondary"
    case "HIGH":
      return "destructive"
    default:
      return "outline"
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case "NOT_STARTED":
      return "outline"
    case "IN_PROGRESS":
      return "secondary"
    case "COMPLETED":
      return "default"
    default:
      return "outline"
  }
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return <AlertTriangle className="w-4 h-4" />
    case "MEDIUM":
      return <Circle className="w-4 h-4" />
    case "LOW":
      return <Minus className="w-4 h-4" />
    default:
      return <Minus className="w-4 h-4" />
  }
}

export default function ModernMyProjectsPage() {
  const router = useRouter()
  const [memberships, setMemberships] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getUserProjects()
        setMemberships(data)
      } catch (error) {
        console.error("Failed to fetch user memberships", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = memberships.filter((member) => {
    const matchesSearch =
      member.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || member.project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      title: "Total Projects",
      value: memberships.length.toString(),
      icon: FolderOpen,
      color: "text-blue-400",
    },
    {
      title: "Owned Projects",
      value: memberships.filter((m) => m.role === "owner").length.toString(),
      icon: Star,
      color: "text-yellow-400",
    },
    {
      title: "In Progress",
      value: memberships.filter((m) => m.project.status === "IN_PROGRESS").length.toString(),
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "High Priority",
      value: memberships.filter((m) => m.project.priority === "HIGH").length.toString(),
      icon: Zap,
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

        <div className="container mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">My Projects</h1>
              <p className="text-muted-foreground text-lg">View and manage the projects you're part of.</p>
            </div>
            <Button className="gradient-button hover-lift" asChild>
              <Link href="/create-project">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            {stats.map((stat, index) => (
              <Card key={index} className="stats-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary/30 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-scale-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/30 border-border/50 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "IN_PROGRESS" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("IN_PROGRESS")}
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("COMPLETED")}
              >
                Completed
              </Button>
              <div className="border-l border-border mx-2" />
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Projects Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{searchTerm ? "No projects found" : "No projects yet"}</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "You are not part of any projects yet. Create your first project to get started."}
              </p>
              {!searchTerm && (
                <Button className="gradient-button" asChild>
                  <Link href="/create-project">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div
              className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
                } animate-slide-up`}
            >
              {filteredProjects.map((member, index) => (
                <Card
                  key={member.id}
                  className={`project-card-hover glass-effect border-border/50 ${viewMode === "list" ? "flex flex-row" : "flex flex-col"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className={`${viewMode === "list" ? "flex-1" : ""} space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          {
                            getPriorityIcon(member.project.priority)
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-semibold truncate">{member.project.name}</CardTitle>
                            {member.role === "owner" && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={member.role === "owner" ? "default" : "secondary"} className="mt-1">
                              {member.role === "owner" ? "Owner" : member.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusColor(member.project.status)} className="ml-2">
                          {member.project.status.replace("_", " ")}
                        </Badge>
                        <Badge variant={priorityColor(member.project.priority)} className="text-xs">
                          {getPriorityIcon(member.project.priority)}
                          <span className="ml-1">{member.project.priority}</span>
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {member.project.description || "No description provided."}
                    </p>

                    {/* Tags Section */}
                    {member.project.tags && member.project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {member.project.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-secondary/30">
                            {tag}
                          </Badge>
                        ))}
                        {member.project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-secondary/30">
                            +{member.project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className={`${viewMode === "list" ? "flex items-center" : ""} space-y-4`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(member.joinedAt), "MMM dd")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button asChild className="w-full gradient-button hover-lift" size="sm">
                      <Link href={`/project/${member.project.id}`}>
                        {member.role === "owner" ? (
                          "Manage Project"
                        ) : (
                          "View Project"
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
