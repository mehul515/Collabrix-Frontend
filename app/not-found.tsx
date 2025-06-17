"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search, Zap, HelpCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
    return (
        <div className="flex items-center justify-center p-4 py-8">

            <div className="w-full max-w-4xl mx-auto text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-8xl md:text-7xl lg:text-[9rem] font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
                        404
                    </h1>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
                        <p className="relative text-2xl md:text-3xl font-bold text-slate-200 mt-4">Page Not Found</p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-12 max-w-2xl mx-auto">
                    <p className="text-lg md:text-xl text-slate-400 mb-6 leading-relaxed">
                        Oops! The page you're looking for seems to have wandered off into the digital void. Don't worry, even the
                        best explorers sometimes take a wrong turn.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white px-8 py-3"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3"
                    >
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Collabrix Branding */}
                <div className="mt-12 pt-8 border-t border-slate-700/50">
                    <Link href="/" className="inline-flex items-center space-x-3 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Collabrix
                        </span>
                    </Link>
                    <p className="text-slate-500 text-sm mt-2">Your collaborative workspace awaits</p>
                </div>
            </div>
        </div>
    )
}
