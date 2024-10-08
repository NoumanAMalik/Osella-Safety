"use client";

import React, {
    Suspense,
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, XSquareIcon } from "lucide-react";
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
import { Employee, InsertEmployee } from "@/types/employee";
import { EmployeeInputForm } from "@/components/forms/employee-input-form";
import { EmployeeDataTable } from "@/components/table/employee/data-table";
import { employeeColumns } from "@/components/table/employee/columns";
import { CustomDatePicker } from "@/components/custom-date-picker";

export default function Page({ params }: { params: { id: string } }) {
    const [file, setFile] = useState<File | null>(null);
    const [fetchFilename, setFetchFilename] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchedUrl, setFetchedUrl] = useState("");
    const [company, setCompany] = useState<Company | null>(null);
    const [fileCategory, setFileCategory] = useState<string>("");
    const [listFiles, setListFiles] = useState<CompanyFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [companyJobs, setCompanyJobs] = useState<JobCompanyRelationship[]>(
        []
    );
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedFileJob, setSelectedFileJob] = useState<string>("");
    // const [state, formAction] = useActionState(uploadFile, listFiles);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [newJobId, setNewJobId] = useState<string>("");
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [isLoadingAllJobs, setIsLoadingAllJobs] = useState(true);
    const [categories, setCategories] = useState<string[]>([
        "Form 1000",
        "HS Policy",
        "HS Program Manual",
        "WSIB Clearance",
        "WSIB Premium Rate Statement",
        "WSIR Report",
        "Certificate of Insurance",
        "ISO Certificate",
        "COR Certificate",
    ]);
    const { theme } = useTheme();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const companyId = params.id;

    useEffect(() => {
        setCategories((prev) =>
            prev.sort((a, b) => {
                return a.localeCompare(b);
            })
        );
    }, []);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await fetch(`/api/company?id=${companyId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch company");
                }
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    setCompany(data.data[0]);
                } else {
                    throw new Error("Company not found");
                }
            } catch (error) {
                console.error("Error fetching company:", error);
                toast.error("Failed to fetch company details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch(
                `/api/company-files?companyId=${companyId}`
            );

            if (!response.ok) throw new Error("Failed to fetch company files");

            const data = await response.json();

            console.log("Files: ", data);

            setListFiles(data.data);
        } catch (error) {
            console.error("Error fetching sites: ", error);
        }
    };

    const fetchAllJobs = async () => {
        setIsLoadingAllJobs(true);
        try {
            const response = await fetch("/api/job");
            if (!response.ok) throw new Error("Failed to fetch jobs");
            const data = await response.json();
            setAllJobs(data.data);
        } catch (error) {
            console.error("Error fetching jobs: ", error);
            toast.error("Failed to fetch jobs");
        } finally {
            setIsLoadingAllJobs(false);
        }
    };

    const fetchCompanyJobs = async () => {
        setIsLoadingJobs(true);
        try {
            const response = await fetch(
                `/api/job-company?companyId=${companyId}`
            );
            if (!response.ok) throw new Error("Failed to fetch company jobs");
            const data = await response.json();
            console.log(data.data);
            setCompanyJobs(data.data);
        } catch (error) {
            console.error("Error fetching company jobs: ", error);
            toast.error("Failed to fetch company jobs");
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch(
                `/api/employee?companyId=${companyId}`
            );
            if (!response.ok)
                throw new Error("Failed to fetch company employees");
            const data = await response.json();
            console.log(data.data);
            setEmployees(data.data);
        } catch (error) {
            console.error("Error fetching company employees: ", error);
            toast.error("Failed to fetch company employees");
        }
    };

    const handleAddEmployee = async (newEmployee: InsertEmployee) => {
        try {
            const response = await fetch("/api/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newEmployee.name,
                    email: newEmployee.email,
                    phoneNumber: newEmployee.phoneNumber,
                    companyId: newEmployee.companyId,
                }),
            });

            if (!response.ok) throw new Error("Failed to add employee");

            await fetchEmployees();
        } catch (error) {
            console.error("Error adding employee: ", error);
        }
    };

    const handleUpdateEmployee = async (updatedEmployee: Employee) => {
        try {
            const response = await fetch("/api/employee", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEmployee),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Failed to update employee");
            }

            await fetchEmployees();
        } catch (error) {
            console.error("Error updating employee: ", error);
            toast.error("Error updating Employee");
        }
    };

    const addJobToCompany = async () => {
        if (!selectedJobId) {
            toast.info("Please select a job to add");
            return;
        }
        try {
            const response = await fetch("/api/job-company", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jobId: parseInt(selectedJobId),
                    companyId: parseInt(companyId),
                }),
            });
            if (!response.ok) throw new Error("Failed to add job to company");
            toast.success("Job added successfully");
            setSelectedJobId("");
            fetchCompanyJobs();
        } catch (error) {
            console.error("Error adding job to company: ", error);
            toast.error("Failed to add job to company");
        }
    };

    const softDeleteJob = async (id: number) => {
        try {
            const response = await fetch(`/api/job-company?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok)
                throw new Error("Failed to remove job from company");

            toast.success("Job removed successfully");

            fetchCompanyJobs();
        } catch (error) {
            console.error("Error removing job from company: ", error);
            toast.error("Failed to remove job from company");
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (company) {
            fetchCompanyJobs();
            fetchAllJobs();
        }
    }, [company]);

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

        if (!company) return;

        try {
            const formData = new FormData();
            formData.append("fileName", file.name);
            formData.append("fileType", file.type);
            formData.append(
                "company",
                JSON.stringify({
                    companyName: company.name,
                    companyId: company.id,
                })
            );
            formData.append("category", fileCategory);
            formData.append("uploadDate", new Date().toISOString());
            formData.append("expirationDate", expiryDate);

            if (
                fileCategory == "Form 1000" ||
                fileCategory == "Certificate of Insurance"
            ) {
                if (selectedFileJob) {
                    formData.append("jobId", selectedFileJob.toString());
                } else {
                    toast.error(
                        "Job selection is required for this file category"
                    );
                    setIsUploading(false);
                    return;
                }
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

            if (!company) return;

            try {
                const response = await fetch(
                    `/api/files?folder=${company.name}&filename=${filenameToFetch}`
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
        [fetchFilename, company]
    );

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setExpiryDate(date.toISOString());
        } else {
            setExpiryDate("");
        }
    };

    const getJobName = (jobId: number | null): string => {
        let jobName = "";

        if (!jobId) return jobName;

        companyJobs.map((job) => {
            if (job.jobId == jobId) {
                jobName = job.jobName;
            }
        });

        return jobName;
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!company) {
        return <div>Company not found</div>;
    }

    return (
        <main className="flex flex-col items-center justify-center space-y-6 p-6">
            <Toaster richColors theme={theme == "light" ? "light" : "dark"} />
            <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
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
                    {fileCategory == "Form 1000" ||
                    fileCategory == "Certificate of Insurance" ? (
                        <Select
                            onValueChange={setSelectedFileJob}
                            value={selectedFileJob}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a job to add" />
                            </SelectTrigger>
                            <SelectContent>
                                {companyJobs.map((job) => (
                                    <SelectItem
                                        key={job.jobId}
                                        value={job.jobId.toString()}
                                        // key={job.id}
                                        // value={job.id.toString()}
                                    >
                                        {job.jobName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : null}
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
                <div className="w-80">
                    <h2 className="text-xl font-semibold my-4">Jobs</h2>
                    <div className="max-w-[2250px] w-lg space-y-4 mb-4">
                        {isLoadingAllJobs ? (
                            <div>Loading jobs...</div>
                        ) : (
                            <Select
                                onValueChange={setSelectedJobId}
                                value={selectedJobId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a job to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allJobs.map((job) => (
                                        <SelectItem
                                            key={job.id}
                                            value={job.id.toString()}
                                        >
                                            {job.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button
                            variant="default"
                            onClick={addJobToCompany}
                            disabled={!selectedJobId}
                            className="w-full"
                        >
                            Add Job to Company
                        </Button>
                        {isLoadingJobs ? (
                            <div>Loading company jobs...</div>
                        ) : companyJobs.length > 0 ? (
                            <div className="max-w-[2250px]">
                                {companyJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex flex-row justify-between gap-4 items-center py-2 border-b"
                                    >
                                        <div className="truncate">
                                            {job.jobName}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // Add functionality to view job details or remove job from company
                                                console.log(job);
                                                softDeleteJob(job.id);
                                            }}
                                        >
                                            <XSquareIcon />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No jobs associated with this company.</div>
                        )}
                    </div>
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
                    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-4 font-bold mb-2 text-sm">
                        <div className="px-2">Id</div>
                        <div>Type</div>
                        <div>Job</div>
                        <div>Name</div>
                        <div>Upload Date</div>
                        <div>Expiry Date</div>
                        <div>Action</div>
                    </div>
                    {listFiles.map((file) => (
                        <div
                            key={file.id}
                            className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center py-2 border-b"
                        >
                            <div className="px-2 text-sm">{file.id}</div>
                            <div className="truncate">{file.fileCategory}</div>
                            <div className="truncate">
                                {getJobName(file.jobId)}
                            </div>
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
            <h2 className="text-xl font-semibold my-4">Employees</h2>

            <div className="w-full my-10 p-1 min-h-[700px]">
                <Suspense fallback={<div className="p-4">Loading...</div>}>
                    <EmployeeInputForm
                        companies={[company]}
                        // onAddContact={handleAddContact}
                        onAddEmployee={handleAddEmployee}
                    />
                    <EmployeeDataTable
                        columns={employeeColumns}
                        data={employees}
                        onUpdate={handleUpdateEmployee}
                        // onDelete={handleDeleteContact}
                    />
                </Suspense>
            </div>
        </main>
    );
}
