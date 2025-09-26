"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, X, Upload, ImageIcon, Car, Settings, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { LoadingSpinner, LoadingState } from "@/components/ui/loading-spinner"
import { ErrorState, InlineError } from "@/components/ui/error-state"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Brand {
  _id: string
  name: string
}

interface SubBrand {
  _id: string
  name: string
  brandId: string
}

interface Model {
  _id: string
  name: string
  slug: string
  description?: string
  subBrandId: string
  subBrandName: string
  brandName: string
  images: string[]
}

interface ModelManagerProps {
  onUpdate: () => void
}

export default function ModelManager({ onUpdate }: ModelManagerProps) {
  const [models, setModels] = useState<Model[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [subBrands, setSubBrands] = useState<SubBrand[]>([])
  const [filteredSubBrands, setFilteredSubBrands] = useState<SubBrand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandId: "",
    subBrandId: "",
    images: [] as File[],
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([])

  useEffect(() => {
    Promise.all([fetchModels(), fetchBrands(), fetchSubBrands()])
  }, [])

  useEffect(() => {
    if (formData.brandId) {
      setFilteredSubBrands(subBrands.filter((sb) => sb.brandId === formData.brandId))
    } else {
      setFilteredSubBrands([])
    }
  }, [formData.brandId, subBrands])

  const fetchModels = async () => {
    try {
      setFetchError("")
      const response = await fetch("/api/admin/models")
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      } else {
        throw new Error("Failed to fetch models")
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
      setFetchError("Failed to load models. Please try again.")
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands")
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error)
    }
  }

  const fetchSubBrands = async () => {
    try {
      const response = await fetch("/api/admin/sub-brands")
      if (response.ok) {
        const data = await response.json()
        setSubBrands(data)
      }
    } catch (error) {
      console.error("Failed to fetch sub-brands:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Model name is required")
      return
    }
    
    if (!formData.subBrandId) {
      setError("Please select a sub-brand")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      formDataToSend.append("description", formData.description.trim())
      formDataToSend.append("subBrandId", formData.subBrandId)

      // Add new images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      // Add images to remove (for editing)
      if (editingModel && imagesToRemove.length > 0) {
        formDataToSend.append("imagesToRemove", JSON.stringify(imagesToRemove))
      }

      const url = editingModel ? `/api/admin/models/${editingModel._id}` : "/api/admin/models"
      const method = editingModel ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingModel ? "Model updated successfully!" : "Model created successfully!")
        setIsDialogOpen(false)
        setEditingModel(null)
        resetForm()
        fetchModels()
        onUpdate()
      } else {
        setError(data.error || "Failed to save model")
        toast.error(data.error || "Failed to save model")
      }
    } catch (error) {
      console.error("Failed to save model:", error)
      setError("Network error. Please try again.")
      toast.error("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", brandId: "", subBrandId: "", images: [] })
    setExistingImages([])
    setImagesToRemove([])
    cleanupPreviewUrls()
    setError("")
  }

  const cleanupPreviewUrls = () => {
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    setPreviewUrls([])
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast.success(`Model "${name}" deleted successfully`)
        fetchModels()
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete model")
      }
    } catch (error) {
      console.error("Failed to delete model:", error)
      toast.error("Network error occurred")
    }
  }

  const openEditDialog = (model: Model) => {
    const subBrand = subBrands.find((sb) => sb._id === model.subBrandId)
    setEditingModel(model)
    setFormData({
      name: model.name,
      description: model.description || "",
      brandId: subBrand?.brandId || "",
      subBrandId: model.subBrandId,
      images: [],
    })
    setExistingImages(model.images || [])
    setImagesToRemove([])
    cleanupPreviewUrls()
    setError("")
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingModel(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Validate files
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB")
          return
        }
        if (!file.type.startsWith('image/')) {
          setError("Please select only image files")
          return
        }
      }

      // Clean up previous preview URLs
      cleanupPreviewUrls()
      
      // Create new preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file))
      setPreviewUrls(newPreviewUrls)
      setFormData({ ...formData, images: files })
      setError("")
    }
  }

  const removeNewImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL for the removed image
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index])
    }
    
    setPreviewUrls(newPreviewUrls)
    setFormData({ ...formData, images: newImages })
  }

  const removeExistingImage = (imageUrl: string) => {
    setImagesToRemove([...imagesToRemove, imageUrl])
    setExistingImages(existingImages.filter(url => url !== imageUrl))
  }

  // Clean up blob URLs when component unmounts or dialog closes
  useEffect(() => {
    return () => cleanupPreviewUrls()
  }, [])

  useEffect(() => {
    if (!isDialogOpen) {
      cleanupPreviewUrls()
    }
  }, [isDialogOpen])

  if (initialLoading) {
    return <LoadingState message="Loading models..." />
  }

  if (fetchError) {
    return <ErrorState message={fetchError} retry={() => Promise.all([fetchModels(), fetchBrands(), fetchSubBrands()])} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Model Management
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage car models and their images
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingModel ? "Edit Model" : "Add New Model"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandId">Brand *</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => setFormData({ ...formData, brandId: value, subBrandId: "" })}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subBrandId">Sub-Brand *</Label>
                  <Select
                    value={formData.subBrandId}
                    onValueChange={(value) => setFormData({ ...formData, subBrandId: value })}
                    disabled={loading || !formData.brandId}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select a sub-brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubBrands.map((subBrand) => (
                        <SelectItem key={subBrand._id} value={subBrand._id}>
                          {subBrand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.brandId && filteredSubBrands.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No sub-brands available for this brand
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter model name"
                  disabled={loading}
                  className="h-10 sm:h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter model description"
                  rows={3}
                  disabled={loading}
                  className="min-h-[80px] sm:min-h-[90px]"
                />
              </div>

              {/* Existing Images (Edit Mode) */}
              {editingModel && existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-20 w-full rounded-lg overflow-hidden bg-muted border-2 border-border">
                          <Image
                            src={imageUrl}
                            alt={`Model image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(imageUrl)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div className="space-y-2">
                <Label htmlFor="images" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {editingModel ? "Add New Images" : "Images"}
                </Label>
                
                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-20 w-full rounded-lg overflow-hidden bg-muted border-2 border-border">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Input 
                  id="images" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  disabled={loading}
                  className="h-10 sm:h-11"
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF (max 5MB each). You can select multiple images.
                </p>
                
                {formData.images.length > 0 && (
                  <div className="space-y-1">
                    {formData.images.map((image, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 text-xs">
                        <ImageIcon className="h-3 w-3" />
                        {image.name}
                      </Badge>
                    ))}
                  </div>
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
                <Button 
                  type="submit" 
                  disabled={loading || !formData.name.trim() || !formData.subBrandId} 
                  className="flex-1 gap-2 h-10 sm:h-11"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingModel ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {models.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No models yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first car model
            </p>
            <Button onClick={openCreateDialog} className="gap-2" disabled={brands.length === 0 || subBrands.length === 0}>
              <Plus className="h-4 w-4" />
              Add Your First Model
            </Button>
            {(brands.length === 0 || subBrands.length === 0) && (
              <p className="text-xs text-muted-foreground mt-2">
                You need brands and sub-brands before creating models
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {models.map((model) => (
              <Card key={model._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                        {model.images && model.images.length > 0 ? (
                          <div className="relative h-10 w-10 rounded overflow-hidden">
                            <Image
                              src={model.images[0]}
                              alt={model.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Car className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm sm:text-base">{model.name}</p>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-xs">
                            {model.brandName}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {model.subBrandName}
                          </Badge>
                        </div>
                        {model.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
                            {model.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />
                          {model.images.length} image{model.images.length !== 1 ? 's' : ''}
                          <span className="text-muted-foreground">•</span>
                          <span>/{model.slug}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(model)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Edit model</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Delete model</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Model</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{model.name}"? This action cannot be undone and will also delete all associated images.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(model._id, model.name)}
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
