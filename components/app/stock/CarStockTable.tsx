"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Car,
  MoreHorizontal,
  Calendar,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { FilterCarStockSchema } from "@/lib/validation/car-stock-schema";

type CarStockItemType = {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string | null;
  price: string | null;
  imageUrl: string[] | null; // Changed to array
  url: string | null;
  notes: string | null;
  embedding: number[] | null;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CarStockTableProps {
  carStockItems: CarStockItemType[];
  isLoading: boolean;
  currentFilters: Partial<FilterCarStockSchema>;
  updateFilters: (filters: Partial<FilterCarStockSchema>) => void;
}

export function CarStockTable({
  carStockItems,
  isLoading,
  currentFilters,
  updateFilters,
}: CarStockTableProps) {
  const getCarTypeColor = (type: string) => {
    switch (type) {
      case "sedan":
        return "bg-blue-100 text-blue-800";
      case "suv":
        return "bg-green-100 text-green-800";
      case "hatchback":
        return "bg-emerald-100 text-emerald-800";
      case "coupe":
        return "bg-purple-100 text-purple-800";
      case "convertible":
        return "bg-amber-100 text-amber-800";
      case "wagon":
        return "bg-orange-100 text-orange-800";
      case "minivan":
        return "bg-red-100 text-red-800";
      case "pickup":
        return "bg-indigo-100 text-indigo-800";
      case "electric":
        return "bg-teal-100 text-teal-800";
      case "hybrid":
        return "bg-lime-100 text-lime-800";
      case "luxury":
        return "bg-rose-100 text-rose-800";
      case "sports":
        return "bg-pink-100 text-pink-800";
      case "other":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCarType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleSort = (column: "name" | "type" | "price" | "createdAt") => {
    const direction =
      currentFilters.sortBy === column && currentFilters.sortDirection === "asc"
        ? "desc"
        : "asc";
    updateFilters({ sortBy: column, sortDirection: direction });
  };

  const SortIndicator = ({ column }: { column: string }) =>
    currentFilters.sortBy === column ? (
      <span className="ml-1 inline-block w-3">
        {currentFilters.sortDirection === "asc" ? "↑" : "↓"}
      </span>
    ) : null;

  // Get a preview of car description (first 100 characters)
  const getDescriptionPreview = (description: string | null) => {
    if (!description) return "No description available";
    const maxLength = 80;
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  // Format price for display
  const formatPrice = (price: string | null) => {
    if (!price) return "Price not specified";
    return price;
  };

  if (carStockItems.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No car stock items found</h3>
        <p className="text-muted-foreground">
          {isLoading
            ? "Loading car stock items..."
            : "Try adjusting your filters or add a new car to get started."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/car-stock/new">Add Your First Car</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12"></TableHead> {/* For image */}
            <TableHead
              onClick={() => handleSort("name")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Name <SortIndicator column="name" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("type")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Type <SortIndicator column="type" />
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead
              onClick={() => handleSort("price")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Price <SortIndicator column="price" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("createdAt")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Added <SortIndicator column="createdAt" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carStockItems.map((car) => (
            <TableRow
              key={car.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell>
                {car.imageUrl && car.imageUrl.length > 0 ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden">
                    <Image
                      src={car.imageUrl[0]} // Show the first image as thumbnail
                      alt={car.name}
                      fill
                      className="object-cover"
                    />
                    {car.imageUrl.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl-md flex items-center">
                        <ImageIcon className="h-3 w-3 mr-0.5" />
                        {car.imageUrl.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                    <Car className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Link
                  href={`/car-stock/${car.id}`}
                  className="font-medium hover:underline flex items-center gap-2"
                >
                  {car.name}
                </Link>
                {car.url && (
                  <a
                    href={car.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground flex items-center gap-1 mt-1 hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> View listing
                  </a>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getCarTypeColor(car.type)} border-none font-normal`}
                >
                  {formatCarType(car.type)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {getDescriptionPreview(car.description)}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{formatPrice(car.price)}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(car.createdAt), "PPP")}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/car-stock/${car.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/car-stock/${car.id}/edit`}>Edit Car</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
