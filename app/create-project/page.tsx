"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowLeft, Plus, X, Zap, Target, DollarSign, Tag, Folder, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createProject } from "@/lib/api"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernCreateProjectPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    budget: "",
    tagInput: "",
    tags: [] as string[],
  })

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    const newTag = formData.tagInput.trim()
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
        tagInput: "",
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const payload = {
        name: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate?.toISOString().split("T")[0],
        endDate: formData.dueDate?.toISOString().split("T")[0],
        budget: formData.budget ? Number.parseFloat(formData.budget) : null,
        tags: formData.tags,
      }

      await createProject(payload)

      toast({
        title: "Success",
        description: "Project created successfully!",
      })

      router.push("/my-projects")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>

      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="mx-auto text-center">
              <h1 className="text-4xl font-bold gradient-text">Create New Project</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Set up a new project and start collaborating with your team
              </p>
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
                <CardDescription>Provide the basic details about your project</CardDescription>
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
                    placeholder="Enter a descriptive project title"
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
                    placeholder="Describe what this project is about, its goals, and key objectives"
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
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Low Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
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
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger className="bg-secondary/30 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select initial status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
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
                <CardDescription>Set project timeline and budget constraints</CardDescription>
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
                          initialFocus
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
                          initialFocus
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
                    placeholder="e.g., 100000"
                    type="number"
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
                  Tags (Optional)
                </CardTitle>
                <CardDescription>Add tags to help categorize and organize your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    value={formData.tagInput}
                    onChange={(e) => handleChange("tagInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="bg-secondary/30 border-border/50 focus:border-primary"
                  />
                  <Button type="button" onClick={addTag} className="gradient-button hover-lift">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-secondary/20 rounded-lg">
                    {formData.tags.map((tag, index) => (
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
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button type="button" variant="outline" asChild className="hover-lift">
                <Link href="/my-projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-button hover-lift">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
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
