import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/DigitalOcean";
import fs from "fs";
import {
    GetObjectCommand,
    PutObjectCommand,
    PutObjectCommandInput,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/db";
import { eq, desc, asc, sql, and, gte, lte } from "drizzle-orm";
import {
    companyFileTable,
    companyTable,
    employeeFileTable,
    employeeTable,
} from "@/db/schema";
import { CompanyFile } from "@/types/company-file";
import { EmployeeFile, EmployeeFileWithEmployee } from "@/types/employee-file";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get("employeeId");
    const expiring = searchParams.get("expiring");

    let showAllString = searchParams.get("showAll");
    let showAll = showAllString == "true" ? true : false;

    let showExpiredString = searchParams.get("showExpired");
    let showExpired = showExpiredString === "true";

    let withEmployeeString = searchParams.get("withEmployee");
    let withEmployee = withEmployeeString === "true";

    try {
        let query: any = db.select().from(employeeFileTable);

        if (withEmployee) {
            query = query
                .leftJoin(
                    employeeTable,
                    eq(employeeTable.id, employeeFileTable.employeeId)
                )
                .innerJoin(
                    companyTable,
                    eq(employeeTable.companyId, companyTable.id)
                );
        }

        if (employeeId) {
            query = query.where(
                eq(employeeFileTable.employeeId, parseInt(employeeId))
            );
        }

        let result = await query.all();

        let files: (EmployeeFile | EmployeeFileWithEmployee)[] = result.map(
            (row: any) => {
                if (employeeId) {
                    const file: EmployeeFile = {
                        id: row.id,
                        filename: row.filename,
                        originalFilename: row.originalFilename,
                        fileKey: row.fileKey,
                        fileType: row.fileType,
                        fileSize: row.fileSize,
                        uploadDate: row.uploadDate,
                        fileCategory: row.fileCategory,
                        expirationDate: row.expirationDate,
                        employeeId: row.employeeId,
                    };

                    return file;
                }

                const file: EmployeeFile = {
                    id: row.employee_file.id,
                    filename: row.employee_file.filename,
                    originalFilename: row.employee_file.originalFilename,
                    fileKey: row.employee_file.fileKey,
                    fileType: row.employee_file.fileType,
                    fileSize: row.employee_file.fileSize,
                    uploadDate: row.employee_file.uploadDate,
                    fileCategory: row.employee_file.fileCategory,
                    expirationDate: row.employee_file.expirationDate,
                    employeeId: row.employee_file.employeeId,
                };

                if (withEmployee && row.employee) {
                    return {
                        ...file,
                        employee: {
                            id: row.employee.id,
                            name: row.employee.name,
                            phoneNumber: row.employee.phoneNumber,
                            email: row.employee.email,
                            companyId: row.employee.companyId,
                            companyName: row.company.name,
                        },
                    };
                }

                return file;
            }
        );

        let latestFiles = processFiles(files, false);

        const now = new Date();
        const sixtyDaysFromNow = new Date(now);
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        if (expiring === "true") {
            latestFiles = latestFiles.filter((file) => {
                if (!file.expirationDate) return false;

                const expirationDate = new Date(file.expirationDate);
                return (
                    expirationDate >= now && expirationDate <= sixtyDaysFromNow
                );
            });
        } else if (showExpired) {
            console.log("working");
            // Filter to show only expired files
            latestFiles = latestFiles.filter((file) => {
                if (!file.expirationDate) return false;
                const expirationDate = new Date(file.expirationDate);
                return expirationDate < now;
            });
        }

        const processedFiles = showAll ? files : latestFiles;

        return NextResponse.json({ data: processedFiles });
    } catch (error) {
        console.error("Error fetching employee files: ", error);
        return NextResponse.json(
            { message: "Error fetching employee files" },
            { status: 500 }
        );
    }
}

function processFiles(files: EmployeeFile[], showAll: boolean): EmployeeFile[] {
    if (showAll) return files;

    const groupedFiles = files.reduce((acc, file) => {
        const key = `${file.employeeId}-${
            file.fileCategory || "Uncategorized"
        }`;

        if (!acc[key]) {
            acc[key] = file;
        } else if (
            file.uploadDate &&
            (!acc[key].uploadDate ||
                new Date(file.uploadDate) > new Date(acc[key].uploadDate))
        ) {
            // Keep the most recent file
            acc[key] = file;
        }
        return acc;
    }, {} as Record<string, EmployeeFile>);

    return Object.values(groupedFiles).sort((a, b) => {
        const categoryA = a.fileCategory || "Uncategorized";
        const categoryB = b.fileCategory || "Uncategorized";

        if (categoryA === categoryB) {
            // If categories are the same, sort by employeeId
            return a.employeeId - b.employeeId;
        }
        return categoryA.localeCompare(categoryB);
    });
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const fileName = formData.get("fileName") as string;
        const fileType = formData.get("fileType") as string;
        const fileSize = formData.get("fileSize") as string;
        const employeeJson = formData.get("employee") as string | null;
        const fileCategory = formData.get("category") as string;
        const uploadDate = formData.get("uploadDate") as string;
        const expirationDate = formData.get("expirationDate") as string;

        console.log("expirationDate: ", expirationDate);

        if (!employeeJson) {
            return NextResponse.json(
                { message: "Employee information is required" },
                { status: 400 }
            );
        }

        const { employeeName, employeeId } = JSON.parse(employeeJson);

        if (!employeeName) {
            return NextResponse.json(
                { message: "Employee name is required" },
                { status: 400 }
            );
        }

        const latestIdResult = await db
            .select({ maxId: sql`MAX(id)` })
            .from(employeeFileTable)
            .get();

        const newId = ((latestIdResult?.maxId as number) || 0) + 1;

        const key = `${employeeId}-${employeeName}/${newId}-${fileCategory}-${fileName}`;

        const fileValues: any = {
            id: newId,
            filename: fileName,
            fileKey: key,
            fileType: fileType,
            fileSize: parseInt(fileSize),
            fileCategory: fileCategory,
            uploadDate: uploadDate,
            employeeId: employeeId,
            expirationDate: expirationDate,
        };

        console.log(fileValues);

        const newFile = await db
            .insert(employeeFileTable)
            .values(fileValues)
            .returning()
            .get();

        const id = newFile.id;

        console.log("Created new file: ", newFile);

        return NextResponse.json({
            message: "File uploaded successfully as private",
            key,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Error uploading file" },
            { status: 500 }
        );
    }
}
