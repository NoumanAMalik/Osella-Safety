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
import { companyFileTable } from "@/db/schema";
import { CompanyFile } from "@/types/company-file";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get("companyId");
    const expiring = searchParams.get("expiring");
    const fileName = searchParams.get("filename");
    let showAllString = searchParams.get("showAll");
    let showAll = showAllString == "true" ? true : false;
    let showExpiredString = searchParams.get("showExpired");
    let showExpired = showExpiredString === "true";

    try {
        let query: any = db.select().from(companyFileTable);

        if (companyId) {
            query = query.where(
                eq(companyFileTable.companyId, parseInt(companyId))
            );
        }

        // First, get all files
        let result = await query.all();

        // Then, process the files to get the latest version of each file category
        let files: CompanyFile[] = result.map((row: CompanyFile) => ({
            id: row.id,
            filename: row.filename,
            originalFilename: row.originalFilename,
            fileKey: row.fileKey,
            fileType: row.fileType,
            fileSize: row.fileSize,
            uploadDate: row.uploadDate,
            fileCategory: row.fileCategory,
            expirationDate: row.expirationDate,
            companyId: row.companyId,
            jobId: row.jobId,
        }));

        // Use the processFiles function to get the latest version of each file category
        let latestFiles = processFiles(files, false);

        const now = new Date();
        const sixtyDaysFromNow = new Date(now);
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        if (expiring === "true") {
            // Filter the latest files to only include those expiring within 60 days
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

        // Apply showAll logic if needed
        const processedFiles = showAll ? files : latestFiles;

        return NextResponse.json({
            data: processedFiles,
        });
    } catch (error) {
        console.error("Error fetching company files:", error);
        return NextResponse.json(
            { message: "Error fetching company files" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const fileName = formData.get("fileName") as string;
        const fileType = formData.get("fileType") as string;
        const fileSize = formData.get("fileSize") as string;
        const companyJson = formData.get("company") as string | null;
        const fileCategory = formData.get("category") as string;
        const uploadDate = formData.get("uploadDate") as string;
        const expirationDate = formData.get("expirationDate") as string;
        const jobId = formData.get("jobId") as string | null;

        console.log("expirationDate: ", expirationDate);

        if (!companyJson) {
            return NextResponse.json(
                { message: "Company information is required" },
                { status: 400 }
            );
        }

        const { companyName, companyId } = JSON.parse(companyJson);

        if (!companyName) {
            return NextResponse.json(
                { message: "Company name is required" },
                { status: 400 }
            );
        }

        // Fetch the latest ID
        const latestIdResult = await db
            .select({ maxId: sql`MAX(id)` })
            .from(companyFileTable)
            .get();

        const newId = ((latestIdResult?.maxId as number) || 0) + 1;

        const key = `${companyName}/${newId}-${fileCategory}-${fileName}`;

        const fileValues: any = {
            id: newId,
            filename: fileName,
            fileKey: key,
            fileType: fileType,
            fileSize: parseInt(fileSize),
            fileCategory: fileCategory,
            uploadDate: uploadDate,
            companyId: companyId,
            expirationDate: expirationDate,
            jobId: jobId ? parseInt(jobId) : null,
        };

        console.log(jobId);

        console.log(fileValues);

        const newFile = await db
            .insert(companyFileTable)
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

function processFiles(files: CompanyFile[], showAll: boolean): CompanyFile[] {
    if (showAll) return files;

    const groupedFiles = files.reduce((acc, file) => {
        const key = `${file.companyId}-${file.fileCategory || "Uncategorized"}`;

        if (!acc[key]) {
            acc[key] = file;
        } else if (file.jobId !== acc[key].jobId) {
            // If jobIds are different, keep both files
            const newKey = `${key}-${file.jobId || "noJob"}`;
            acc[newKey] = file;
        } else if (
            file.uploadDate &&
            (!acc[key].uploadDate ||
                new Date(file.uploadDate) > new Date(acc[key].uploadDate))
        ) {
            // If jobIds are the same or both undefined, keep the most recent file
            acc[key] = file;
        }
        return acc;
    }, {} as Record<string, CompanyFile>);

    return Object.values(groupedFiles).sort((a, b) => {
        const categoryA = a.fileCategory || "Uncategorized";
        const categoryB = b.fileCategory || "Uncategorized";

        if (categoryA === categoryB) {
            // If categories are the same, sort by jobId (if present), then by companyId
            if (a.jobId && b.jobId) {
                if (a.jobId !== b.jobId) {
                    return a.jobId - b.jobId;
                }
            } else if (a.jobId) {
                return -1; // Files with jobId come first
            } else if (b.jobId) {
                return 1;
            }
            return a.companyId.toString().localeCompare(b.companyId.toString());
        }
        return categoryA.localeCompare(categoryB);
    });
}
