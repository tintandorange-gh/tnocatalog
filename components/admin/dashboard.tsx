"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, LogOut, Home, BarChart3, Layers, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingState } from "@/components/ui/loading-spinner"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import BrandManager from "./brand-manager"  
import SubBrandManager from "./sub-brand-manager"
import ModelManager from "./model-manager"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ brands: 0, subBrands: 0, models: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setError("")
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" })
      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/admin")
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed")
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Car className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Car Catalog Management</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold">Admin</h1>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={logoutLoading}
              size="sm"
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{logoutLoading ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Dashboard Overview"
            description="Manage your car catalog, brands, and models"
          />
        </div>

        {loading ? (
          <LoadingState message="Loading dashboard..." />
        ) : error ? (
          <ErrorState message={error} retry={fetchStats} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Total Brands
                  </CardTitle>
                  <Badge variant="secondary">{stats.brands}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.brands}</div>
                  <p className="text-xs text-muted-foreground">
                    Active car brands
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Total Sub-Brands
                  </CardTitle>
                  <Badge variant="secondary">{stats.subBrands}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.subBrands}</div>
                  <p className="text-xs text-muted-foreground">
                    Sub-brand categories
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Total Models
                  </CardTitle>
                  <Badge variant="secondary">{stats.models}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.models}</div>
                  <p className="text-xs text-muted-foreground">
                    Car models available
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="brands" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="brands" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <Car className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Brands</span>
                  <span className="xs:hidden">B</span>
                </TabsTrigger>
                <TabsTrigger value="sub-brands" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Sub-Brands</span>
                  <span className="xs:hidden">S</span>
                </TabsTrigger>
                <TabsTrigger value="models" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Models</span>
                  <span className="xs:hidden">M</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="brands">
                <BrandManager onUpdate={fetchStats} />
              </TabsContent>

          <TabsContent value="sub-brands">
            <SubBrandManager onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="models">
            <ModelManager onUpdate={fetchStats} />
          </TabsContent>
        </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
