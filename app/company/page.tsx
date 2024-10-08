"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { CompanyWithJobs } from "@/types/job-company";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types/job";
import { useTheme } from "next-themes";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Home() {
    const router = useRouter();
    const [searchBar, setSearchBar] = useState<string>("");
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [fuzzyResult, setFuzzyResult] = useState<any>([]);
    const [companiesToDisplay, setCompaniesToDisplay] = useState<
        CompanyWithJobs[]
    >([]);
    const [companies, setCompanies] = useState<CompanyWithJobs[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [isLoadingAllJobs, setIsLoadingAllJobs] = useState(true);

    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setSearchBar(searchParams.get("search") || "");
        setSelectedJobId(searchParams.get("jobId") || "");
    }, []);

    useEffect(() => {
        fetchCompanies();
        fetchAllJobs();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchBar(e.target.value);
    };

    const handleJobChange = (value: string) => {
        setSelectedJobId(value);
    };

    const handleReset = () => {
        setSearchBar("");
        setSelectedJobId("");
    };

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

    const fetchAllJobs = async () => {
        setIsLoadingAllJobs(true);
        try {
            const response = await fetch("/api/job");
            if (!response.ok) throw new Error("Failed to fetch jobs");
            const data = await response.json();
            setAllJobs(data.data);
        } catch (error) {
            console.error("Error fetching jobs: ", error);
        } finally {
            setIsLoadingAllJobs(false);
        }
    };

    // const companiesToDisplay =
    //     fuzzyResult.length > 0
    //         ? fuzzyResult.map((result) => result.item)
    //         : companies;

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
        const newParams = new URLSearchParams();
        if (searchBar) newParams.set("search", searchBar);
        if (selectedJobId) newParams.set("jobId", selectedJobId);
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        router.push(newUrl);

        let filteredCompanies = companies;

        if (searchBar) {
            const fuzzyResults = fuse.search(searchBar);
            filteredCompanies = fuzzyResults.map((result) => result.item);
        }

        if (selectedJobId) {
            filteredCompanies = filteredCompanies.filter((company) =>
                company.jobs.some(
                    (job) =>
                        job.id === parseInt(selectedJobId) &&
                        job.active === true
                )
            );
        }

        setCompaniesToDisplay(filteredCompanies);
    }, [searchBar, selectedJobId, companies, fuse, router]);

    return (
        <main className="flex flex-grow flex-col items-center h-[calc(100vh-120px)] overflow-hidden">
            {/* // <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"> */}
            <div className="w-full px-4 py-4 flex flex-col items-center h-full">
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Subcontractors
                </h2>
                <p>
                    This is where you can search and select a subcontractor
                    company
                </p>
                <div className="w-full flex flex-col justify-between items-center my-4">
                    <div className="flex flex-row items-center gap-4 w-fit">
                        <Input
                            id="segment"
                            type="text"
                            className=""
                            placeholder="Enter Company Name"
                            value={searchBar}
                            onChange={handleSearchChange}
                        />
                        {isLoadingAllJobs ? (
                            <div>Loading jobs...</div>
                        ) : (
                            <Select
                                onValueChange={handleJobChange}
                                value={selectedJobId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a job to filter" />
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
                        <Button variant={"outline"} onClick={handleReset}>
                            <X className="h-4 w-4 mr-2" /> Reset
                        </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-240px)] w-full max-w-[600px] flex-grow rounded-md border mt-6">
                        <div className="p-4 space-y-4">
                            {companiesToDisplay.map(
                                (company: CompanyWithJobs) => (
                                    <Card
                                        key={company.id}
                                        className={`overflow-hidden ${
                                            isDarkMode
                                                ? "bg-gray-800"
                                                : "bg-white"
                                        }`}
                                    >
                                        <CardContent className="p-0">
                                            <div
                                                className={`flex justify-between items-center p-4 ${
                                                    isDarkMode
                                                        ? "bg-gray-700"
                                                        : "bg-gray-50"
                                                }`}
                                            >
                                                <h3
                                                    className={`text-lg font-semibold ${
                                                        isDarkMode
                                                            ? "text-white"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {company.name}
                                                </h3>
                                                <Button
                                                    asChild
                                                    variant="default"
                                                    className={
                                                        isDarkMode
                                                            ? "hover:bg-gray-600"
                                                            : ""
                                                    }
                                                >
                                                    <Link
                                                        href={`/company/${company.id}`}
                                                    >
                                                        Documents
                                                    </Link>
                                                </Button>
                                            </div>
                                            {company.jobs &&
                                                company.jobs.length > 0 && (
                                                    <div className="p-4 flex flex-wrap gap-2">
                                                        {company.jobs.map(
                                                            (job) =>
                                                                job.active && (
                                                                    <span
                                                                        key={
                                                                            job.id
                                                                        }
                                                                        className={`px-2 py-1 rounded-full text-sm ${
                                                                            isDarkMode
                                                                                ? "bg-blue-900 text-blue-100"
                                                                                : "bg-blue-100 text-blue-800"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            job.name
                                                                        }
                                                                    </span>
                                                                )
                                                        )}
                                                    </div>
                                                )}
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* //! Add container in this class after removing BOL Number */}
                {/* <div className="h-[calc(100vh-250px)] overflow-auto">
                    <div className="w-full mx-auto py-10 ">
                        <Suspense fallback={<div>Loading...</div>}>
                            {loading ? (
                                <div>Loading...</div>
                            ) : error ? (
                                <div>{error}</div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={deliveries}
                                    refreshData={handleRefresh}
                                    approvers={approvers}
                                    selectedApprover={selectedApprover}
                                    setSelectedApprover={setSelectedApprover}
                                />
                            )}
                        </Suspense>
                    </div>
                </div> */}
            </div>
        </main>
    );
}
