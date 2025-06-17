"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Star,
  Quote,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Target,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Heart,
  Award,
  Rocket,
  Code,
} from "lucide-react"

export default function ModernLanding() {
  const [email, setEmail] = useState("")
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const texts = ["Collaborate Smarter", "Build Faster", "Deliver Better", "Work Together"]

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        const current = texts[currentIndex]

        if (isDeleting) {
          setCurrentText(current.substring(0, currentText.length - 1))
        } else {
          setCurrentText(current.substring(0, currentText.length + 1))
        }

        if (!isDeleting && currentText === current) {
          setTimeout(() => setIsDeleting(true), 2000)
        } else if (isDeleting && currentText === "") {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % texts.length)
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, texts])

  const features = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and communication tools.",
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-950/20 to-blue-900/20",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with modern technology stack for instant responsiveness.",
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-950/20 to-amber-900/20",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance standards.",
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-950/20 to-emerald-900/20",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get insights into your team's productivity with detailed analytics and reports.",
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-950/20 to-violet-900/20",
    },
    {
      icon: MessageSquare,
      title: "Smart Communication",
      description: "Integrated chat, comments, and notifications keep everyone in the loop.",
      color: "text-rose-600",
      bg: "bg-gradient-to-br from-rose-950/20 to-rose-900/20",
    },
    {
      icon: Calendar,
      title: "Project Timeline",
      description: "Visual project timelines and milestone tracking for better planning.",
      color: "text-indigo-600",
      bg: "bg-gradient-to-br from-indigo-950/20 to-indigo-900/20",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "Collabrix transformed how our team works. The intuitive interface and powerful features made project management effortless.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Engineering Lead",
      company: "StartupXYZ",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "The best collaboration tool we've used. Real-time updates and seamless integration increased our productivity by 40%.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Creative Director",
      company: "Design Studio",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "Finally, a project management tool that doesn't get in the way of creativity. Clean, fast, and incredibly user-friendly.",
      rating: 5,
    },
  ]

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users, color: "from-blue-500 to-cyan-500" },
    { number: "100K+", label: "Projects Created", icon: Target, color: "from-purple-500 to-pink-500" },
    { number: "99.9%", label: "Uptime", icon: Clock, color: "from-emerald-500 to-teal-500" },
    { number: "150+", label: "Countries", icon: Globe, color: "from-orange-500 to-red-500" },
  ]

  const faqs = [
    {
      question: "Is Collabrix really free to use?",
      answer:
        "Yes! Collabrix is completely free to use for all teams and projects. We believe in making powerful collaboration tools accessible to everyone, regardless of budget constraints.",
    },
    {
      question: "How many team members can I add?",
      answer:
        "There's no limit! You can add unlimited team members to your projects. Our free platform supports teams of all sizes, from small startups to large enterprises.",
    },
    {
      question: "What features are included in the free plan?",
      answer:
        "All features are included! You get unlimited projects, tasks, team members, real-time collaboration, file sharing, analytics, and more. No hidden fees or premium tiers.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade security with end-to-end encryption, regular security audits, and comply with international data protection standards to keep your information safe.",
    },
    {
      question: "Can I integrate with other tools?",
      answer:
        "Yes! Collabrix integrates with popular tools like Slack, GitHub, Google Drive, and many more. Our API also allows for custom integrations to fit your workflow.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "We provide comprehensive support through our help center, documentation, and community forums. Our team is committed to helping you succeed with Collabrix.",
    },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-background via-blue-950/10 to-purple-950/10">
        <div className="relative container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                100% Free Forever • No Credit Card Required
              </Badge>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {currentText}
                    <span className="animate-pulse">|</span>
                  </span>
                  <span className="block text-muted-foreground text-2xl sm:text-3xl lg:text-4xl font-normal mt-4">
                    with Modern Project Management
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  The completely free project collaboration platform that brings teams together. Streamline workflows,
                  boost productivity, and deliver exceptional results with our intuitive tools.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md transition-all duration-300 text-base px-6 py-4"
                asChild
              >
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group text-base px-6 py-4 border-2 border-primary/40 hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href="/signup" className="inline-flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 bg-clip-text text-transparent font-semibold">
                    Create New Account
                  </span>
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Always Free
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Unlimited Everything
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-950/50 to-background">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
            >
              Our Impact
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted by teams
              </span>
              <br />
              worldwide
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of teams who have transformed their collaboration with Collabrix
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="relative group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl from-blue-500/20 to-purple-500/20" />
                <Card className="relative text-center p-6 border-2 border-transparent bg-gradient-to-br from-gray-900 to-gray-800/50 hover:border-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex justify-center">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div
                      className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-background via-blue-950/10 to-purple-950/10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
              >
                About Collabrix
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Empowering Teams
                </span>
                <br />
                Around the World
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Born from the belief that powerful collaboration tools should be accessible to everyone, Collabrix is a
                completely free platform designed to help teams of all sizes achieve their goals together.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Built with Love",
                  description: "Crafted by developers who understand the challenges of team collaboration.",
                  color: "from-red-500 to-pink-500",
                },
                {
                  icon: Award,
                  title: "Quality First",
                  description: "Enterprise-grade features and security without the enterprise price tag.",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  icon: Rocket,
                  title: "Innovation Driven",
                  description: "Constantly evolving with cutting-edge features and user feedback.",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Code,
                  title: "Open Philosophy",
                  description: "Transparent development with a commitment to user privacy and data ownership.",
                  color: "from-purple-500 to-indigo-500",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-gray-900/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-950/20 to-purple-950/20 rounded-2xl p-8 space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize project management by providing world-class collaboration tools that are completely free,
                forever. We believe that great ideas shouldn't be limited by budget constraints, and every team deserves
                access to powerful tools that help them succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-950/50 to-background">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
            >
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everything you need
              </span>
              <br />
              to succeed
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to streamline your workflow and boost team productivity - all completely free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-gray-900/80 backdrop-blur-sm hover:scale-105"
              >
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-background via-blue-950/10 to-purple-950/10">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get started in
              </span>
              <br />3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Project",
                description: "Set up your project in minutes with our intuitive project creation wizard.",
                icon: FileText,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "Invite Your Team",
                description: "Add team members and assign roles with flexible permission controls.",
                icon: Users,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "03",
                title: "Start Collaborating",
                description: "Begin working together with real-time updates and seamless communication.",
                icon: Zap,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center space-y-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}
                  >
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-950/50 to-background">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loved by thousands
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See what our customers have to say about their experience with Collabrix
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-gray-900/80 backdrop-blur-sm hover:scale-105"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                    <p className="text-muted-foreground leading-relaxed pl-6">{testimonial.content}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-br from-background via-blue-950/10 to-purple-950/10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
              >
                FAQ
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />
                Questions
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Everything you need to know about Collabrix
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="border-border/50 bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <button
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                      <div className="transition-transform duration-300 ease-in-out">
                        {openFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-pink-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        <div className="relative container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Ready to Get Started?
              </Badge>

              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Start collaborating
                </span>
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl lg:text-4xl font-normal">
                  with your team today
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Join thousands of teams who have transformed their workflow with Collabrix. It's completely free,
                forever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
                asChild
              >
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 text-lg px-8 py-6"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Setup in 2 Minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-950/50 to-background border-t border-border/50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Collabrix
                </span>
              </Link>
              <p className="text-muted-foreground">
                The completely free project collaboration platform that brings teams together.
              </p>
              <div className="flex space-x-4">
                <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                  <Github className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Product</h3>
              <div className="space-y-2">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link
                  href="/integrations"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integrations
                </Link>
                <Link href="/security" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
                <Link href="/api" className="block text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <div className="space-y-2">
                <Link href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/careers" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
                <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link href="#faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Support</h3>
              <div className="space-y-2">
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
                <Link href="/status" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Status
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 Collabrix. All rights reserved.</p>
            <p className="text-muted-foreground text-sm">Made with ❤️ for better collaboration</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
