"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getTaskById,
  getTaskComments,
  getUserProfile,
  createComment,
  updateComment,
  deleteComment,
  deleteTask,
  getProjectMembers,
  updateTask,
  getUserById,
  getProject,
} from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  X,
  Send,
  MessageSquare,
  Folder,
  Calendar,
  AlertTriangle,
  Circle,
  Minus,
  Clock,
  CheckCircle2,
  Eye,
  Activity,
  Star,
  Users,
  Timer,
} from "lucide-react"
import Link from "next/link"
import { TaskForm } from "@/components/task-form"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernTaskDetailPage() {
  const { id: taskId } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [task, setTask] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingTask, setEditingTask] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [taskData, profile, commentList] = await Promise.all([
          getTaskById(taskId as string),
          getUserProfile(),
          getTaskComments(taskId as string),
        ])

        setCurrentUser(profile)
        setComments(commentList)

        const projectData = await getProject(taskData.projectId)
        setProject(projectData)

        const members = await getProjectMembers(taskData.projectId)
        const enrichedMembers = await Promise.all(
          members.map(async (m: any) => {
            try {
              const user = await getUserById(m.userId)
              return { ...m, name: user.fullName, email: user.email, avatar: user.avatar }
            } catch {
              return { ...m, name: "Unknown", email: "Unavailable" }
            }
          }),
        )
        setTeamMembers(enrichedMembers)

        const assignee = enrichedMembers.find((m) => m.userId === taskData.assigneeId)
        const updatedTaskData = {
          ...taskData,
          assigneeEmail: assignee?.email || "",
          assigneeAvatar: assignee?.avatar || "",
        }

        setTask(updatedTaskData)
      } catch (error) {
        toast({
          title: "Failed to load task",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [taskId, toast])

  const isOwner = currentUser?.id === task?.createdById
  const isAssignedToMe = currentUser?.id === task?.assigneeId

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="w-4 h-4" />
      case "Medium":
        return <Circle className="w-4 h-4" />
      case "Low":
        return <Minus className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-500/10 border-red-200"
      case "Medium":
        return "text-blue-500 bg-blue-500/10 border-blue-200"
      case "Low":
        return "text-gray-500 bg-gray-500/10 border-gray-200"
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "In Review":
        return <Eye className="w-5 h-5 text-purple-500" />
      case "In Progress":
        return <Activity className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "Done":
      case "Completed":
        return 100
      case "In Review":
        return 80
      case "In Progress":
        return 50
      default:
        return 10
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleUpdateTask = async (updatedData: any) => {
    try {
      const updatedTask = await updateTask(taskId as string, updatedData)
      setTask(updatedTask)
      setEditingTask(false)
      toast({ title: "Task updated successfully" })
    } catch (error) {
      toast({
        title: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const created = await createComment({ taskId, content: newComment })
      setComments((prev) => [...prev, created])
      setNewComment("")
      toast({ title: "Comment added" })
    } catch (error) {
      toast({
        title: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleEditComment = async (commentId: string) => {
    try {
      await updateComment(commentId, { content: editingContent })
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content: editingContent } : c)))
      setEditingCommentId(null)
      setEditingContent("")
      toast({ title: "Comment updated" })
    } catch (error) {
      toast({
        title: "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({ title: "Comment deleted" })
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await deleteTask(taskId as string)
      toast({ title: "Task deleted successfully" })
      router.push(`/project/${task.projectId}`)
    } catch (error) {
      toast({
        title: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-[300px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task || !project) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          <Card className="glass-effect border-border/50">
            <CardContent className="py-20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Task not found</h3>
                <p className="text-muted-foreground">The task you're looking for doesn't exist or has been deleted</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const daysUntilDue = getDaysUntilDue(task.dueDate)

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(task.status)}
                <h1 className="text-3xl font-bold gradient-text truncate">{task.title}</h1>
                {isAssignedToMe && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-200">
                    Assigned to you
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-4">{task.description}</p>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{getStatusProgress(task.status)}%</span>
                </div>
                <Progress value={getStatusProgress(task.status)} className="h-2" />
              </div>
            </div>

            {/* Action Buttons */}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingTask(true)}
                  disabled={editingTask}
                  className="hover-lift"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteTask} disabled={editingTask} className="hover-lift">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {/* Task Editing Form */}
            {editingTask && (
              <Card className="glass-effect border-border/50 animate-scale-in">
                <CardHeader>
                  <CardTitle>Edit Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskForm
                    mode="edit"
                    projectId={task.projectId}
                    taskData={task}
                    teamMembers={teamMembers}
                    onSubmit={handleUpdateTask}
                    onCancel={() => setEditingTask(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            {!editingTask && (
              <div className="grid lg:grid-cols-3 gap-6 animate-slide-up">
                {/* Left Column - Task Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Task Overview */}
                  <Card className="glass-effect border-border/50">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Status Card */}
                        <div className="text-center p-4 bg-secondary/20 rounded-lg">
                          <div className="flex justify-center mb-2">{getStatusIcon(task.status)}</div>
                          <p className="font-medium">{task.status}</p>
                          <p className="text-xs text-muted-foreground">Current Status</p>
                        </div>

                        {/* Priority Card */}
                        <div className={`text-center p-4 rounded-lg border ${getPriorityColor(task.priority)}`}>
                          <div className="flex justify-center mb-2">{getPriorityIcon(task.priority)}</div>
                          <p className="font-medium">{task.priority}</p>
                          <p className="text-xs opacity-70">Priority Level</p>
                        </div>

                        {/* Due Date Card */}
                        <div
                          className={`text-center p-4 rounded-lg border ${daysUntilDue < 0
                              ? "text-red-500 bg-red-500/10 border-red-200"
                              : daysUntilDue <= 3
                                ? "text-orange-500 bg-orange-500/10 border-orange-200"
                                : "text-green-500 bg-green-500/10 border-green-200"
                            }`}
                        >
                          <div className="flex justify-center mb-2">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <p className="font-medium">
                            {daysUntilDue < 0 ? "Overdue" : daysUntilDue === 0 ? "Due Today" : `${daysUntilDue} days`}
                          </p>
                          <p className="text-xs opacity-70">{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignment & Team */}
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Assignment & Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Assignee */}
                      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={task.assigneeAvatar} />
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                              {(isAssignedToMe ? currentUser?.fullName : task.assigneeName)?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{isAssignedToMe ? "You" : task.assigneeName || "Unassigned"}</p>
                            <p className="text-sm text-muted-foreground">Assignee</p>
                          </div>
                        </div>
                        {isAssignedToMe && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                            Your Task
                          </Badge>
                        )}
                      </div>

                      {/* Creator */}
                      <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {task.createdByName?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{task.createdByName}</p>
                          <p className="text-sm text-muted-foreground">Task Creator</p>
                        </div>
                        {isOwner && <Star className="w-4 h-4 text-yellow-500 ml-auto" />}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Project Info */}
                <div className="space-y-6">
                  {/* Project Details */}
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <Link href={`/project/${task.projectId}`} className="font-semibold text-primary hover:underline">
                          {project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{project.description || "No description"}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="outline">{project.status?.replace("_", " ")}</Badge>
                        </div>

                        {project.dueDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Project Due</span>
                            <span className="text-sm font-medium">{new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Team Size</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{teamMembers.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href={`/project/${task.projectId}`}>
                          <Folder className="w-4 h-4 mr-2" />
                          View Project
                        </Link>
                      </Button>
                      {isAssignedToMe && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Timer className="w-4 h-4 mr-2" />
                          Start Timer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <Card className="glass-effect border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Discussion ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Comment Form */}
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {currentUser?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] bg-background border-border/50 focus:border-primary"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="gradient-button hover-lift"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 p-4 bg-secondary/10 rounded-lg animate-fade-in hover:bg-secondary/20 transition-colors"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author?.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {comment.authorName?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{comment.authorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {comment.authorId === currentUser?.id && (
                              <div className="flex gap-1">
                                {editingCommentId === comment.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditComment(comment.id)}
                                      disabled={!editingContent.trim()}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingCommentId(null)
                                        setEditingContent("")
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingCommentId(comment.id)
                                        setEditingContent(comment.content)
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <Textarea
                              className="mt-2 bg-background border-border/50"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                            />
                          ) : (
                            <p className="text-sm leading-relaxed">{comment.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No comments yet. Start the discussion!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
