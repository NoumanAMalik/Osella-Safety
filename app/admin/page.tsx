"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense, useEffect, useState } from "react";
import { Company, InsertCompany } from "@/types/company";
import { CompanyInputForm } from "@/components/forms/company-input-form";
import { CompanyDataTable } from "@/components/table/company/data-table";
import { companyColumns } from "@/components/table/company/columns";
import { JobInputForm } from "@/components/forms/job-input-form";
import { JobDataTable } from "@/components/table/job/data-table";
import { jobColumns } from "@/components/table/job/columns";
import { InsertJob, Job } from "@/types/job";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";
import { Contact, InsertContact } from "@/types/company-contact";
import { set } from "date-fns";
import { ContactInputForm } from "@/components/forms/contact-input-form";
import { ContactDataTable } from "@/components/table/contact/data-table";
import { contactColumns } from "@/components/table/contact/columns";
import { Employee, InsertEmployee } from "@/types/employee";
import { EmployeeInputForm } from "@/components/forms/employee-input-form";
import { employeeColumns } from "@/components/table/employee/columns";
import { EmployeeDataTable } from "@/components/table/employee/data-table";

export default function Page() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { theme } = useTheme();

    const handleAddCompany = async (newCompany: InsertCompany) => {
        if (newCompany.name.includes("&")) {
            toast.error("The & symbol is not allowed :(");
            return;
        }

        try {
            const response = await fetch("/api/company", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCompany.name,
                    address: newCompany.address,
                    contact: newCompany.contact,
                }),
            });

            if (!response.ok) throw new Error("Failed to add company");

            await fetchCompanies();
        } catch (error) {
            console.error("Error adding company: ", error);
        }
    };

    const handleAddJob = async (newJob: InsertJob) => {
        if (newJob.name.includes("&")) {
            toast.error("The & symbol is not allowed :(");
            return;
        }

        try {
            const response = await fetch("/api/job", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newJob.name,
                    location: newJob.location,
                    contact: newJob.contact,
                    mapLink: newJob.mapLink,
                }),
            });

            if (!response.ok) throw new Error("Failed to add company");

            await fetchJobs();
        } catch (error) {
            console.error("Error adding company: ", error);
        }
    };

    const handleAddContact = async (newContact: InsertContact) => {
        try {
            const response = await fetch("/api/company-contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newContact.name,
                    email: newContact.email,
                    phone: newContact.phone,
                    companyId: newContact.companyId,
                }),
            });

            if (!response.ok) throw new Error("Failed to add contact");

            await fetchContacts();
        } catch (error) {
            console.error("Error adding contact: ", error);
        }
    };

    const handleAddEmployee = async (newEmployee: InsertEmployee) => {
        try {
            const response = await fetch("/api/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newEmployee.name,
                    email: newEmployee.email,
                    phoneNumber: newEmployee.phoneNumber,
                    companyId: newEmployee.companyId,
                }),
            });

            if (!response.ok) throw new Error("Failed to add employee");

            await fetchEmployees();
        } catch (error) {
            console.error("Error adding employee: ", error);
        }
    };

    const handleUpdateCompany = async (updatedCompany: Company) => {
        if (updatedCompany.name.includes("&")) {
            toast.error("The & symbol is not allowed :(");
            return;
        }

        try {
            const response = await fetch("/api/company", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCompany),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Failed to update company");
            }

            await fetchCompanies();
        } catch (error) {
            console.error("Error updating companies: ", error);
        }
    };

    const handleUpdateJob = async (updatedJob: Job) => {
        try {
            const response = await fetch("/api/job", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedJob),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Failed to update job");
            }

            await fetchJobs();
        } catch (error) {
            console.error("Error updating job: ", error);
        }
    };

    const handleUpdateContact = async (updatedContact: Contact) => {
        try {
            const response = await fetch("/api/company-contact", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedContact),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Failed to update contact");
            }

            await fetchContacts();
        } catch (error) {
            console.error("Error updating contact: ", error);
            toast.error("Error updating Contact");
        }
    };

    const handleUpdateEmployee = async (updatedEmployee: Employee) => {
        try {
            const response = await fetch("/api/employee", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEmployee),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Failed to update employee");
            }

            await fetchEmployees();
        } catch (error) {
            console.error("Error updating employee: ", error);
            toast.error("Error updating Employee");
        }
    };

    const handleDeleteContact = async (contactId: number) => {
        try {
            const response = await fetch(
                `/api/company-contact?id=${contactId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete contact");
            }

            await fetchContacts(); // Refetch the contacts after successful deletion
        } catch (error) {
            console.error("Error deleting contact: ", error);
            toast.error("Error deleting contact");
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch("/api/company");

            if (!response.ok) throw new Error("Failed to fetch companies");

            const data = await response.json();

            console.log("Companies: ", data);

            setCompanies(data.data);
        } catch (error) {
            console.error("Error fetching companies: ", error);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await fetch("/api/job");

            if (!response.ok) throw new Error("Failed to fetch jobs");

            const data = await response.json();

            console.log("Jobs: ", data);

            setJobs(data.data);
        } catch (error) {
            console.error("Error fetching jobs: ", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await fetch("/api/company-contact");

            if (!response.ok) throw new Error("Failed to fetch jobs");

            const data = await response.json();

            console.log("Contacts: ", data);

            setContacts(data.data);
        } catch (error) {
            console.error("Error fetching contacts: ", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/employee");

            if (!response.ok) throw new Error("Failed to fetch employees");

            const data = await response.json();

            console.log("Employees: ", data);

            setEmployees(data.data);
        } catch (error) {
            console.error("Error fetching employee: ", error);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchJobs();
        fetchContacts();
        fetchEmployees();
    }, []);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col items-center">
            <Toaster richColors theme={theme == "light" ? "light" : "dark"} />
            <ScrollArea className="flex-1 w-full">
                <div className="max-w-5xl mx-auto">
                    <div className="text-foreground p-4">
                        <h2 className="text-2xl font-semibold">
                            Manage Companies and Employees
                        </h2>
                        <p className="text-sm">
                            Below you will have the ability to update
                            information that we have stored
                        </p>
                    </div>
                    <div className="p-4">
                        <section className="rounded-lg overflow-hidden mb-6 w-full">
                            <h3 className="text-xl font-semibold p-4 text-foreground">
                                Companies
                            </h3>
                            <div className="w-full my-10 p-1 min-h-[700px]">
                                <Suspense
                                    fallback={
                                        <div className="p-4">Loading...</div>
                                    }
                                >
                                    <CompanyInputForm
                                        onAddCompany={handleAddCompany}
                                    />
                                    <CompanyDataTable
                                        columns={companyColumns}
                                        data={companies}
                                        onUpdate={handleUpdateCompany}
                                    />
                                </Suspense>
                            </div>
                        </section>
                        <section className="rounded-lg overflow-hidden mb-6 w-full">
                            <h3 className="text-xl font-semibold p-4 text-foreground">
                                Jobs
                            </h3>
                            <div className="w-full my-10 p-1 min-h-[700px]">
                                <Suspense
                                    fallback={
                                        <div className="p-4">Loading...</div>
                                    }
                                >
                                    <JobInputForm onAddJob={handleAddJob} />
                                    <JobDataTable
                                        columns={jobColumns}
                                        data={jobs}
                                        onUpdate={handleUpdateJob}
                                    />
                                </Suspense>
                            </div>
                        </section>
                        <section className="rounded-lg overflow-hidden mb-6 w-full">
                            <h3 className="text-xl font-semibold p-4 text-foreground">
                                Contacts
                            </h3>
                            <div className="w-full my-10 p-1 min-h-[700px]">
                                <Suspense
                                    fallback={
                                        <div className="p-4">Loading...</div>
                                    }
                                >
                                    <ContactInputForm
                                        companies={companies}
                                        onAddContact={handleAddContact}
                                    />
                                    <ContactDataTable
                                        columns={contactColumns}
                                        data={contacts}
                                        onUpdate={handleUpdateContact}
                                        onDelete={handleDeleteContact}
                                    />
                                </Suspense>
                            </div>
                        </section>
                        <section className="rounded-lg overflow-hidden mb-6 w-full">
                            <h3 className="text-xl font-semibold p-4 text-foreground">
                                Employees
                            </h3>
                            <div className="w-full my-10 p-1 min-h-[700px]">
                                <Suspense
                                    fallback={
                                        <div className="p-4">Loading...</div>
                                    }
                                >
                                    <EmployeeInputForm
                                        companies={companies}
                                        // onAddContact={handleAddContact}
                                        onAddEmployee={handleAddEmployee}
                                    />
                                    <EmployeeDataTable
                                        columns={employeeColumns}
                                        data={employees}
                                        onUpdate={handleUpdateEmployee}
                                        // onDelete={handleDeleteContact}
                                    />
                                </Suspense>
                            </div>
                        </section>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
