"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Edit, Trash2, Upload, AlertCircle, Car, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { LoadingSpinner, LoadingState } from "@/components/ui/loading-spinner"
import { ErrorState, InlineError } from "@/components/ui/error-state"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Brand {
  _id: string
  name: string
  slug: string
  logo?: string
}

interface BrandManagerProps {
  onUpdate: () => void
}

export default function BrandManager({ onUpdate }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({ name: "", logo: null as File | null })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setFetchError("")
      const response = await fetch("/api/admin/brands")
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      } else {
        throw new Error("Failed to fetch brands")
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error)
      setFetchError("Failed to load brands. Please try again.")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Brand name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo)
      }

      const url = editingBrand ? `/api/admin/brands/${editingBrand._id}` : "/api/admin/brands"
      const method = editingBrand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingBrand ? "Brand updated successfully!" : "Brand created successfully!")
        setIsDialogOpen(false)
        setEditingBrand(null)
        setFormData({ name: "", logo: null })
        fetchBrands()
        onUpdate()
      } else {
        setError(data.error || "Failed to save brand")
        toast.error(data.error || "Failed to save brand")
      }
    } catch (error) {
      console.error("Failed to save brand:", error)
      setError("Network error. Please try again.")
      toast.error("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(`Brand "${name}" deleted successfully`)
        fetchBrands()
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete brand")
      }
    } catch (error) {
      console.error("Failed to delete brand:", error)
      toast.error("Network error occurred")
    }
  }

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name, logo: null })
    setPreviewUrl(brand.logo || null)
    setError("")
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingBrand(null)
    setFormData({ name: "", logo: null })
    setPreviewUrl(null)
    setError("")
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file")
        return
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData({ ...formData, logo: file })
      setError("")
    }
  }

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFormData({ ...formData, logo: null })
    
    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Clean up blob URLs when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    if (!isDialogOpen && previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [isDialogOpen, previewUrl])

  if (initialLoading) {
    return <LoadingState message="Loading brands..." />
  }

  if (fetchError) {
    return <ErrorState message={fetchError} retry={fetchBrands} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Brand Management
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage car brands and their logos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter brand name"
                  disabled={loading}
                  className="h-10 sm:h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo Image
                </Label>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted border-2 border-border">
                      <Image
                        src={previewUrl}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="h-10 sm:h-11"
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF (max 5MB)
                </p>
                {formData.logo && (
                  <Badge variant="secondary" className="gap-1">
                    <Upload className="h-3 w-3" />
                    {formData.logo.name}
                  </Badge>
                )}
              </div>

              {error && <InlineError message={error} />}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                  className="flex-1 h-10 sm:h-11"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 gap-2 h-10 sm:h-11">
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingBrand ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {brands.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first car brand
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Brand
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {brands.map((brand) => (
              <Card key={brand._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      {brand.logo ? (
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                          <span className="text-sm font-bold text-primary">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm sm:text-base">{brand.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/{brand.slug}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(brand)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Edit brand</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Delete brand</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{brand.name}"? This action cannot be undone and will also delete all associated sub-brands and models.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(brand._id, brand.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
