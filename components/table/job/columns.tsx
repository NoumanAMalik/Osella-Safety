"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Trash2, Settings2, MapPinned, Check, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Job } from "@/types/job";

export const jobColumns: ColumnDef<Job>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row, table }) => {
            const { name } = row.original;
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            if (isEditing) {
                return (
                    <Input
                        placeholder={name}
                        onChange={(e) =>
                            meta?.updateData(row.id, "name", e.target.value)
                        }
                    />
                );
            }
            return name;
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row, table }) => {
            const { location } = row.original;
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            if (isEditing) {
                return (
                    <Input
                        placeholder={location ? location : ""}
                        onChange={(e) =>
                            meta?.updateData(row.id, "location", e.target.value)
                        }
                    />
                );
            }
            return location;
        },
    },
    {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row, table }) => {
            const { contact } = row.original;
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            if (isEditing) {
                return (
                    <Input
                        placeholder={contact ? contact : ""}
                        onChange={(e) =>
                            meta?.updateData(row.id, "contact", e.target.value)
                        }
                    />
                );
            }
            return contact;
        },
    },
    {
        accessorKey: "mapLink",
        header: "Map Link",
        cell: ({ row, table }) => {
            const { mapLink } = row.original;
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            if (isEditing) {
                return (
                    <Input
                        placeholder={mapLink ? mapLink : ""}
                        onChange={(e) =>
                            meta?.updateData(row.id, "mapLink", e.target.value)
                        }
                    />
                );
            }
            return mapLink;
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            return (
                <div className="flex justify-end gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={() =>
                                    meta.saveRow(row.id, row.original.id)
                                }
                                variant="outline"
                                size="icon"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => meta.cancelEdit(row.id)}
                                variant="outline"
                                size="icon"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => meta.setEditingRow(row.id)}
                            variant="outline"
                            size="icon"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            );
        },
    },
];
