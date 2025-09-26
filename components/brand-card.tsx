'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BrandCardProps {
  brand: {
    _id: string
    name: string
    slug: string
    logo?: string
  }
}

export function BrandCard({ brand }: BrandCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link key={brand._id} href={`/brand/${brand.slug}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-muted touch-manipulation">
        <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 min-h-[120px] sm:min-h-[140px] relative">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </div>
          
          {brand.logo && !imageError ? (
            <div className="relative mb-3 sm:mb-4">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={56}
                height={56}
                className="object-contain rounded-lg sm:w-16 sm:h-16"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {brand.name}
            </h3>
            <Badge variant="secondary" className="mt-1 sm:mt-2 text-xs">
              View Models
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}