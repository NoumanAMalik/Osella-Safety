"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { Employee, EmployeeWithCompany } from "@/types/employee";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
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
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [employeesToDisplay, setEmployeesToDisplay] = useState<
        EmployeeWithCompany[]
    >([]);
    const [employees, setEmployees] = useState<EmployeeWithCompany[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setSearchBar(searchParams.get("search") || "");
        setSelectedCompanyId(searchParams.get("companyId") || "");
    }, []);

    useEffect(() => {
        fetchEmployees();
        fetchCompanies();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchBar(e.target.value);
    };

    const handleCompanyChange = (value: string) => {
        setSelectedCompanyId(value);
    };

    const handleReset = () => {
        setSearchBar("");
        setSelectedCompanyId("");
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/employee");
            if (!response.ok) throw new Error("Failed to fetch employees");
            const data = await response.json();
            setEmployees(data.data);
        } catch (error) {
            console.error("Error fetching employees: ", error);
        }
    };

    const fetchCompanies = async () => {
        setIsLoadingCompanies(true);
        try {
            const response = await fetch("/api/company");
            if (!response.ok) throw new Error("Failed to fetch companies");
            const data = await response.json();
            setCompanies(data.data);
        } catch (error) {
            console.error("Error fetching companies: ", error);
        } finally {
            setIsLoadingCompanies(false);
        }
    };

    const fuse = useMemo(
        () =>
            new Fuse(employees, {
                keys: ["name"],
                threshold: 0.3,
                findAllMatches: true,
                useExtendedSearch: true,
            }),
        [employees]
    );

    useEffect(() => {
        const newParams = new URLSearchParams();
        if (searchBar) newParams.set("search", searchBar);
        if (selectedCompanyId) newParams.set("companyId", selectedCompanyId);
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        router.push(newUrl);

        let filteredEmployees = employees;

        if (searchBar) {
            const fuzzyResults = fuse.search(searchBar);
            filteredEmployees = fuzzyResults.map((result) => result.item);
        }

        if (selectedCompanyId) {
            filteredEmployees = filteredEmployees.filter(
                (employee) => employee.companyId === parseInt(selectedCompanyId)
            );
        }

        setEmployeesToDisplay(filteredEmployees);
    }, [searchBar, selectedCompanyId, employees, fuse, router]);

    return (
        <main className="flex flex-grow flex-col items-center h-[calc(100vh-120px)] overflow-hidden">
            <div className="w-full px-4 py-4 flex flex-col items-center h-full">
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Employees
                </h2>
                <p>
                    This is where you can search and select all subcontractor
                    employees
                </p>
                <div className="w-full flex flex-col justify-between items-center my-4">
                    <div className="flex flex-row items-center gap-4 w-fit">
                        <Input
                            id="segment"
                            type="text"
                            className=""
                            placeholder="Enter Employee Name"
                            value={searchBar}
                            onChange={handleSearchChange}
                        />
                        {isLoadingCompanies ? (
                            <div>Loading companies...</div>
                        ) : (
                            <Select
                                onValueChange={handleCompanyChange}
                                value={selectedCompanyId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a company to filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem
                                            key={company.id}
                                            value={company.id.toString()}
                                        >
                                            {company.name}
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
                            {employeesToDisplay.map(
                                (employee: EmployeeWithCompany) => (
                                    <Card
                                        key={employee.id}
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
                                                    {employee.name}
                                                </h3>
                                                <Button
                                                    asChild
                                                    variant={"default"}
                                                    className={
                                                        isDarkMode
                                                            ? "hover:bg-gray-600"
                                                            : ""
                                                    }
                                                >
                                                    <Link
                                                        href={`/employee/${employee.id}`}
                                                    >
                                                        Documents
                                                    </Link>
                                                </Button>
                                            </div>
                                            {employee.companyName && (
                                                <div className="p-4 flex flex-wrap gap-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-sm ${
                                                            isDarkMode
                                                                ? "bg-blue-900 text-blue-100"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {employee.companyName}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </main>
    );
}
