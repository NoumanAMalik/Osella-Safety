// app/api/job-company/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { jobCompanyTable, jobTable, companyTable } from "@/db/schema";
import {
    JobCompanyRelationship,
    JobWithCompanies,
    CompanyWithJobs,
} from "@/types/job-company";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const companyId = searchParams.get("companyId");

    let query: any = db
        .select({
            id: jobCompanyTable.id,
            jobId: jobCompanyTable.jobId,
            companyId: jobCompanyTable.companyId,
            jobName: jobTable.name,
            companyName: companyTable.name,
            jobLocation: jobTable.location,
            companyContact: companyTable.contact,
        })
        .from(jobCompanyTable)
        .leftJoin(jobTable, eq(jobCompanyTable.jobId, jobTable.id))
        .leftJoin(companyTable, eq(jobCompanyTable.companyId, companyTable.id))
        .where(eq(jobCompanyTable.active, true));

    if (jobId) {
        query = query.where(
            and(
                eq(jobCompanyTable.jobId, parseInt(jobId)),
                eq(jobCompanyTable.active, true)
            )
        );
    } else if (companyId) {
        query = query.where(
            and(
                eq(jobCompanyTable.companyId, parseInt(companyId)),
                eq(jobCompanyTable.active, true)
            )
        );
    }

    const relationships: JobCompanyRelationship[] = await query.all();

    return NextResponse.json({ data: relationships });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, companyId } = body;

        if (!jobId || !companyId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if the relationship already exists
        const existingRelationship = await db
            .select()
            .from(jobCompanyTable)
            .where(
                and(
                    eq(jobCompanyTable.jobId, jobId),
                    eq(jobCompanyTable.companyId, companyId)
                )
            )
            .get();

        if (existingRelationship) {
            if (!existingRelationship.active) {
                // Reactivate the relationship if it exists but is inactive
                const updatedRelationship = await db
                    .update(jobCompanyTable)
                    .set({ active: true })
                    .where(eq(jobCompanyTable.id, existingRelationship.id))
                    .returning()
                    .get();

                return NextResponse.json(
                    { data: updatedRelationship },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                { error: "Relationship already exists and is active" },
                { status: 409 }
            );
        }

        // Create new relationship
        const newRelationship = await db
            .insert(jobCompanyTable)
            .values({ jobId, companyId })
            .returning()
            .get();

        return NextResponse.json({ data: newRelationship }, { status: 201 });
    } catch (error) {
        console.error("Error adding new job-company relationship: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get("jobId");
        const companyId = searchParams.get("companyId");
        const id = searchParams.get("id");

        if (id) {
            const updatedRelationship = await db
                .update(jobCompanyTable)
                .set({ active: false })
                .where(eq(jobCompanyTable.id, parseInt(id)))
                .returning()
                .get();

            return NextResponse.json(
                { data: updatedRelationship },
                { status: 200 }
            );
        }

        if (!jobId || !companyId) {
            return NextResponse.json(
                { error: "Missing required fields " },
                { status: 400 }
            );
        }

        const updatedRelationship = await db
            .update(jobCompanyTable)
            .set({ active: false })
            .where(
                and(
                    eq(jobCompanyTable.jobId, parseInt(jobId)),
                    eq(jobCompanyTable.companyId, parseInt(companyId))
                )
            )
            .returning()
            .get();

        return NextResponse.json(
            { data: updatedRelationship },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error soft deleting job-company relationship");
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
