"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { getProject, getProjectMembers, getUserById, updateProject } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  CalendarIcon,
  ArrowLeft,
  Plus,
  X,
  Save,
  Users,
  Crown,
  User,
  Folder,
  Clock,
  DollarSign,
  Tag,
  Zap,
  Target,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernUpdateProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    priority: "",
    startDate: undefined,
    dueDate: undefined,
    budget: "",
  })

  const [status, setStatus] = useState("Not Started")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const project = await getProject(id as string)
        const memberList = await getProjectMembers(id as string)

        const enriched = await Promise.all(
          memberList.map(async (m: any) => {
            try {
              const user = await getUserById(m.userId)
              return { ...m, name: user.fullName, email: user.email }
            } catch {
              return { ...m, name: "Unknown", email: "Unavailable" }
            }
          }),
        )

        setMembers(enriched)

        setFormData({
          title: project.name,
          description: project.description,
          priority: project.priority,
          startDate: new Date(project.startDate),
          dueDate: new Date(project.dueDate),
          budget: project.budget?.toString() || "",
        })

        setStatus(project.status || "Not Started")
        setTags(project.tags || [])
      } catch {
        toast({
          title: "Error",
          description: "Failed to load project details.",
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProject(id as string, {
        name: formData.title,
        description: formData.description,
        status,
        priority: formData.priority,
        startDate: formData.startDate?.toLocaleDateString("sv-SE"),
        dueDate: formData.dueDate?.toLocaleDateString("sv-SE"),
        budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
        tags,
      })

      toast({ title: "Project updated successfully." })
      router.push(`/project/${id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Update failed.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-lg">Loading project details...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="mx-auto text-center">
              <h1 className="text-4xl font-bold gradient-text">Update Project</h1>
              <p className="text-muted-foreground text-lg mt-1">Modify project details and settings</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            {/* Project Info */}
            <Card className="glass-effect border-border/50 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary" />
                  Project Information
                </CardTitle>
                <CardDescription>Update the basic details about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Project Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="bg-secondary/30 border-border/50 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="bg-secondary/30 border-border/50 focus:border-primary min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Priority
                    </Label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                      <SelectTrigger className="bg-secondary/30 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Low Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            High Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-secondary/30 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Budget */}
            <Card className="glass-effect border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Timeline & Budget
                </CardTitle>
                <CardDescription>Update project timeline and budget information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-secondary/30 border-border/50 hover:border-primary",
                            !formData.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-effect">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => handleChange("startDate", date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-secondary/30 border-border/50 hover:border-primary",
                            !formData.dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-effect">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => handleChange("dueDate", date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget (₹)
                  </Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    className="bg-secondary/30 border-border/50 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="glass-effect border-border/50 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Project Tags
                </CardTitle>
                <CardDescription>Add or remove tags to categorize your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-secondary/20 rounded-lg">
                    {tags.map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors animate-scale-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className="bg-secondary/30 border-border/50 focus:border-primary"
                  />
                  <Button type="button" onClick={addTag} className="gradient-button hover-lift">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="glass-effect border-border/50 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Members ({members.length})
                </CardTitle>
                <CardDescription>Current project team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="member-card rounded-lg px-4 py-4 flex items-center justify-between animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                              {member.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {member.role === "owner" && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{member.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        <User className="w-3 h-3 mr-1" />
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button variant="outline" asChild className="hover-lift">
                <Link href={`/project/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-button hover-lift">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
