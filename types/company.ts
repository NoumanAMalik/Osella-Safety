export interface Company {
    id: number;
    name: string;
    address: string | null;
    contact: string | null;
}

export interface InsertCompany extends Omit<Company, "id"> {}
