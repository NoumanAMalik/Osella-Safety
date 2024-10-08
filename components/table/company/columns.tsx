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

import { fuzzySort } from "./data-table";

export const companyColumns: ColumnDef<Company>[] = [
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
        sortingFn: fuzzySort,
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row, table }) => {
            const { address } = row.original;
            const meta = table.options.meta as any;
            const isEditing = meta?.editingRow === row.id;

            if (isEditing) {
                return (
                    <Input
                        placeholder={address ? address : ""}
                        onChange={(e) =>
                            meta?.updateData(row.id, "address", e.target.value)
                        }
                    />
                );
            }
            return address;
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
