export interface Job {
    id: number;
    name: string;
    location: string | null;
    mapLink: string | null;
    contact: string | null;
}

export interface InsertJob extends Omit<Job, "id"> {}
