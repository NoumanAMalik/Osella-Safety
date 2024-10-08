import { Job } from "./job";
import { Company } from "./company";

export interface JobCompany {
    id: number;
    jobId: number;
    companyId: number;
    active: boolean;
}

export interface InsertJobCompany extends Omit<JobCompany, "id"> {}

export interface JobCompanyRelationship {
    id: number;
    jobId: number;
    companyId: number;
    jobName: string;
    companyName: string;
    jobLocation?: string;
    companyContact?: string;
    active: boolean;
}

export interface JobWithCompanies extends Job {
    companies: (Company & { active: boolean })[];
}

export interface CompanyWithJobs extends Company {
    jobs: (Job & { active: boolean })[];
}
