import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Job, InsertJob } from "@/types/job";

interface JobInputFormProps {
    onAddJob: (job: InsertJob) => void;
}

export function JobInputForm({ onAddJob }: JobInputFormProps) {
    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [mapLink, setMapLink] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (name) {
            onAddJob({ name, location, contact, mapLink });

            setName("");
            setLocation("");
            setContact("");
            setMapLink("");
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
                placeholder="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Input
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Input
                placeholder="Map Link"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                className="flex-1 min-w-0"
            />
            <Button type="submit">Add Job</Button>
        </form>
    );
}
