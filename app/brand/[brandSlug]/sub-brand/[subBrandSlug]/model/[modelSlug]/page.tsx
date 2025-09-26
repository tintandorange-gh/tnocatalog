import { getModelBySlug } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import ModelPageClient from "./model-page-client"

interface ModelPageProps {
  params: {
    brandSlug: string
    subBrandSlug: string
    modelSlug: string
  }
}

export default async function ModelPage({ params }: ModelPageProps) {
  const model = await getModelBySlug(params.modelSlug)

  if (!model) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href={`/brand/${params.brandSlug}`} className="flex items-center space-x-2 p-2 -m-2 touch-manipulation">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Tint & Orange</h1>
              </div>
            </div>
            <div className="w-8 sm:w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <ModelPageClient model={model} />
        </div>
      </main>
    </div>
  )
}
