"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";
import { CompanyWithJobs } from "@/types/job-company";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";
import Fuse from "fuse.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CustomDatePicker } from "@/components/custom-date-picker";

export default function Home() {
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
        null
    );
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [selectedCompany, setSelectedCompany] = useState<CompanyWithJobs>();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCompanies, setFilteredCompanies] = useState<
        CompanyWithJobs[]
    >([]);
    const [companies, setCompanies] = useState<CompanyWithJobs[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [fetchFilename, setFetchFilename] = useState("");
    const [fetchedUrl, setFetchedUrl] = useState("");
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        setSelectedCompany(companies.find((c) => c.id === selectedCompanyId));
    }, [selectedCompanyId]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch("/api/company?jobs=true");
            if (!response.ok) throw new Error("Failed to fetch companies");
            const data = await response.json();
            setCompanies(data.data);
        } catch (error) {
            console.error("Error fetching companies: ", error);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.info("Please select a file to upload");
            return;
        }

        if (file.name.includes("&")) {
            toast.error("The & symbol is not allowed :(");
            return;
        }

        setIsUploading(true);

        if (!selectedCompany) return;

        try {
            const formData = new FormData();
            formData.append("fileName", file.name);
            formData.append("fileType", file.type);
            formData.append(
                "company",
                JSON.stringify({
                    companyName: selectedCompany.name,
                    companyId: selectedCompany.id,
                })
            );
            formData.append("category", "Certificate of Insurance");
            formData.append("uploadDate", new Date().toISOString());
            formData.append("expirationDate", expiryDate);

            if (selectedJobId) {
                formData.append("jobId", selectedJobId.toString());
            } else {
                toast.error("Job selection is required for this file category");
                setIsUploading(false);
                return;
            }

            const response = await fetch("/api/generate-upload", {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                toast.error("Upload failed");
                throw new Error("Upload failed");
            }

            const { data } = await response.json();

            console.log("url: ", data);

            const fileUpload = await fetch(data, {
                method: "PUT",
                body: file,
            });

            console.log(fileUpload);

            formData.append("fileSize", file.size.toString());

            const databaseResponse = await fetch("/api/company-files", {
                method: "PUT",
                body: formData,
            });

            if (!databaseResponse.ok) {
                throw new Error("Upload failed");
            }

            const d = await databaseResponse.json();
            console.log("Upload successful: ", d);
            handleFetch(d.key);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error("Upload Error: ", error);
            toast.error("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFetch = useCallback(
        async (inputFilename?: string) => {
            const filenameToFetch = inputFilename || fetchFilename;

            if (!filenameToFetch) {
                toast.info("Please enter a filename to fetch");
                return;
            }

            setFetchedUrl("");

            if (!selectedCompany) return;

            console.log(filenameToFetch.split("/")[1]);

            try {
                const response = await fetch(
                    `/api/files?folder=${selectedCompany.name}&filename=${
                        filenameToFetch.split("/")[1]
                    }`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404) {
                        toast.error("File not found");
                        throw new Error("File not found");
                    }
                    throw new Error(errorData.message || "Fetch failed");
                }

                const data = await response.json();
                setFetchedUrl(data.url);
                console.log(
                    `Fetched URL for ${filenameToFetch}. URL expires in 2 hours.`
                );

                toast.success(
                    "File fetched successfully. URL is valid for 2 hours."
                );
            } catch (error) {
                console.error("Fetch Error: ", error);
                if (error instanceof Error) {
                    toast.error(error.message);
                }
            }
        },
        [fetchFilename, selectedCompany]
    );

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setExpiryDate(date.toISOString());
        } else {
            setExpiryDate("");
        }
    };

    const fuse = useMemo(
        () =>
            new Fuse(companies, {
                keys: ["name"],
                threshold: 0.3,
                findAllMatches: true,
                useExtendedSearch: true,
            }),
        [companies]
    );

    useEffect(() => {
        if (searchTerm) {
            const fuzzyResults = fuse.search(searchTerm);
            setFilteredCompanies(fuzzyResults.map((result) => result.item));
        } else {
            setFilteredCompanies(companies);
        }
    }, [searchTerm, companies, fuse]);

    return (
        <main className="flex flex-col items-center justify-center space-y-6 p-6">
            <Toaster richColors theme={theme == "light" ? "light" : "dark"} />
            <h1 className="text-2xl font-bold mb-4">Upload Insurance Docs</h1>

            <div className="w-[300px] space-y-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[300px] justify-between"
                        >
                            {selectedCompanyId
                                ? companies.find(
                                      (company) =>
                                          company.id === selectedCompanyId
                                  )?.name
                                : "Select Companies ..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput
                                placeholder="Search companies..."
                                onValueChange={setSearchTerm}
                            />
                            <CommandList>
                                <CommandEmpty>No Companies Found</CommandEmpty>
                                <CommandGroup>
                                    {filteredCompanies.map((company) => (
                                        <CommandItem
                                            key={company.id}
                                            value={company.name}
                                            onSelect={() => {
                                                setSelectedCompanyId(
                                                    company.id ===
                                                        selectedCompanyId
                                                        ? null
                                                        : company.id
                                                );
                                                setSearchTerm("");
                                                setOpen(false);
                                            }}
                                        >
                                            <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCompanyId ===
                                                        company.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {company.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {selectedCompany ? (
                    <Select
                        onValueChange={setSelectedJobId}
                        value={selectedJobId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a job to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedCompany?.jobs.map((job) => {
                                if (job.active)
                                    return (
                                        <SelectItem
                                            key={job.id}
                                            value={job.id.toString()}
                                        >
                                            {job.name}
                                        </SelectItem>
                                    );
                            })}
                        </SelectContent>
                    </Select>
                ) : null}
                {selectedJobId ? (
                    <Input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                ) : null}
                {file ? (
                    <CustomDatePicker
                        date={expiryDate}
                        setDate={(newDate) => {
                            setExpiryDate(newDate || "");
                            // Any additional logic you need when the date changes
                        }}
                    />
                ) : null}
                {expiryDate ? (
                    <Button
                        variant="default"
                        onClick={handleUpload}
                        disabled={isUploading || !file}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Upload File"
                        )}
                    </Button>
                ) : null}
                {fetchedUrl ? (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            console.log(`Opening fetched URL: ${fetchedUrl}`);
                            window.open(fetchedUrl, "_blank");
                        }}
                        className="w-full"
                    >
                        Open Uploaded File (Valid for 2 hours)
                    </Button>
                ) : null}
            </div>
            {/* {selectedCompany?.name}
            {selectedCompany?.jobs.map(
                (job) => job.active && <p key={job.id}>{job.name}</p>
            // )} */}
        </main>
    );
}
