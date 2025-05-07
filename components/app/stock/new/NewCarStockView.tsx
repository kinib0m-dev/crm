"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateCarStockSchema,
  createCarStockSchema,
} from "@/lib/validation/car-stock-schema";
import { useCreateCarStock } from "@/hooks/use-car-stock";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import Link from "next/link";

function formatCarType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function NewCarStockView() {
  const router = useRouter();
  const { createCarStock, isLoading } = useCreateCarStock();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const form = useForm<CreateCarStockSchema>({
    resolver: zodResolver(createCarStockSchema),
    defaultValues: {
      name: "",
      type: "sedan",
      description: "",
      price: "",
      imageUrls: [],
      url: "",
      notes: "",
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

  const onSubmit = async (data: CreateCarStockSchema) => {
    try {
      setSubmitting(true);
      await createCarStock(data);
      router.push("/car-stock");
    } catch (error) {
      console.error("Error creating car stock item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/car-stock">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to car stock</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Add New Car</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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

                  {/* Car Type Field */}
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
                          <Input placeholder="Enter price" {...field} />
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
                              <p className="text-sm font-medium">
                                Added Images:
                              </p>
                              <div className="space-y-2">
                                {imageUrls.map((url, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                                  >
                                    <span className="truncate flex-1">
                                      {url}
                                    </span>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full"
                >
                  {submitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Add Car"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
