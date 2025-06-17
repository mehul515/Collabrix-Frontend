"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getProject,
  getProjectMembers,
  getUserProfile,
  getUserById,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Clock, User, Calendar, Target, CheckCircle2, AlertCircle, Activity } from "lucide-react"
import Link from "next/link"
import { TaskForm } from "@/components/task-form"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/ProtectedRoute"

const statusToColumn = {
  "To Do": "todo",
  "In Progress": "inprogress",
  "In Review": "review",
  Completed: "done",
}

const columnToStatus = {
  todo: "To Do",
  inprogress: "In Progress",
  review: "In Review",
  done: "Completed",
}

const columnConfig = {
  todo: {
    title: "To Do",
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  inprogress: {
    title: "In Progress",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  review: {
    title: "In Review",
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  done: {
    title: "Done",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
}

export default function ModernProjectBoardPage() {
  const { id: projectId } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [project, setProject] = useState<any>(null)
  const [boardData, setBoardData] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  const [draggedTask, setDraggedTask] = useState<any>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [selectedColumn, setSelectedColumn] = useState<string>("todo")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, proj, members, taskList] = await Promise.all([
          getUserProfile(),
          getProject(projectId as string),
          getProjectMembers(projectId as string),
          getProjectTasks(projectId as string),
        ])
        setCurrentUser(user)
        setProject(proj)

        const enrichedMembers = await Promise.all(
          members.map(async (m: any) => {
            try {
              const user = await getUserById(m.userId)
              return { ...m, name: user.fullName, email: user.email }
            } catch {
              return { ...m, name: "Unknown", email: "Unavailable" }
            }
          }),
        )
        setTeamMembers(enrichedMembers)

        const owner = enrichedMembers.find((m) => m.userId === user?.id && m.role === "owner")
        setIsOwner(!!owner)

        // Enrich each task with assignee email
        const enrichedTasks = taskList.map((task: any) => {
          const assignee = enrichedMembers.find((m) => m.userId === task.assigneeId)
          return {
            ...task,
            assigneeEmail: assignee?.email || "",
            assigneeName: assignee?.name || "Unassigned",
          }
        })

        const initialColumns = { todo: [], inprogress: [], review: [], done: [] }
        enrichedTasks.forEach((task: any) => {
          const columnId = statusToColumn[task.status] || "todo"
          initialColumns[columnId].push(task)
        })

        setBoardData({
          projectId: proj.id,
          projectTitle: proj.name,
          projectDescription: proj.description,
          columns: [
            { id: "todo", title: "To Do", tasks: initialColumns.todo },
            { id: "inprogress", title: "In Progress", tasks: initialColumns.inprogress },
            { id: "review", title: "In Review", tasks: initialColumns.review },
            { id: "done", title: "Done", tasks: initialColumns.done },
          ],
        })
      } catch {
        toast({ title: "Failed to load board", variant: "destructive" })
      }
    }

    fetchData()
  }, [projectId])

  const handleAddTask = (columnId = "todo") => {
    setSelectedColumn(columnId)
    setShowTaskForm(true)
  }

  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = await createTask({ ...taskData, status: columnToStatus[selectedColumn], projectId })
      setBoardData((prev: any) => ({
        ...prev,
        columns: prev.columns.map((col: any) =>
          col.id === selectedColumn ? { ...col, tasks: [...col.tasks, newTask] } : col,
        ),
      }))
      toast({ title: "Task Created" })
    } catch {
      toast({ title: "Error creating task", variant: "destructive" })
    } finally {
      setShowTaskForm(false)
    }
  }

  const handleUpdateTask = async (updatedTaskData: any) => {
    try {
      const taskToUpdate = {
        ...editingTask,
        ...updatedTaskData,
        id: editingTask.id,
      }

      const updated = await updateTask(taskToUpdate.id, taskToUpdate)

      setBoardData((prev: any) => ({
        ...prev,
        columns: prev.columns.map((col: any) => ({
          ...col,
          tasks: col.tasks.map((t: any) => (t.id === taskToUpdate.id ? updated : t)),
        })),
      }))

      toast({ title: "Task Updated" })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({ title: "Error updating task", variant: "destructive" })
    } finally {
      setEditingTask(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setBoardData((prev: any) => ({
        ...prev,
        columns: prev.columns.map((col: any) => ({
          ...col,
          tasks: col.tasks.filter((t: any) => t.id !== taskId),
        })),
      }))
      toast({ title: "Task Deleted" })
    } catch {
      toast({ title: "Failed to delete task", variant: "destructive" })
    }
  }

  const handleDragStart = (e: React.DragEvent, task: any) => {
    if (!isOwner) return
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (!isOwner || !draggedTask) return
    const newStatus = columnToStatus[columnId]
    if (draggedTask.status === newStatus) return

    try {
      const updated = await updateTask(draggedTask.id, { ...draggedTask, status: newStatus })
      setBoardData((prev: any) => {
        const newColumns = prev.columns.map((col: any) => {
          if (col.id === statusToColumn[draggedTask.status]) {
            return { ...col, tasks: col.tasks.filter((t: any) => t.id !== draggedTask.id) }
          } else if (col.id === columnId) {
            return { ...col, tasks: [...col.tasks, updated] }
          }
          return col
        })
        return { ...prev, columns: newColumns }
      })
      toast({ title: "Task Moved" })
    } catch {
      toast({ title: "Error moving task", variant: "destructive" })
    } finally {
      setDraggedTask(null)
    }
  }

  const getPriorityColor = (priority: string) => {
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

  if (!boardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-lg">Loading project board...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 animate-fade-in">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild className="hover-lift">
                <Link href={`/project/${boardData.projectId}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">{boardData.projectTitle}</h1>
                <p className="text-muted-foreground mt-1">{boardData.projectDescription}</p>
              </div>
            </div>
            {isOwner && (
              <Button onClick={() => handleAddTask()} className="gradient-button hover-lift">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            )}
          </div>

          {/* Board Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
            {boardData.columns.map((column: any, index: number) => {
              const config = columnConfig[column.id]
              const Icon = config.icon
              return (
                <Card key={column.id} className={`stats-card hover-lift ${config.bgColor} ${config.borderColor}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{config.title}</p>
                        <p className="text-2xl font-bold">{column.tasks.length}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
            {boardData.columns.map((column: any, columnIndex: number) => {
              const config = columnConfig[column.id]
              const Icon = config.icon

              return (
                <div
                  key={column.id}
                  className={`glass-effect rounded-lg p-4 border-2 ${config.borderColor} min-h-[600px]`}
                  onDragOver={isOwner ? (e) => e.preventDefault() : undefined}
                  onDrop={isOwner ? (e) => handleDrop(e, column.id) : undefined}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <h3 className="font-semibold text-sm uppercase tracking-wide">{config.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => handleAddTask(column.id)} className="hover-lift">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {column.tasks.map((task: any, taskIndex: number) => (
                      <Card
                        key={task.id}
                        draggable={isOwner}
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`task-card cursor-pointer animate-scale-in ${isOwner ? "hover:shadow-lg" : ""}`}
                        style={{ animationDelay: `${columnIndex * 0.1 + taskIndex * 0.05}s` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-semibold line-clamp-2 flex-1">{task.title}</CardTitle>
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs ml-2">
                              {task.priority}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground line-clamp-3">{task.description}</p>

                          {/* Task Meta Info */}
                          <div className="space-y-2">
                            {task.assigneeName && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span className="truncate">{task.assigneeName}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs flex-1 hover-lift"
                              onClick={() => router.push(`/task/${task.id}`)}
                            >
                              View
                            </Button>

                            {isOwner && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs hover-lift"
                                  onClick={() => setEditingTask(task)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs hover-lift"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {column.tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mb-3`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">No tasks in {config.title.toLowerCase()}</p>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddTask(column.id)}
                            className="mt-2 text-xs hover-lift"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Task
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Create Dialog */}
          <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
            <DialogContent className="max-w-2xl glass-effect">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Create New Task
                </DialogTitle>
              </DialogHeader>
              <TaskForm
                mode="create"
                projectId={boardData.projectId}
                teamMembers={teamMembers}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
            <DialogContent className="max-w-2xl glass-effect">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Edit Task
                </DialogTitle>
              </DialogHeader>
              {editingTask && (
                <TaskForm
                  mode="edit"
                  projectId={boardData.projectId}
                  teamMembers={teamMembers}
                  taskData={editingTask}
                  onSubmit={handleUpdateTask}
                  onCancel={() => setEditingTask(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
