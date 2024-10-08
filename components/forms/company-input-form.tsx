import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Company, InsertCompany } from "@/types/company";

interface CompanyInputFormProps {
    onAddCompany: (company: InsertCompany) => void;
}

export function CompanyInputForm({ onAddCompany }: CompanyInputFormProps) {
    const [name, setName] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [contact, setContact] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (name) {
            onAddCompany({ name, address, contact });

            setName("");
            setAddress("");
            setContact("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
            <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Input
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Button type="submit">Add Company</Button>
        </form>
    );
}
