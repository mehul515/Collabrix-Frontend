"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getProject,
  getProjectMembers,
  getProjectTasks,
  getUserProfile,
  getUserById,
  deleteProject,
  sendProjectInvite,
} from "@/lib/api"
import { format } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Users,
  ArrowLeft,
  BadgeDollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  Plus,
  Mail,
  Crown,
  User,
  Zap,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [project, setProject] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, proj, rawMembers, taskList] = await Promise.all([
          getUserProfile(),
          getProject(id as string),
          getProjectMembers(id as string),
          getProjectTasks(id as string),
        ])

        setCurrentUser(profile)
        setProject(proj)
        setTasks(taskList)

        // Enrich members with user info
        const enriched = await Promise.all(
          rawMembers.map(async (member: any) => {
            try {
              const user = await getUserById(member.userId)
              return {
                ...member,
                name: user.fullName,
                email: user.email,
              }
            } catch {
              return {
                ...member,
                name: "Unknown",
                email: "Unavailable",
              }
            }
          }),
        )

        setMembers(enriched)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch project details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const isOwner = members.find((m) => m.userId === currentUser?.id && m.role === "owner")

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return
    try {
      await deleteProject(id as string)
      toast({ title: "Project deleted successfully." })
      router.push("/my-projects")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return

    try {
      setIsInviting(true)
      await sendProjectInvite({
        projectId: project.id,
        invitedEmail: inviteEmail,
        role: "member",
      })
      toast({ title: "Invitation sent!" })
      setInviteEmail("")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send invite",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getDaysLeft = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)

    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diff = due.getTime() - today.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-400" />
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-lg">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/my-projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 animate-fade-in">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild className="hover-lift">
              <Link href="/my-projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{project.name}</h1>
              <p className="text-muted-foreground mt-1">Created {format(new Date(project.startDate), "PPP")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default" className="gradient-button hover-lift">
              <Link href={`/project/${project.id}/board`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Board
              </Link>
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" asChild className="hover-lift">
                  <Link href={`/update-project/${project.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="hover-lift">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <Card className="stats-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-3xl font-bold">{Math.round(taskProgress)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <Progress value={taskProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="stats-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold">{members.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                  <p className="text-3xl font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{completedTasks} completed</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days Left</p>
                  <p className="text-3xl font-bold">{getDaysLeft(project.dueDate)}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Information */}
        <Card className="glass-effect border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-secondary/20 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Start Date
                </div>
                <p className="font-semibold">{format(new Date(project.startDate), "PPP")}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Due Date
                </div>
                <p className="font-semibold">{format(new Date(project.dueDate), "PPP")}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <BadgeDollarSign className="w-4 h-4 mr-2" />
                  Budget
                </div>
                <p className="font-semibold">₹{project.budget || "0"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Zap className="w-4 h-4 mr-2" />
                  Priority
                </div>
                <Badge variant={getPriorityVariant(project.priority)}>{project.priority || "Medium"}</Badge>
              </div>
            </div>

            {project.tags?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-secondary/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="glass-effect border-border/50 animate-scale-in">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Members ({members.length})
            </CardTitle>

            {isOwner && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" className="gradient-button hover-lift">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 space-y-4 glass-effect">
                  <div className="space-y-2">
                    <h4 className="font-medium">Invite Team Member</h4>
                    <p className="text-sm text-muted-foreground">Send an invitation to join this project</p>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleInvite}
                      className="w-full gradient-button"
                      disabled={isInviting || !inviteEmail}
                    >
                      {isInviting ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div key={member.id} className="member-card rounded-lg px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {member.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {member.role === "owner" && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={member.role === "owner" ? "default" : "secondary"} className="ml-2">
                    <User className="w-3 h-3 mr-1" />
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="glass-effect border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Tasks ({tasks.length})
              </div>
              <div className="text-sm text-muted-foreground">
                {completedTasks} of {tasks.length} completed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">Tasks will appear here once they are created.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="task-card rounded-lg px-4 py-4 space-y-3"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">{getStatusIcon(task.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold truncate">{task.title}</h4>
                            <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>
                              Assigned to: <span className="font-medium">{task.assigneeName}</span>
                            </span>
                            <span>
                              Created by: <span className="font-medium">{task.createdByName}</span>
                            </span>
                            <span>
                              Due: <span className="font-medium">{format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
