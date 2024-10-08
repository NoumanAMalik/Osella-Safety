import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import {
    companyTable,
    employeeTable,
    jobCompanyTable,
    jobTable,
} from "@/db/schema";
import { Company } from "@/types/company";
import { eq } from "drizzle-orm";
import { Job } from "@/types/job";
import { Employee, EmployeeWithCompany } from "@/types/employee";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const companyId = searchParams.get("companyId");
    const includeCompany = searchParams.get("company") === "true";

    let query: any = db
        .select({
            id: employeeTable.id,
            name: employeeTable.name,
            phoneNumber: employeeTable.phoneNumber,
            email: employeeTable.email,
            companyId: employeeTable.companyId,
            companyName: companyTable.name,
        })
        .from(employeeTable)
        .innerJoin(companyTable, eq(employeeTable.companyId, companyTable.id))
        .orderBy(employeeTable.name);

    if (id) query = query.where(eq(employeeTable.id, parseInt(id)));
    if (companyId)
        query = query.where(eq(employeeTable.companyId, parseInt(companyId)));

    if (includeCompany) {
        query = query.leftJoin(
            companyTable,
            eq(companyTable.id, employeeTable.companyId)
        );
    }

    let result = await query.all();

    if (!includeCompany) {
        const employees: Employee[] = result.map((row: Employee) => {
            return {
                id: row.id,
                name: row.name,
                phoneNumber: row.phoneNumber,
                email: row.email,
                companyId: row.companyId,
                companyName: row.companyName,
            };
        });

        return NextResponse.json({ data: employees });
    }

    const employeeWithCompany: EmployeeWithCompany[] = result.map(
        (row: EmployeeWithCompany) => ({
            id: row.id,
            name: row.name,
            phoneNumber: row.phoneNumber,
            email: row.email,
            companyId: row.companyId,
            company: {
                id: row.companyId,
                name: row.companyName,
            },
        })
    );

    return NextResponse.json({ data: employeeWithCompany });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, phoneNumber, email, companyId } = body;

        console.log(name, phoneNumber, email, companyId);

        if (!name) {
            return NextResponse.json(
                {
                    error: "Missing required fields",
                },
                {
                    status: 400,
                }
            );
        }

        const newEmployee = await db
            .insert(employeeTable)
            .values({ name, phoneNumber, email, companyId })
            .returning()
            .get();

        return NextResponse.json({ data: newEmployee }, { status: 201 });
    } catch (error) {
        console.error("Error adding new employee: ", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, phoneNumber, email, id } = body;

        if (!name || !id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const updatedEmployee = await db
            .update(employeeTable)
            .set({ name, phoneNumber, email })
            .where(eq(employeeTable.id, id))
            .returning()
            .get();

        if (!updatedEmployee) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: updatedEmployee }, { status: 201 });
    } catch (error) {
        console.error("Error updating employee: ", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
