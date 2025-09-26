import { getBrands } from "@/lib/db"
import { Car } from "lucide-react"
import { BrandCard } from "@/components/brand-card"

export default async function BrandGrid() {
  let brands;
  
  try {
    brands = await getBrands()
  } catch (error) {
    console.error("Failed to fetch brands:", error)
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to load brands</h3>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No brands available</h3>
        <p className="text-muted-foreground">Check back later for new car brands</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {brands.map((brand) => (
        <BrandCard key={brand._id} brand={brand} />
      ))}
    </div>
  )
}
