export interface CompanyFile {
    id: number;
    filename: string;
    originalFilename: string | null;
    fileKey: string;
    fileType: string | null;
    fileSize: number | null;
    fileCategory: string | null;
    uploadDate: string | null; // Timestamp
    expirationDate: string | null; // Timestamp
    companyId: number;
    jobId: number | null;
}

export interface InsertCompanyFile extends Omit<CompanyFile, "id"> {}
