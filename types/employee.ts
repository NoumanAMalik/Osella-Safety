import { Company } from "./company";

export interface Employee {
    id: number;
    name: string;
    phoneNumber: string | null;
    email: string | null;
    companyId: number;
    companyName: string;
}

export interface EmployeeWithCompany extends Employee {
    company: Company;
}

export interface CompanyWithEmployees extends Company {
    employees: Employee[];
}

export interface InsertEmployee extends Omit<Employee, "id"> {}
