"use client"

import { useEffect, useState } from "react"
import { getUserPendingInvites, acceptInvite, declineInvite, getUserById, getProject } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { Check, X, Mail, Calendar, Folder, Clock, CheckCircle2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ModernInvitesPage() {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [processingInvites, setProcessingInvites] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const fetchInvites = async () => {
    try {
      setLoading(true)
      const rawInvites = await getUserPendingInvites()

      const invitesWithDetails = await Promise.all(
        rawInvites.map(async (invite: any) => {
          try {
            const [inviter, project] = await Promise.all([getUserById(invite.invitedBy), getProject(invite.projectId)])

            return {
              ...invite,
              inviterName: inviter.fullName,
              inviterEmail: inviter.email,
              inviterAvatar: inviter.avatar,
              project,
            }
          } catch (error) {
            return {
              ...invite,
              inviterName: "Unknown User",
              inviterEmail: "unknown@example.com",
              inviterAvatar: null,
              project: { name: "Unknown Project", description: "Project details unavailable" },
            }
          }
        }),
      )

      setInvites(invitesWithDetails)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load invites", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  const handleAccept = async (id: number) => {
    try {
      setProcessingInvites((prev) => new Set(prev).add(id))
      await acceptInvite(id)
      toast({ title: "Success", description: "Invitation accepted successfully!" })
      fetchInvites()
    } catch {
      toast({ title: "Error", description: "Failed to accept invitation", variant: "destructive" })
    } finally {
      setProcessingInvites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleDecline = async (id: number) => {
    try {
      setProcessingInvites((prev) => new Set(prev).add(id))
      await declineInvite(id)
      toast({ title: "Success", description: "Invitation declined" })
      fetchInvites()
    } catch {
      toast({ title: "Error", description: "Failed to decline invitation", variant: "destructive" })
    } finally {
      setProcessingInvites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "declined":
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "default"
      case "declined":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground text-lg">Loading your invitations...</p>
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
            <h1 className="text-4xl font-bold gradient-text mb-2">Project Invitations</h1>
            <p className="text-muted-foreground text-lg">
              {invites.length > 0
                ? `You have ${invites.filter((i) => i.status === "pending").length} pending invitation${invites.filter((i) => i.status === "pending").length !== 1 ? "s" : ""
                }`
                : "No pending invitations"}
            </p>
          </div>

          {/* Invitations List */}
          {invites.length === 0 ? (
            <Card className="glass-effect border-border/50 animate-fade-in">
              <CardContent className="py-20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No invitations found</h3>
                  <p className="text-muted-foreground">You don't have any project invitations at the moment</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-scale-in">
              {invites.map((invite, index) => (
                <Card
                  key={invite.id}
                  className="glass-effect border-border/50 hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-semibold mb-1">{invite.project?.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(invite.status)}
                            <Badge variant={getStatusColor(invite.status)} className="capitalize">
                              {invite.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {invite.project?.description || "No description available"}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Invitation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <UserPlus className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Role:</span>
                          <Badge variant="outline" className="capitalize">
                            {invite.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Invited:</span>
                          <span className="text-muted-foreground">
                            {format(new Date(invite.createdAt || Date.now()), "PPP")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={invite.inviterAvatar} />
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                              {invite.inviterName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{invite.inviterName}</p>
                            <p className="text-xs text-muted-foreground truncate">{invite.inviterEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {invite.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          onClick={() => handleAccept(invite.id)}
                          disabled={processingInvites.has(invite.id)}
                          className="gradient-button hover-lift flex-1"
                        >
                          {processingInvites.has(invite.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Accept Invitation
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDecline(invite.id)}
                          disabled={processingInvites.has(invite.id)}
                          className="hover-lift flex-1"
                        >
                          {processingInvites.has(invite.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                              Declining...
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Decline
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {invite.status !== "pending" && (
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground text-center">
                          {invite.status === "accepted"
                            ? "You have accepted this invitation"
                            : "You have declined this invitation"}
                        </p>
                      </div>
                    )}
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
