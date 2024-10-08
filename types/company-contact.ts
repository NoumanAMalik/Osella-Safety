export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    companyId: number;
    companyName?: string;
}

export interface InsertContact extends Omit<Contact, "id"> {}
