import { getModelsBySubBrand } from "@/lib/db"
import Link from "next/link"
import { Car, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModelCard } from "@/components/model-card"

interface SubBrandListProps {
  brandId: string
  brandSlug: string
  subBrands: any[]
}

export default async function SubBrandList({ brandId, brandSlug, subBrands }: SubBrandListProps) {
  if (!subBrands || subBrands.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No sub-brands available</h3>
        <p className="text-muted-foreground">This brand doesn't have any sub-categories yet.</p>
      </div>
    )
  }

  const subBrandsWithModels = await Promise.all(
    subBrands.map(async (subBrand) => {
      try {
        const models = await getModelsBySubBrand(subBrand._id)
        return { ...subBrand, models }
      } catch (error) {
        console.error(`Failed to fetch models for sub-brand ${subBrand._id}:`, error)
        return { ...subBrand, models: [] }
      }
    }),
  )

  return (
    <div className="space-y-8">
      {/* Quick Navigation */}
      {subBrands.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {subBrands.map((subBrand) => (
                <Button
                  key={subBrand._id}
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                >
                  <Link href={`#${subBrand.slug}`}>
                    <Tag className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{subBrand.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Models grouped by sub-brand */}
      <div className="space-y-4 sm:space-y-8">
        {subBrandsWithModels.map((subBrand) => (
          <Card key={subBrand._id} id={subBrand.slug} className="scroll-mt-16 sm:scroll-mt-20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2 min-w-0">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{subBrand.name}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {subBrand.models.length} {subBrand.models.length === 1 ? 'model' : 'models'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {subBrand.models.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm sm:text-base">No models in this category yet</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {subBrand.models.map((model: any) => (
                    <ModelCard 
                      key={model._id}
                      model={model}
                      brandSlug={brandSlug}
                      subBrandSlug={subBrand.slug}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
