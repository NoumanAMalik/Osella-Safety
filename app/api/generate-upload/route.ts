import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import {
    GetObjectCommand,
    PutObjectCommandInput,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { db } from "@/db";
import { eq, desc, asc, sql, and, gte, lte } from "drizzle-orm";
import { companyFileTable, employeeFileTable } from "@/db/schema";
import { CompanyFile } from "@/types/company-file";
import { toast } from "sonner";
import { s3Client } from "@/DigitalOcean";

export async function PUT(request: NextRequest) {
    const formData = await request.formData();
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string;
    const companyJson = formData.get("company") as string | null;
    const employeeJson = formData.get("employee") as string | null;
    const fileCategory = formData.get("category") as string;
    const uploadDate = formData.get("uploadDate") as string;
    const expirationDate = formData.get("expirationDate") as string;

    if (!companyJson && !employeeJson) {
        return NextResponse.json(
            { message: "Company or Employee information is required" },
            { status: 400 }
        );
    }

    if (companyJson) {
        const { companyName, companyId } = JSON.parse(companyJson);

        if (!companyName) {
            return NextResponse.json(
                { message: "Company name is required" },
                { status: 400 }
            );
        }

        if (!fileName) {
            return NextResponse.json(
                { message: "File is required" },
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

        const params: PutObjectCommandInput = {
            Bucket: process.env.NEXT_PUBLIC_SPACES_BUCKET_NAME,
            Key: key,
            // ACL: "private",
            ACL: "private",
        };

        const command = new PutObjectCommand(params);

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ data: url });
    } else if (employeeJson) {
        const { employeeName, employeeId } = JSON.parse(employeeJson);

        if (!employeeName) {
            return NextResponse.json(
                { message: "Company name is required" },
                { status: 400 }
            );
        }

        if (!fileName) {
            return NextResponse.json(
                { message: "File is required" },
                { status: 400 }
            );
        }

        // Fetch the latest ID
        const latestIdResult = await db
            .select({ maxId: sql`MAX(id)` })
            .from(employeeFileTable)
            .get();

        const newId = ((latestIdResult?.maxId as number) || 0) + 1;

        const key = `${employeeId}-${employeeName}/${newId}-${fileCategory}-${fileName}`;

        const params: PutObjectCommandInput = {
            Bucket: process.env.NEXT_PUBLIC_SPACES_BUCKET_NAME,
            Key: key,
            // ACL: "private",
            ACL: "private",
        };

        const command = new PutObjectCommand(params);

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ data: url });
    }
}
