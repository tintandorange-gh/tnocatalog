'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModelCardProps {
  model: {
    _id: string
    name: string
    slug: string
    description?: string
    images?: string[]
  }
  brandSlug: string
  subBrandSlug: string
}

export function ModelCard({ model, brandSlug, subBrandSlug }: ModelCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/brand/${brandSlug}/sub-brand/${subBrandSlug}/model/${model.slug}`}
      className="group block touch-manipulation"
    >
      <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative w-16 h-12 sm:w-20 sm:h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {model.images && model.images.length > 0 && !imageError ? (
                <Image
                  src={model.images[0]}
                  alt={model.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 640px) 64px, 80px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                  {model.name}
                </h4>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
              </div>
              {model.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                  {model.description}
                </p>
              )}
              <div className="flex items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs">
                  View Details
                </Badge>
                {model.images && model.images.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {model.images.length} images
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}