"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateCarStockSchema,
  updateCarStockSchema,
} from "@/lib/validation/car-stock-schema";
import { useUpdateCarStock } from "@/hooks/use-car-stock";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";

type CarStockItemType = {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string | null;
  price: string | null;
  imageUrls: string[]; // Changed to array
  url: string | null;
  notes: string | null;
  embedding: number[] | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface CarStockEditViewProps {
  carStock: CarStockItemType;
}

function formatCarType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CarStockEditView({ carStock }: CarStockEditViewProps) {
  const router = useRouter();
  const { updateCarStock, isLoading } = useUpdateCarStock();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Initialize form with car stock data
  const form = useForm<UpdateCarStockSchema>({
    resolver: zodResolver(updateCarStockSchema),
    defaultValues: {
      id: carStock.id,
      name: carStock.name,
      type: carStock.type as CarTypes,
      description: carStock.description || undefined,
      price: carStock.price || undefined,
      imageUrls: carStock.imageUrls || [],
      url: carStock.url || undefined,
      notes: carStock.notes || undefined,
    },
  });

  const { imageUrls = [] } = form.watch();

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;

    // Validate URL format
    try {
      new URL(imageUrl);
      const updatedImageUrls = [...imageUrls, imageUrl];
      form.setValue("imageUrls", updatedImageUrls);
      setImageUrl("");
    } catch (e) {
      // Handle invalid URL format
      form.setError("imageUrls", {
        type: "manual",
        message: `Please enter a valid URL, ${e}`,
      });
    }
  };

  const removeImageUrl = (index: number) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    form.setValue("imageUrls", updatedImageUrls);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImageUrl();
    }
  };

  const onSubmit = async (data: UpdateCarStockSchema) => {
    try {
      setSubmitting(true);
      await updateCarStock(data);
      toast.success("Car updated successfully");
      router.push(`/car-stock/${carStock.id}`);
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("Failed to update car");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/car-stock/${carStock.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to car details</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Car</h1>
        </div>
      </div>

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{carStock.name}</CardTitle>
          <CardDescription>Update car information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Car Information</h3>

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter car name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type Field */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "sedan",
                            "suv",
                            "hatchback",
                            "coupe",
                            "convertible",
                            "wagon",
                            "minivan",
                            "pickup",
                            "electric",
                            "hybrid",
                            "luxury",
                            "sports",
                            "other",
                          ].map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatCarType(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter car description..."
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Field */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter price"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image URLs Field */}
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={() => (
                    <FormItem>
                      <FormLabel>Image URLs</FormLabel>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyDown={handleKeyPress}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addImageUrl}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <FormMessage />

                        {/* Display added image URLs */}
                        {imageUrls.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <p className="text-sm font-medium">Car Images:</p>
                            <div className="space-y-2">
                              {imageUrls.map((url, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                                >
                                  <span className="truncate flex-1">{url}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeImageUrl(index)}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* URL Field */}
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter car listing URL"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes Field */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional notes..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || isLoading}
                  onClick={() => router.push(`/car-stock/${carStock.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || isLoading}>
                  {submitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
