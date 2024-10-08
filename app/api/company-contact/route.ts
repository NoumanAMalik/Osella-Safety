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
    companyContactTable,
    companyFileTable,
    companyTable,
} from "@/db/schema";
import { CompanyFile } from "@/types/company-file";
import { Contact } from "@/types/company-contact";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get("companyId");

    try {
        let query: any = db
            .select({
                id: companyContactTable.id,
                name: companyContactTable.name,
                email: companyContactTable.email,
                phone: companyContactTable.phone,
                companyId: companyContactTable.companyId,
                companyName: companyTable.name,
            })
            .from(companyContactTable)
            .innerJoin(
                companyTable,
                eq(companyContactTable.companyId, companyTable.id)
            );

        if (companyId) {
            query = query.where(
                eq(companyContactTable.companyId, parseInt(companyId))
            );
        }

        let result = await query.all();

        let contacts: Contact[] = result.map((row: Contact) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            companyId: row.companyId,
            companyName: row.companyName,
        }));

        return NextResponse.json({
            data: contacts,
        });
    } catch (error) {
        console.error("Error fetching company files: ", error);
        return NextResponse.json(
            { message: "Error fetching company contacts" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, email, phone, companyId } = body;

        console.log(name, email, phone, companyId);

        if (!name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newContact = await db
            .insert(companyContactTable)
            .values({ name, email, phone, companyId })
            .returning()
            .get();

        return NextResponse.json({ data: newContact }, { status: 201 });
    } catch (error) {
        console.error("Error adding new company contact: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, email, phone, id } = body;

        if (!name || !id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const updatedContact = await db
            .update(companyContactTable)
            .set({ name, email, phone })
            .where(eq(companyContactTable.id, id))
            .returning()
            .get();

        if (!updatedContact) {
            return NextResponse.json(
                { error: "Contact not found " },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error updating site: ", error);
        return NextResponse.json(
            { error: "Internal Server Error " },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing contact id" },
            { status: 400 }
        );
    }

    try {
        const deletedContact = await db
            .delete(companyContactTable)
            .where(eq(companyContactTable.id, parseInt(id)))
            .returning()
            .get();

        if (!deletedContact) {
            return NextResponse.json(
                { error: "Contact not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
