'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  modelName: string
}

export default function ImageGallery({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose, 
  modelName 
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  // Touch gesture states
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })
  const [touchStartTime, setTouchStartTime] = useState(0)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsMobile(window.innerWidth < 768)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialIndex, isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    resetZoom()
    setIsLoading(true)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    resetZoom()
    setIsLoading(true)
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  // Touch gesture handlers
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchStartTime(Date.now())
    
    if (e.touches.length === 1) {
      // Single touch - start dragging if zoomed
      if (scale > 1) {
        setIsDragging(true)
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        })
      }
    } else if (e.touches.length === 2) {
      // Two finger touch - pinch zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])
      setLastTouchDistance(distance)
      setLastTouchCenter(center)
      setIsDragging(false)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && isDragging && scale > 1) {
      // Single finger drag
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])
      
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance
        const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 5)
        setScale(newScale)
        
        // Adjust position to zoom towards the center of the pinch
        const deltaX = center.x - lastTouchCenter.x
        const deltaY = center.y - lastTouchCenter.y
        setPosition({
          x: position.x + deltaX,
          y: position.y + deltaY
        })
      }
      
      setLastTouchDistance(distance)
      setLastTouchCenter(center)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime
    
    if (e.touches.length === 0) {
      setIsDragging(false)
      setLastTouchDistance(0)
      
      // Handle tap gestures
      if (touchDuration < 300 && !isDragging) {
        const touch = e.changedTouches[0]
        const rect = imageContainerRef.current?.getBoundingClientRect()
        if (rect) {
          const x = touch.clientX - rect.left
          const centerX = rect.width / 2
          
          // Tap on left/right sides to navigate
          if (images.length > 1) {
            if (x < centerX * 0.3) {
              goToPrevious()
            } else if (x > centerX * 1.7) {
              goToNext()
            }
          }
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-2 sm:p-4">
        <div className="flex justify-between items-center text-white">
          <div>
            <h2 className="text-base sm:text-lg font-semibold truncate max-w-[60vw]">{modelName}</h2>
            <p className="text-xs sm:text-sm opacity-75">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, use swipe gestures instead */}
      {images.length > 1 && !isMobile && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 sm:w-12 sm:h-12"
          >
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 sm:w-12 sm:h-12"
          >
            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
          </Button>
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-10 sm:w-10"
          disabled={scale <= 0.5}
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetZoom}
          className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-10 sm:w-10"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-10 sm:w-10"
          disabled={scale >= 5}
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Main Image */}
      <div 
        ref={imageContainerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div
          className="transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <Image
            src={images[currentIndex] || '/placeholder.svg'}
            alt={`${modelName} - Image ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-12 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-10 max-w-[90vw] sm:max-w-md">
          <div className="flex gap-1 sm:gap-2 p-1 sm:p-2 bg-black bg-opacity-50 rounded-lg overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  resetZoom()
                  setIsLoading(true)
                }}
                className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded overflow-hidden border-2 transition-colors ${
                  index === currentIndex 
                    ? 'border-white' 
                    : 'border-transparent hover:border-gray-400'
                }`}
              >
                <Image
                  src={image || '/placeholder.svg'}
                  alt={`${modelName} thumbnail ${index + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Instructions */}
      {isMobile && (
        <div className="absolute top-16 right-2 z-10 text-white text-xs opacity-75 bg-black bg-opacity-50 p-2 rounded max-w-[40vw]">
          <div className="space-y-1">
            <div>Tap sides to navigate</div>
            <div>Pinch to zoom</div>
            <div>Drag when zoomed</div>
          </div>
        </div>
      )}

      {/* Desktop Instructions */}
      {!isMobile && (
        <div className="absolute top-20 right-4 z-10 text-white text-sm opacity-75 bg-black bg-opacity-50 p-3 rounded">
          <div className="space-y-1">
            <div>← → Navigate</div>
            <div>+ - Zoom</div>
            <div>0 Reset</div>
            <div>ESC Close</div>
            <div>Scroll to zoom</div>
            <div>Drag to pan (when zoomed)</div>
          </div>
        </div>
      )}

      
    </div>
  )
}