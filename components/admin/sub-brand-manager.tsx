"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Layers, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  slug: string
  brandId: string
  brandName: string
}

interface SubBrandManagerProps {
  onUpdate: () => void
}

export default function SubBrandManager({ onUpdate }: SubBrandManagerProps) {
  const [subBrands, setSubBrands] = useState<SubBrand[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubBrand, setEditingSubBrand] = useState<SubBrand | null>(null)
  const [formData, setFormData] = useState({ name: "", brandId: "" })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [fetchError, setFetchError] = useState("")

  useEffect(() => {
    Promise.all([fetchSubBrands(), fetchBrands()])
  }, [])

  const fetchSubBrands = async () => {
    try {
      setFetchError("")
      const response = await fetch("/api/admin/sub-brands")
      if (response.ok) {
        const data = await response.json()
        setSubBrands(data)
      } else {
        throw new Error("Failed to fetch sub-brands")
      }
    } catch (error) {
      console.error("Failed to fetch sub-brands:", error)
      setFetchError("Failed to load sub-brands. Please try again.")
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
      } else {
        throw new Error("Failed to fetch brands")
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Sub-brand name is required")
      return
    }

    if (!formData.brandId) {
      setError("Please select a brand")
      return
    }

    setLoading(true)
    setError("")

    try {
      const url = editingSubBrand ? `/api/admin/sub-brands/${editingSubBrand._id}` : "/api/admin/sub-brands"
      const method = editingSubBrand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingSubBrand ? "Sub-brand updated successfully!" : "Sub-brand created successfully!")
        setIsDialogOpen(false)
        setEditingSubBrand(null)
        setFormData({ name: "", brandId: "" })
        fetchSubBrands()
        onUpdate()
      } else {
        setError(data.error || "Failed to save sub-brand")
        toast.error(data.error || "Failed to save sub-brand")
      }
    } catch (error) {
      console.error("Failed to save sub-brand:", error)
      setError("Network error. Please try again.")
      toast.error("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string, brandName: string) => {
    try {
      const response = await fetch(`/api/admin/sub-brands/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(`Sub-brand "${name}" deleted successfully`)
        fetchSubBrands()
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete sub-brand")
      }
    } catch (error) {
      console.error("Failed to delete sub-brand:", error)
      toast.error("Network error occurred")
    }
  }

  const openEditDialog = (subBrand: SubBrand) => {
    setEditingSubBrand(subBrand)
    setFormData({ name: subBrand.name, brandId: subBrand.brandId })
    setError("")
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingSubBrand(null)
    setFormData({ name: "", brandId: "" })
    setError("")
    setIsDialogOpen(true)
  }

  if (initialLoading) {
    return <LoadingState message="Loading sub-brands..." />
  }

  if (fetchError) {
    return <ErrorState message={fetchError} retry={() => Promise.all([fetchSubBrands(), fetchBrands()])} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Sub-Brand Management
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Organize brands into sub-categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sub-Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubBrand ? "Edit Sub-Brand" : "Add New Sub-Brand"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brandId">Parent Brand *</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => setFormData({ ...formData, brandId: value })}
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
                {brands.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No brands available. Create a brand first.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Sub-Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter sub-brand name"
                  disabled={loading}
                  className="h-10 sm:h-11"
                />
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
                <Button type="submit" disabled={loading || brands.length === 0} className="flex-1 gap-2 h-10 sm:h-11">
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingSubBrand ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {subBrands.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sub-brands yet</h3>
            <p className="text-muted-foreground mb-4">
              Create sub-brand categories to organize your car models
            </p>
            <Button onClick={openCreateDialog} className="gap-2" disabled={brands.length === 0}>
              <Plus className="h-4 w-4" />
              Add Your First Sub-Brand
            </Button>
            {brands.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                You need to create at least one brand first
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {subBrands.map((subBrand) => (
              <Card key={subBrand._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-secondary/50">
                        <Tag className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm sm:text-base">{subBrand.name}</p>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {subBrand.brandName}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">/{subBrand.slug}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(subBrand)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Edit sub-brand</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Delete sub-brand</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Sub-Brand</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{subBrand.name}" from {subBrand.brandName}? This action cannot be undone and will also delete all associated models.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(subBrand._id, subBrand.name, subBrand.brandName)}
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
