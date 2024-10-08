"use client";

import React, {
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ExternalLink, Loader2, XSquareIcon } from "lucide-react";
import { Company } from "@/types/company";
import { format, parseISO } from "date-fns";
import { CompanyFile } from "@/types/company-file";
import { JobCompanyRelationship, JobWithCompanies } from "@/types/job-company";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";
import { Job } from "@/types/job";
import { uploadFile } from "@/app/actions/uploadFile";
import { getPresignedUrlWithKey } from "@/app/actions/getPresignedUrlWithKey";
import {
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
} from "@aws-sdk/client-s3";
import { sql } from "drizzle-orm";
import { companyFileTable } from "@/db/schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Employee } from "@/types/employee";
import { CustomDatePicker } from "@/components/custom-date-picker";

export default function Page({ params }: { params: { id: string } }) {
    const [file, setFile] = useState<File | null>(null);
    const [fetchFilename, setFetchFilename] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchedUrl, setFetchedUrl] = useState("");
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [fileCategory, setFileCategory] = useState<string>("");
    const [listFiles, setListFiles] = useState<CompanyFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expiryDate, setExpiryDate] = useState<string>("");
    // const [companyJobs, setCompanyJobs] = useState<JobCompanyRelationship[]>(
    //     []
    // );
    // const [selectedFileJob, setSelectedFileJob] = useState<string>("");
    // const [state, formAction] = useActionState(uploadFile, listFiles);
    // const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    // const [newJobId, setNewJobId] = useState<string>("");
    // const [allJobs, setAllJobs] = useState<Job[]>([]);
    // const [selectedJobId, setSelectedJobId] = useState<string>("");
    // const [isLoadingAllJobs, setIsLoadingAllJobs] = useState(true);
    const [categories, setCategories] = useState<string[]>([
        "WHIMIS 2015",
        "Worker HS 4 Steps",
        "Supervisor HS 5 Steps",
        "Employer Provided Training",
        "Standard First Aid",
        "Union Card",
        "Working From Heights",
    ]);
    const { theme } = useTheme();
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const employeeId = params.id;

    useEffect(() => {
        setCategories((prev) =>
            prev.sort((a, b) => {
                return a.localeCompare(b);
            })
        );
    }, []);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await fetch(`/api/employee?id=${employeeId}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    setEmployee(data.data[0]);
                } else {
                    throw new Error("Employee not found");
                }
            } catch (error) {
                console.error("Error fetchign employee: ", error);
                toast.error("Failed to fetch employee details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployee();
    }, [employeeId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch(
                `/api/employee-files?employeeId=${employeeId}`
            );

            if (!response.ok) throw new Error("Failed to fetch employee files");

            const data = await response.json();

            console.log("Files: ", data);

            setListFiles(data.data);
        } catch (error) {
            console.error("Error fetching employee files: ", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

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

        if (!employee) return;

        try {
            const formData = new FormData();
            formData.append("fileName", file.name);
            formData.append("fileType", file.type);
            formData.append(
                "employee",
                JSON.stringify({
                    employeeName: employee.name,
                    employeeId: employee.id,
                })
            );
            formData.append("category", fileCategory);
            formData.append("uploadDate", new Date().toISOString());
            formData.append("expirationDate", expiryDate);

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

            console.log("presuccess");

            // const fileUpload = await axios.put(data, file);

            const fileUpload = await fetch(data, {
                method: "PUT",
                body: file,
                headers: {
                    "x-amz-acl": "public-read",
                },
            });

            console.log("success");

            console.log(fileUpload);

            formData.append("fileSize", file.size.toString());

            const databaseResponse = await fetch("/api/employee-files", {
                method: "PUT",
                body: formData,
            });

            if (!databaseResponse.ok) {
                throw new Error("Upload failed");
            }

            const d = await databaseResponse.json();
            console.log("Upload successful: ", d);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast.success("File uploaded successfully");
            fetchFiles();
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

            setIsFetching(true);
            setFetchedUrl("");

            if (!employee) return;

            try {
                const response = await fetch(
                    `/api/files?folder=${employee.id}-${employee.name}&filename=${filenameToFetch}`
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
                // ... (rest of the error handling remains the same)

                toast.success(
                    "File fetched successfully. URL is valid for 2 hours."
                );
            } catch (error) {
                console.error("Fetch Error: ", error);
                if (error instanceof Error) {
                    toast.error(error.message);
                }
                // ... (rest of the error handling remains the same)
            } finally {
                setIsFetching(false);
            }
        },
        [fetchFilename, employee]
    );

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setExpiryDate(date.toISOString());
        } else {
            setExpiryDate("");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!employee) {
        return <div>Company not found</div>;
    }

    return (
        <main className="flex flex-col items-center justify-center space-y-6 p-6">
            <Toaster richColors theme={theme == "light" ? "light" : "dark"} />
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <div className="flex flex-row items-center justify-center gap-4">
                <h2 className="text-xl font-bold">
                    Employer: {employee.companyName}
                </h2>
                <Button
                    onClick={() => {
                        router.push(`/company/${employee.companyId}`);
                    }}
                    variant="outline"
                    size="icon"
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-row justify-center gap-28 ">
                <div className="w-80 space-y-4">
                    <h2 className="text-xl font-semibold my-4">Docs</h2>
                    <Select
                        onValueChange={(value) => {
                            setFileCategory(value);
                        }}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a File Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category, index) => (
                                <SelectItem key={index} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    <CustomDatePicker
                        date={expiryDate}
                        setDate={(newDate) => {
                            setExpiryDate(newDate || "");
                            // Any additional logic you need when the date changes
                        }}
                    />
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
                </div>
            </div>

            {fetchedUrl && (
                <Button
                    variant="link"
                    onClick={() => {
                        console.log(`Opening fetched URL: ${fetchedUrl}`);
                        window.open(fetchedUrl, "_blank");
                    }}
                    className="w-full"
                >
                    Open Fetched File (Valid for 2 hours)
                </Button>
            )}

            <h2 className="text-xl font-semibold my-4">Docs</h2>
            {listFiles.length > 0 && (
                <div className="max-w-[2250px]">
                    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 font-bold mb-2 text-sm">
                        <div className="px-2">Id</div>
                        <div>Type</div>
                        <div>Name</div>
                        <div>Upload Date</div>
                        <div>Expiry Date</div>
                        <div>Action</div>
                    </div>
                    {listFiles.map((file) => (
                        <div
                            key={file.id}
                            className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 items-center py-2 border-b"
                        >
                            <div className="px-2 text-sm">{file.id}</div>
                            <div className="truncate">{file.fileCategory}</div>
                            <div className="truncate">{file.filename}</div>
                            <div className="truncate">
                                {formatDate(file.uploadDate)}
                            </div>
                            <div className="truncate">
                                {formatDate(file.expirationDate, false)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFetchFilename(
                                        `${file.id}-${file.fileCategory}-${file.filename}`
                                    );
                                    handleFetch(
                                        `${file.id}-${file.fileCategory}-${file.filename}`
                                    );
                                }}
                            >
                                Fetch
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
