"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Check, AlertCircle, Loader2 } from "lucide-react";
import { useCreateLead } from "@/hooks/use-leads";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateLeadSchema } from "@/lib/validation/lead-schema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type CSVLeadData = {
  name: string;
  email?: string;
  phone?: string;
};

type ProcessingStatus = "idle" | "processing" | "success" | "error";

export function CSVLeadUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVLeadData[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createLead } = useCreateLead();

  const user = useCurrentUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setError("Please upload a CSV file");
      setFile(null);
      setPreviewData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        // Basic CSV parsing that handles quoted values
        const parseCsvLine = (line: string) => {
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = "";

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
              continue;
            }

            if (char === "," && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = "";
              continue;
            }

            currentValue += char;
          }

          // Don't forget to add the last value
          values.push(currentValue.trim());

          return values;
        };

        // Split by common newline characters and filter empty lines
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length === 0) {
          setError("CSV file is empty");
          setPreviewData([]);
          return;
        }

        const headers = parseCsvLine(lines[0]).map((header) =>
          header.trim().toLowerCase()
        );

        const nameIndex = headers.findIndex((h) => h === "name");
        const emailIndex = headers.findIndex((h) => h === "email");
        const phoneIndex = headers.findIndex((h) => h === "phone");

        if (nameIndex === -1) {
          setError("CSV must include a 'name' column");
          setPreviewData([]);
          return;
        }

        const parsedData = lines
          .slice(1)
          .map((line) => {
            // Skip empty lines
            if (!line.trim()) return null;

            const values = parseCsvLine(line);

            // Skip if no name value
            if (!values[nameIndex] || !values[nameIndex].trim()) return null;

            const data: CSVLeadData = {
              name: values[nameIndex] || "",
            };

            if (emailIndex !== -1 && values[emailIndex])
              data.email = values[emailIndex];
            if (phoneIndex !== -1 && values[phoneIndex])
              data.phone = values[phoneIndex];

            return data;
          })
          .filter((lead): lead is CSVLeadData => lead !== null);

        // Preview first 5 records
        setPreviewData(parsedData.slice(0, 5));

        if (parsedData.length === 0) {
          setError("No valid leads found in CSV");
        }
      } catch (err) {
        console.error("Error parsing CSV:", err);
        setError("Error parsing CSV file. Please check the format.");
        setPreviewData([]);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("processing");
      setProgress({ current: 0, total: 0 });

      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target?.result as string;

        // Use the same CSV parsing logic as in parseCSV
        const parseCsvLine = (line: string) => {
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = "";

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
              continue;
            }

            if (char === "," && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = "";
              continue;
            }

            currentValue += char;
          }

          // Don't forget to add the last value
          values.push(currentValue.trim());

          return values;
        };

        // Split by common newline characters and filter empty lines
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }

        const headers = parseCsvLine(lines[0]).map((header) =>
          header.trim().toLowerCase()
        );

        const nameIndex = headers.findIndex((h) => h === "name");
        const emailIndex = headers.findIndex((h) => h === "email");
        const phoneIndex = headers.findIndex((h) => h === "phone");

        if (nameIndex === -1) {
          throw new Error("CSV must include a 'name' column");
        }

        const leadsData = lines
          .slice(1)
          .map((line) => {
            // Skip empty lines
            if (!line.trim()) return null;

            const values = parseCsvLine(line);

            // Skip if no name value
            if (!values[nameIndex] || !values[nameIndex].trim()) return null;

            if (!user?.id) {
              throw new Error("You must be logged in to upload leads.");
            }

            const leadData: CreateLeadSchema = {
              name: values[nameIndex],
              status: "new_lead",
              priority: 3,
            };

            if (emailIndex !== -1 && values[emailIndex]) {
              leadData.email = values[emailIndex];
            }

            if (phoneIndex !== -1 && values[phoneIndex]) {
              leadData.phone = values[phoneIndex];
            }

            return leadData;
          })
          .filter((lead): lead is CreateLeadSchema => lead !== null);

        setProgress({ current: 0, total: leadsData.length });

        let successCount = 0;
        let failCount = 0;

        // Process leads sequentially to avoid overwhelming the server
        for (let i = 0; i < leadsData.length; i++) {
          try {
            // Check if lead has all required fields before creating
            if (!leadsData[i].name || leadsData[i].name.trim() === "") {
              console.warn(`Skipping lead at index ${i}: Missing name`);
              failCount++;
              continue;
            }

            // Attempt to create the lead - no individual toast here
            await createLead(leadsData[i]);
            successCount++;
          } catch (error) {
            console.error(`Error creating lead ${i}:`, error);
            failCount++;

            // Don't overwhelm the server with failed requests
            if (failCount > 5) {
              toast.error("Too many errors. Stopping import.");
              break;
            }
          }

          setProgress({ current: i + 1, total: leadsData.length });
        }

        setStatus("success");

        // Single summary toast at the end
        toast.success(`Successfully created ${successCount} leads`);

        if (failCount > 0) {
          toast.error(`Failed to create ${failCount} leads`);
        }

        // Redirect after a short delay to let the user see the success message
        setTimeout(() => {
          router.push("/leads");
        }, 1500);
      };

      reader.onerror = () => {
        throw new Error("Error reading file");
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing CSV:", error);
      setStatus("error");
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setStatus("idle");
    setError(null);
    setProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload a CSV file with lead information. The file must have a column
          named &quot;name&quot;. Optional columns: &quot;email&quot;,
          &quot;phone&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload */}
          <div className="flex flex-col items-center justify-center gap-4">
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className={`cursor-pointer ${error ? "border-destructive" : ""}`}
              disabled={status === "processing"}
            />

            {error && (
              <div className="flex w-full items-center gap-2 text-destructive">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* File Info */}
          {file && (
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2">
                <File className="size-5 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {formatFileSize(file.size)}
                </Badge>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                Preview (first 5 records):
              </h4>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Email</th>
                      <th className="p-2 text-left font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((lead, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-2">{lead.name}</td>
                        <td className="p-2">{lead.email || "-"}</td>
                        <td className="p-2">{lead.phone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {status === "processing" && progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing leads...</span>
                <span>
                  {progress.current} of {progress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Status Indicators */}
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="size-5" />
              <span>Upload complete! Redirecting to leads list...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <span>Error uploading leads. Please try again.</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={resetForm}
          disabled={status === "processing"}
        >
          Clear
        </Button>
        <Button
          onClick={handleUpload}
          disabled={
            !file || previewData.length === 0 || status === "processing"
          }
        >
          {status === "processing" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Upload and Create Leads
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
