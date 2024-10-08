import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { Job } from "@/types/job";
import { JobCompany } from "@/types/job-company";
import { eq } from "drizzle-orm";
import { jobTable } from "@/db/schema";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let query: any = db.select().from(jobTable);

    if (id) query = query.where(eq(jobTable.id, parseInt(id)));

    let result = await query.all();

    result = result.reverse();

    const jobs: Job[] = result.map((row: Job) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        mapLink: row.mapLink,
        contact: row.contact,
    }));

    return NextResponse.json({ data: jobs });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, location, mapLink, contact } = body;

        console.log(name, location, mapLink, contact);

        if (!name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newJob = await db
            .insert(jobTable)
            .values({ name, location, mapLink, contact })
            .returning()
            .get();

        return NextResponse.json({ data: newJob }, { status: 201 });
    } catch (error) {
        console.error("Error adding new job: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, location, mapLink, contact, id } = body;

        if (!name || !id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const updatedJob = await db
            .update(jobTable)
            .set({ name, location, mapLink, contact })
            .where(eq(jobTable.id, id))
            .returning()
            .get();

        if (!updatedJob)
            return NextResponse.json(
                { error: "Job not found" },
                { status: 500 }
            );

        return NextResponse.json({ data: updatedJob }, { status: 201 });
    } catch (error) {
        console.error("Error updating job: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
