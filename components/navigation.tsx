"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Zap,
  DollarSign,
  Mail,
  HelpCircle,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { getUserPendingInvites } from "@/lib/api"

// Helper function for smooth scrolling to sections
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

export function Navigation() {
  const { user, isAuthenticated, loading, setUser, setIsAuthenticated, refreshUser } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [invitesCount, setInvitesCount] = useState(0)
  const [loadingInvites, setLoadingInvites] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch pending invitations count
  useEffect(() => {
    const fetchInvitesCount = async () => {
      if (!isAuthenticated || !user) return

      try {
        setLoadingInvites(true)
        const invites = await getUserPendingInvites()
        // Filter for pending invites only
        const pendingInvites = invites.filter((invite: any) => invite.status === "pending")
        setInvitesCount(pendingInvites.length)
      } catch (error) {
        console.error("Failed to fetch invites count:", error)
        setInvitesCount(0)
      } finally {
        setLoadingInvites(false)
      }
    }

    fetchInvitesCount()
  }, [isAuthenticated, user])

  const unauthenticatedLinks = [
    { href: "#home", label: "Home", icon: Home, isSection: true },
    { href: "#features", label: "Features", icon: Zap, isSection: true },
    { href: "#about", label: "About", icon: HelpCircle, isSection: true },
    { href: "#how-it-works", label: "How It Works", icon: DollarSign, isSection: true },
    { href: "#faq", label: "FAQ", icon: Mail, isSection: true },
  ]

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-projects", label: "My Projects", icon: FolderOpen },
    { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
    { href: "/invites", label: "Invites", icon: UserPlus, badge: invitesCount },
  ]

  const currentLinks = isAuthenticated ? authenticatedLinks : unauthenticatedLinks

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  if (loading) return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Responsive Container with proper spacing */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Collabrix
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:hidden">
              C
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-8">
            {currentLinks.map((link) => {
              const Icon = link.icon
              const isHomePage = pathname === "/"
              const shouldScroll = isHomePage && link.isSection

              return shouldScroll ? (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href.substring(1))}
                  className={cn(
                    "relative flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-secondary/80",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{link.label}</span>
                  <span className="xl:hidden">{link.label.split(" ")[0]}</span>
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-secondary/80",
                    pathname === link.href
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{link.label}</span>
                  <span className="xl:hidden">{link.label.split(" ")[0]}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {loadingInvites ? "..." : link.badge}
                    </Badge>
                  )}
                  {pathname === link.href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 px-2 lg:px-3 rounded-xl hover:bg-secondary/80 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                            {user.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col items-start">
                          <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-[150px]">
                            {user.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-blue-950/20 to-purple-950/20">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {user.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="font-semibold text-sm">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate w-[160px]">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary/80">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-3 h-4 w-4" />
                        <div>
                          <p className="font-medium">Profile</p>
                          <p className="text-xs text-muted-foreground">Manage your account</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary/80">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-3 h-4 w-4" />
                        <div>
                          <p className="font-medium">Settings</p>
                          <p className="text-xs text-muted-foreground">Preferences & privacy</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 hover:bg-red-950/20 focus:bg-red-950/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <div>
                        <p className="font-medium">Logout</p>
                        <p className="text-xs text-muted-foreground">Sign out of your account</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Button variant="outline" asChild className="hover:bg-secondary/80 text-sm px-3 lg:px-4">
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-sm px-3 lg:px-4"
                >
                  <Link href="/signup">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-secondary/80 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 px-2">
              {currentLinks.map((link) => {
                const Icon = link.icon
                const isHomePage = pathname === "/"
                const shouldScroll = isHomePage && link.isSection

                return shouldScroll ? (
                  <button
                    key={link.href}
                    onClick={() => {
                      scrollToSection(link.href.substring(1))
                      setIsMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-secondary/80",
                      "text-muted-foreground hover:text-foreground w-full text-left",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-secondary/80",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                    {link.badge !== undefined && link.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {loadingInvites ? "..." : link.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}

              {isAuthenticated && user ? (
                <div className="pt-4 border-t border-border/40 space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-950/20 transition-all duration-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/40">
                  <Button variant="outline" asChild className="justify-start hover:bg-secondary/80">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
