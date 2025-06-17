"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, X, Save, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TaskFormProps {
  mode: "create" | "edit"
  projectId?: string
  taskData?: any
  teamMembers: Array<{
    id: number
    name: string
    email: string
    avatar?: string
  }>
  onSubmit: (taskData: any) => void
  onCancel: () => void
}

export function TaskForm({ mode, projectId, taskData, teamMembers, onSubmit, onCancel }: TaskFormProps) {

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigneeEmail: "",
    dueDate: undefined as Date | undefined,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Add this debug state to track when data is loaded
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    
    if (mode === "edit" && taskData) {
      
      const newFormData = {
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "",
        priority: taskData.priority || "",
        assigneeEmail: taskData.assigneeEmail || "",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      };
      
      setFormData(newFormData);
      setDataLoaded(true);
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        status: "To Do", // Default status for new tasks
        priority: "",
        assigneeEmail: "",
        dueDate: undefined,
      });
      setDataLoaded(true);
    }
  }, [mode, taskData])



  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Task title is required"
    if (!formData.description.trim()) newErrors.description = "Task description is required"
    if (!formData.assigneeEmail) newErrors.assigneeEmail = "Please assign the task to a team member"
    if (!formData.dueDate) newErrors.dueDate = "Due date is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    const payload = {
      ...formData,
      projectId,
      status: formData.status,
      dueDate: formData.dueDate?.toISOString().split("T")[0],
    }

    onSubmit(payload)

    toast({
      title: mode === "create" ? "Task Created" : "Task Updated",
      description: `Task ${mode === "create" ? "added" : "modified"} successfully.`,
    })

    setIsLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  // Show loading state if data hasn't loaded yet
  if (mode === "edit" && !dataLoaded) {
    return <div>Loading task data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{mode === "create" ? "Create Task" : "Edit Task"}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            required
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status - disabled for create mode with default "To Do" */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              disabled={mode === "create"}
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className={mode === "create" ? "bg-muted" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {mode === "create" && (
              <p className="text-xs text-muted-foreground">New tasks start with "To Do" status</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assign To & Due Date in same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <Select
              value={formData.assigneeEmail}
              onValueChange={(value) => handleChange("assigneeEmail", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.email} value={member.email}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                      <p>{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeEmail && <p className="text-sm text-destructive">{errors.assigneeEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => handleChange("dueDate", date)}
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gradient-button">
            {isLoading ? (
              mode === "create" ? "Creating..." : "Updating..."
            ) : (
              <>
                {mode === "create" ? <Plus className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {mode === "create" ? "Create Task" : "Update Task"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}