"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import useRouter from "next/navigation";
import {
    Trash2,
    Settings2,
    ArrowUpDown,
    MapPinned,
    Check,
    X,
    ExternalLink,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Job } from "@/types/job";
import { CompanyFile } from "@/types/company-file";
import { daysLeft, formatDate } from "@/lib/utils";

// Import the fuzzy sort function
import { fuzzySort } from "./data-table";
import { EmployeeFileWithEmployee } from "@/types/employee-file";

export const employeeExpiredColumns: ColumnDef<EmployeeFileWithEmployee>[] = [
    {
        accessorKey: "fileKey",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const file = row.original;
            return file.employee.companyName;
            // return fileKey.split("/")[0];
        },
        sortingFn: fuzzySort,
    },
    {
        accessorKey: "",
        header: "Name",
        sortingFn: fuzzySort,
        cell: ({ row }) => {
            const file = row.original;
            return file.employee.name;
        },
    },
    {
        accessorKey: "fileCategory",
        header: "Type",
        sortingFn: fuzzySort,
    },
    {
        accessorKey: "uploadDate",
        header: "Upload Date",
        cell: ({ row }) => {
            const { uploadDate } = row.original;
            return formatDate(uploadDate);
        },
        sortingFn: fuzzySort,
    },
    {
        accessorKey: "expirationDate",
        header: "Expired Date",
        cell: ({ row }) => {
            const { expirationDate } = row.original;

            return (
                <div
                    className={`truncate ${
                        daysLeft(expirationDate) < 31 && "text-red-500"
                    }`}
                >
                    {formatDate(expirationDate, false)}
                </div>
            );
        },
        sortingFn: fuzzySort,
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            // eslint-disable-next-line
            // @ts-ignore
            const router = table.options.meta?.router as any;
            const { employeeId } = row.original;

            return (
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={() => {
                            router.push(`/employee/${employeeId}`);
                        }}
                        variant="outline"
                        size="icon"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
