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
import { companyFileTable } from "@/db/schema";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const folder = searchParams.get("folder");
    const fileName = searchParams.get("filename");

    if (!folder)
        return NextResponse.json(
            { Message: "Folder name is required" },
            { status: 400 }
        );

    console.log("filename: ", fileName);

    const key = `${folder}/${fileName}`;

    console.log("Key: ", key);

    try {
        // Check if the file exists
        const headCommand = new HeadObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_SPACES_BUCKET_NAME,
            Key: key,
        });

        try {
            await s3Client.send(headCommand);
        } catch (headError: any) {
            if (headError.name === "NotFound") {
                return NextResponse.json(
                    { message: "File not found" },
                    { status: 404 }
                );
            }
            throw headError; // Re-throw if it's a different error
        }

        const getCommand = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_SPACES_BUCKET_NAME,
            Key: key,
        });

        // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
        const signedUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: 7200,
        });

        console.log(`Generated signed URL for ${key}. Expires in 2 hours.`);

        return NextResponse.json({
            message: "Temporary link generated",
            url: signedUrl,
        });
    } catch (error) {
        console.error("Error generating temporary link:", error);
        return NextResponse.json(
            { message: "Error generating temporary link" },
            { status: 500 }
        );
    }
}
