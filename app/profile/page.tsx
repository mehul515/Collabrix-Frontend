"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Save, Camera, User, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, updateUserProfile } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
  })

  const { toast } = useToast()

  const populateProfile = (user: any) => {
    const [firstName, ...rest] = user.fullName?.split(" ") || []
    const lastName = rest.join(" ")
    setProfileData({
      firstName: firstName || "",
      lastName: lastName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      location: user.address || "",
      bio: user.bio || "",
      avatar: user.avatar,
    })
  }

  useEffect(() => {
    const localUser = localStorage.getItem("user")
    if (localUser) {
      populateProfile(JSON.parse(localUser))
    } else {
      getUserProfile().then((user) => {
        if (user) {
          localStorage.setItem("user", JSON.stringify(user))
          populateProfile(user)
        }
      })
    }
  }, [])

  const user = {
    name: `${profileData.firstName} ${profileData.lastName}`,
    email: profileData.email,
    avatar: profileData.avatar,
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const updatedUser = await updateUserProfile({
        fullName: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phoneNumber: profileData.phone,
        address: profileData.location,
        bio: profileData.bio,
        avatar: profileData.avatar,
      })

      localStorage.setItem("user", JSON.stringify(updatedUser))
      populateProfile(updatedUser)

      toast({
        title: "Profile Updated! ✨",
        description: "Your profile has been successfully updated.",
      })
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "Something went wrong while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold gradient-text mb-2">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Overview Sidebar */}
            <div className="lg:col-span-1 animate-slide-up">
              <Card className="glass-effect border-border/50 sticky top-8">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
                        <AvatarImage src={profileData.avatar} alt={user.name} />
                        <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                          {profileData.firstName.charAt(0)}
                          {profileData.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-2 gradient-button rounded-full cursor-pointer hover-lift shadow-lg"
                      >
                        <Camera className="h-4 w-4 text-primary-foreground" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">{user.name || "Your Name"}</h3>
                      <p className="text-muted-foreground text-sm">{profileData.email}</p>
                      <Badge variant="secondary" className="flex items-center gap-2 w-fit mx-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </Badge>
                    </div>

                    <Separator className="w-full" />

                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Profile Completion</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full w-[85%] transition-all duration-500"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Personal Information */}
              <Card className="glass-effect border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        className="bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        className="bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        className="pl-10 bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange("phone", e.target.value)}
                          className="pl-10 bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleProfileChange("location", e.target.value)}
                          className="pl-10 bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange("bio", e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself, your role, interests, or anything you'd like to share..."
                      className="bg-secondary/30 border-border/50 focus:border-primary transition-colors resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{profileData.bio.length}/500 characters</p>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button onClick={handleSaveProfile} disabled={isLoading} className="gradient-button hover-lift px-8">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
