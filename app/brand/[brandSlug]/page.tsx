import { getBrandBySlug, getSubBrandsByBrand } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Car, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import SubBrandList from "@/components/sub-brand-list"

interface BrandPageProps {
  params: {
    brandSlug: string
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = await getBrandBySlug(params.brandSlug)

  if (!brand) {
    notFound()
  }

  const subBrands = await getSubBrandsByBrand(brand._id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 p-2 touch-manipulation">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Catalog</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Car className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold">Tint & Orange</h1>
              <p className="text-xs text-muted-foreground">Car Catalog</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 touch-manipulation">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Brand Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center space-x-3 sm:space-x-6">
            {brand.logo ? (
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-background shadow-sm">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-1 sm:p-2"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <span className="text-lg sm:text-2xl font-bold text-primary">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">{brand.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Explore {brand.name} models and categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <SubBrandList brandId={brand._id} brandSlug={params.brandSlug} subBrands={subBrands} />
      </main>
    </div>
  )
}
