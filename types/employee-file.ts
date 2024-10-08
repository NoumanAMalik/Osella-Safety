import { Employee } from "./employee";

export interface EmployeeFile {
    id: number;
    filename: string;
    originalFilename: string | null;
    fileKey: string;
    fileType: string | null;
    fileSize: number | null;
    fileCategory: string | null;
    uploadDate: string | null; // Timestamp
    expirationDate: string | null; // Timestamp
    employeeId: number;
}

export interface EmployeeFileWithEmployee extends EmployeeFile {
    employee: Employee;
}

export interface InsertEmployeeFile extends Omit<EmployeeFile, "id"> {}
