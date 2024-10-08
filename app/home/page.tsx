"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { daysLeft, formatDate } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export default function Home() {
    const [fileCount, setFileCount] = useState<number>(0);

    // const fetchExpiringFiles = async () => {
    //     try {
    //         const response = await fetch(
    //             `/api/company-files?expiring=true&showAll=false`
    //         );

    //         if (!response.ok) throw new Error("Failed to fetch files");

    //         const data = await response.json();

    //         console.log("Files: ", data);

    //         setExpiringFiles(data.data);
    //     } catch (error) {
    //         console.error("Error fetching files: ", error);
    //     }
    // };

    // const fetchExpiredFiles = async () => {
    //     try {
    //         const response = await fetch("/api/company-files?showExpired=true");

    //         if (!response.ok) throw new Error("Failed to fetch files");

    //         const data = await response.json();

    //         console.log("Expired files: ", data);

    //         setExpiredFiles(data.data);
    //     } catch (error) {
    //         console.error("Error fetching files: ", error);
    //     }
    // };

    // const fetchExpiringEmployeeFiles = async () => {
    //     try {
    //         const response = await fetch(
    //             `/api/employee-files?expiring=true&withEmployee=true`
    //         );

    //         if (!response.ok) throw new Error("Failed to fetch files");

    //         const data = await response.json();

    //         console.log("Employee Files: ", data);

    //         setExpiringEmployeeFiles(data.data);
    //     } catch (error) {
    //         console.error("Error fetching files: ", error);
    //     }
    // };

    // const fetchExpiredEmployeeFiles = async () => {
    //     try {
    //         const response = await fetch(
    //             `/api/employee-files?showExpired=true&withEmployee=true`
    //         );

    //         if (!response.ok) throw new Error("Failed to fetch files");

    //         const data = await response.json();

    //         console.log("Employee Files: ", data);

    //         setExpiredEmployeeFiles(data.data);
    //     } catch (error) {
    //         console.error("Error fetching files: ", error);
    //     }
    // };

    // useEffect(() => {
    //     fetchExpiringFiles();
    //     fetchExpiredFiles();
    //     fetchExpiringEmployeeFiles();
    //     fetchExpiredEmployeeFiles();
    // }, []);

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
            <h1 className="text-2xl font-bold mb-4">Osella Safety</h1>
            <Separator />

            {/* <div className="w-[64rem]">
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
            </div> */}
        </main>
    );
}
