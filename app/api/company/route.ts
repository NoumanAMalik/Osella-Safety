import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { companyTable, jobCompanyTable, jobTable } from "@/db/schema";
import { Company } from "@/types/company";
import { eq } from "drizzle-orm";
import { Job } from "@/types/job";

export async function GET(request: NextRequest) {
    // const { searchParams } = new URL(request.url);
    // const id = searchParams.get("id");
    // const includeJobs = searchParams.get("jobs") === "true";
    // let query: any = db.select().from(companyTable).orderBy(companyTable.name);
    // if (id) query = query.where(eq(companyTable.id, parseInt(id)));
    // if (includeJobs) {
    //     query = query
    //         .leftJoin(
    //             jobCompanyTable,
    //             eq(companyTable.id, jobCompanyTable.companyId)
    //         )
    //         .leftJoin(jobTable, eq(jobTable.id, jobCompanyTable.jobId));
    //     // .where(eq(jobCompanyTable.active, true));
    // }
    // let result = await query.all();
    // if (!includeJobs) {
    //     const companies: Company[] = result.map((row: Company) => ({
    //         id: row.id,
    //         address: row.address,
    //         contact: row.contact,
    //         name: row.name,
    //     }));
    //     return NextResponse.json({ data: companies });
    // }
    // const companiesMap = new Map();
    // for (const row of result) {
    //     if (!companiesMap.has(row.company.id)) {
    //         companiesMap.set(row.company.id, {
    //             ...row.company,
    //             jobs: [],
    //             employees: [],
    //             files: [],
    //             contacts: [],
    //         });
    //     }
    //     const company = companiesMap.get(row.company.id);
    //     if (includeJobs && row.job) {
    //         if (!company.jobs.some((j: Job) => j.id === row.job.id)) {
    //             company.jobs.push({
    //                 ...row.job,
    //                 active: row.job_company.active,
    //             });
    //         }
    //     }
    //     // if (includeEmployees && row.employee) {
    //     //     if (!company.employees.some((e) => e.id === row.employee.id)) {
    //     //         company.employees.push(row.employee);
    //     //     }
    //     // }
    //     // if (includeFiles && row.company_file) {
    //     //     if (!company.files.some((f) => f.id === row.company_file.id)) {
    //     //         company.files.push(row.company_file);
    //     //     }
    //     // }
    //     // if (includeContacts && row.company_contact) {
    //     //     if (
    //     //         !company.contacts.some((c) => c.id === row.company_contact.id)
    //     //     ) {
    //     //         company.contacts.push(row.company_contact);
    //     //     }
    //     // }
    // }
    // // result = result.reverse();
    // const companies = Array.from(companiesMap.values());
    // return NextResponse.json({ data: companies });
}

export async function POST(request: NextRequest) {
    // try {
    //     const body = await request.json();
    //     const { name, address, contact } = body;
    //     console.log(name, address, contact);
    //     if (!name) {
    //         return NextResponse.json(
    //             { error: "Missing required fields" },
    //             { status: 400 }
    //         );
    //     }
    //     const newCompany = await db
    //         .insert(companyTable)
    //         .values({ name, address, contact })
    //         .returning()
    //         .get();
    //     return NextResponse.json({ data: newCompany }, { status: 201 });
    // } catch (error) {
    //     console.error("Error adding new site: ", error);
    //     return NextResponse.json(
    //         { error: "Internal Server Error" },
    //         { status: 500 }
    //     );
    // }
}

export async function PUT(request: NextRequest) {
    // try {
    //     const body = await request.json();
    //     const { name, address, contact, id } = body;
    //     if (!name || !id) {
    //         return NextResponse.json(
    //             { error: "Missing required fields" },
    //             { status: 400 }
    //         );
    //     }
    //     const updatedCompany = await db
    //         .update(companyTable)
    //         .set({ name, address, contact })
    //         .where(eq(companyTable.id, id))
    //         .returning()
    //         .get();
    //     if (!updatedCompany)
    //         return NextResponse.json(
    //             { error: "Site not found" },
    //             { status: 500 }
    //         );
    //     return NextResponse.json({ data: updatedCompany }, { status: 201 });
    // } catch (error) {
    //     console.error("Error updating site: ", error);
    //     return NextResponse.json(
    //         { error: "Internal Server Error" },
    //         { status: 500 }
    //     );
    // }
}
