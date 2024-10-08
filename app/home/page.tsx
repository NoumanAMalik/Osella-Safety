"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { CompanyFile } from "@/types/company-file";
import { Button } from "@/components/ui/button";
import { daysLeft, formatDate } from "@/lib/utils";
import { ExpiryDataTable } from "@/components/table/expiring/data-table";
import { expiryColumns } from "@/components/table/expiring/columns";
import { companyFileTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { ExpiredDataTable } from "@/components/table/expired/data-table";
import { expiredColumns } from "@/components/table/expired/columns";
import { EmployeeExpiryDataTable } from "@/components/table/employee-expiring/data-table";
import { employeeExpiryColumns } from "@/components/table/employee-expiring/columns";
import { EmployeeFileWithEmployee } from "@/types/employee-file";
import { EmployeeExpiredDataTable } from "@/components/table/employee-expired/data-table";
import { employeeExpiredColumns } from "@/components/table/employee-expired/columns";

export default function Home() {
    const [expiringFiles, setExpiringFiles] = useState<CompanyFile[]>([]);
    const [expiredFiles, setExpiredFiles] = useState<CompanyFile[]>([]);
    const [expiringEmployeeFiles, setExpiringEmployeeFiles] = useState<
        EmployeeFileWithEmployee[]
    >([]);
    const [expiredEmployeeFiles, setExpiredEmployeeFiles] = useState<
        EmployeeFileWithEmployee[]
    >([]);
    const [fileCount, setFileCount] = useState<number>(0);

    const fetchExpiringFiles = async () => {
        try {
            const response = await fetch(
                `/api/company-files?expiring=true&showAll=false`
            );

            if (!response.ok) throw new Error("Failed to fetch files");

            const data = await response.json();

            console.log("Files: ", data);

            setExpiringFiles(data.data);
        } catch (error) {
            console.error("Error fetching files: ", error);
        }
    };

    const fetchExpiredFiles = async () => {
        try {
            const response = await fetch("/api/company-files?showExpired=true");

            if (!response.ok) throw new Error("Failed to fetch files");

            const data = await response.json();

            console.log("Expired files: ", data);

            setExpiredFiles(data.data);
        } catch (error) {
            console.error("Error fetching files: ", error);
        }
    };

    const fetchExpiringEmployeeFiles = async () => {
        try {
            const response = await fetch(
                `/api/employee-files?expiring=true&withEmployee=true`
            );

            if (!response.ok) throw new Error("Failed to fetch files");

            const data = await response.json();

            console.log("Employee Files: ", data);

            setExpiringEmployeeFiles(data.data);
        } catch (error) {
            console.error("Error fetching files: ", error);
        }
    };

    const fetchExpiredEmployeeFiles = async () => {
        try {
            const response = await fetch(
                `/api/employee-files?showExpired=true&withEmployee=true`
            );

            if (!response.ok) throw new Error("Failed to fetch files");

            const data = await response.json();

            console.log("Employee Files: ", data);

            setExpiredEmployeeFiles(data.data);
        } catch (error) {
            console.error("Error fetching files: ", error);
        }
    };

    useEffect(() => {
        fetchExpiringFiles();
        fetchExpiredFiles();
        fetchExpiringEmployeeFiles();
        fetchExpiredEmployeeFiles();
    }, []);

    return (
        <main className="flex flex-col items-center justify-center w-full">
            <div className="bg-white w-fit">
                {/* <Image
                    src="/logo4.png"
                    alt="Terra Strada"
                    width="400"
                    height="300"
                /> */}
            </div>
            <h1 className="text-2xl font-bold mb-4">SUBCONTRACTOR DB</h1>
            <Separator />

            <div className="w-[64rem]">
                <h2 className="text-xl font-semibold my-4">
                    Expiring Documents
                </h2>
                <ExpiryDataTable columns={expiryColumns} data={expiringFiles} />
            </div>

            <div className="w-[64rem]">
                <h2 className="text-xl font-semibold my-4">
                    Expired Documents
                </h2>
                <ExpiredDataTable
                    columns={expiredColumns}
                    data={expiredFiles}
                />
            </div>

            <div className="w-[64rem]">
                <h2 className="text-xl font-semibold my-4">
                    Expiring Employee Documents
                </h2>
                <EmployeeExpiryDataTable
                    columns={employeeExpiryColumns}
                    data={expiringEmployeeFiles}
                />
            </div>
            <div className="w-[64rem]">
                <h2 className="text-xl font-semibold my-4">
                    Expired Employee Documents
                </h2>
                <EmployeeExpiredDataTable
                    columns={employeeExpiredColumns}
                    data={expiredEmployeeFiles}
                />
            </div>
            {/* {listFiles.length > 0 && (
                <div className="max-w-[2250px]">
                    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-4 font-bold mb-2 text-sm">
                        <div className="px-2">Id</div>
                        <div>Company</div>
                        <div>Type</div>
                        <div>Upload Date</div>
                        <div>Expiry Date</div>
                        <div>Days Left</div>
                    </div>
                    {listFiles.map((file) => (
                        <div
                            key={file.id}
                            className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-4 items-center py-2 border-b"
                        >
                            <div className="px-2 text-sm">{file.id}</div>
                            <div className="truncate">
                                {file.fileKey.split("/")[0]}
                            </div>
                            <div className="truncate">{file.fileCategory}</div>
                            <div className="truncate">
                                {formatDate(file.uploadDate)}
                            </div>
                            <div
                                className={`truncate ${
                                    daysLeft(file.expirationDate) < 31 &&
                                    "text-red-500"
                                }`}
                            >
                                {formatDate(file.expirationDate, false)}
                            </div>
                            <div>{daysLeft(file.expirationDate)}</div>
                            
                        </div>
                    ))}
                </div>
            )} */}
        </main>
    );
}
