import { NextRequest, NextResponse } from "next/server"
import { getBrands, getSubBrands, getModels } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchQuery = query.trim().toLowerCase()

    // Search in parallel
    const [brands, subBrands, models] = await Promise.all([
      getBrands(),
      getSubBrands(),
      getModels()
    ])

    const results: any[] = []

    // Search brands
    const matchingBrands = brands.filter((brand: any) =>
      brand.name.toLowerCase().includes(searchQuery)
    ).slice(0, 5) // Limit results

    for (const brand of matchingBrands) {
      results.push({
        id: brand._id,
        type: 'brand',
        name: brand.name,
        slug: brand.slug,
        description: `Car brand - ${brand.name}`
      })
    }

    // Search sub-brands
    const matchingSubBrands = subBrands.filter((subBrand: any) =>
      subBrand.name.toLowerCase().includes(searchQuery)
    ).slice(0, 5)

    for (const subBrand of matchingSubBrands) {
      const parentBrand = brands.find((b: any) => b._id === subBrand.brandId)
      results.push({
        id: subBrand._id,
        type: 'subBrand',
        name: subBrand.name,
        slug: subBrand.slug,
        brandSlug: parentBrand?.slug,
        description: `${subBrand.brandName || parentBrand?.name} category`
      })
    }

    // Search models
    const matchingModels = models.filter((model: any) =>
      model.name.toLowerCase().includes(searchQuery) ||
      (model.description && model.description.toLowerCase().includes(searchQuery))
    ).slice(0, 10)

    for (const model of matchingModels) {
      const parentSubBrand = subBrands.find((sb: any) => sb._id === model.subBrandId)
      const parentBrand = brands.find((b: any) => b._id === parentSubBrand?.brandId)
      
      results.push({
        id: model._id,
        type: 'model',
        name: model.name,
        slug: model.slug,
        brandSlug: parentBrand?.slug || model.brandName,
        subBrandSlug: parentSubBrand?.slug || model.subBrandName,
        description: model.description || `${model.brandName} ${model.subBrandName} model`
      })
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery
      const bExact = b.name.toLowerCase() === searchQuery
      const aStarts = a.name.toLowerCase().startsWith(searchQuery)
      const bStarts = b.name.toLowerCase().startsWith(searchQuery)

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ 
      results: results.slice(0, 15), // Limit total results
      query 
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Search failed", results: [] },
      { status: 500 }
    )
  }
}