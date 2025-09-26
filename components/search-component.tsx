'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Car, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SearchResult {
  id: string
  type: 'brand' | 'subBrand' | 'model'
  name: string
  slug: string
  brandSlug?: string
  subBrandSlug?: string
  description?: string
}

interface SearchComponentProps {
  placeholder?: string
  className?: string
}

export function SearchComponent({ placeholder = "Search brands, models...", className }: SearchComponentProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchItems(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, searchItems])

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'brand':
        return `/brand/${result.slug}`
      case 'subBrand':
        return `/brand/${result.brandSlug}/sub-brand/${result.slug}`
      case 'model':
        return `/brand/${result.brandSlug}/sub-brand/${result.subBrandSlug}/model/${result.slug}`
      default:
        return '/'
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return <Car className="h-4 w-4" />
      case 'subBrand':
        return <Tag className="h-4 w-4" />
      case 'model':
        return <Car className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(getResultUrl(result))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[300px]">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {!loading && query && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}
            
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={result.name}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 p-3"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Simpler search input for mobile
export function MobileSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          onClick={() => setQuery("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  )
}