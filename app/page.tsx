import { Suspense } from "react"
import Link from "next/link"
import { Car, Settings } from "lucide-react"
import BrandGrid from "@/components/brand-grid"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingState } from "@/components/ui/loading-spinner"
import { PageHeader } from "@/components/ui/page-header"
import { SearchComponent, MobileSearch } from "@/components/search-component"

export default function HomePage() {
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
              <h1 className="text-lg sm:text-xl font-bold">Tint & Orange</h1>
              <p className="text-xs text-muted-foreground">Car Catalog</p>
            </div>
          </div>
          
          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <SearchComponent placeholder="Search brands, models..." className="w-full" />
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 touch-manipulation">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Search - Mobile */}
        <div className="md:hidden px-2 sm:px-4 pb-3 sm:pb-4">
          <MobileSearch />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
            <Car className="h-10 w-10 text-white" />
          </div>
          <PageHeader
            title="Welcome to Tint & Orange"
            description="Discover our extensive collection of car brands and models"
            className="text-center"
          />
        </div>

        <Suspense fallback={<LoadingState message="Loading car brands..." />}>
          <BrandGrid />
        </Suspense>
      </main>
    </div>
  )
}
