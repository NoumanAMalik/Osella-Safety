"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Job } from "@/types/job";
import { useCallback, useState } from "react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onUpdate: (updatedJob: Job) => Promise<void>;
}

type JobTableMeta = {
    editingRow: number | null;
    setEditingRow: (rowId: number | null) => void;
    updateData: (rowId: number, key: string, value: string) => void;
    saveRow: (rowId: number, jobId: number) => void;
    cancelEdit: (rowId: number) => void;
    // deleteRow: (rowId: number) => void;
};

export function JobDataTable<TData, TValue>({
    columns,
    data,
    onUpdate,
}: DataTableProps<TData, TValue>) {
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<{
        [key: number]: Partial<Job>;
    }>({});
    const updateData = useCallback(
        (rowId: number, key: string, value: string) => {
            setEditedData((prev) => ({
                ...prev,
                [rowId]: { ...prev[rowId], [key]: value },
            }));
        },
        []
    );

    const saveRow = useCallback(
        async (rowId: number, jobId: number) => {
            const originalJob = data.find(
                (job: any) => job.id === jobId
            ) as Job;
            if (!originalJob) {
                console.error("Original Job not found");
                return;
            }

            const updatedFields = editedData[rowId] || {};
            const updatedJob: Job = {
                ...originalJob,
                ...updatedFields,
            };

            console.log("Updating Job:", updatedJob);

            try {
                await onUpdate(updatedJob);
                setEditingRow(null);
                setEditedData((prev) => {
                    const { [rowId]: _, ...rest } = prev;
                    return rest;
                });
            } catch (error) {
                console.error("Error updating job:", error);
                // Handle error (e.g., show an error message to the user)
            }
        },
        [data, editedData, onUpdate]
    );

    const cancelEdit = useCallback((rowId: number) => {
        setEditingRow(null);
        setEditedData((prev) => {
            const { [rowId]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5, //custom default page size
            },
        },
        meta: {
            editingRow,
            setEditingRow,
            updateData,
            saveRow,
            cancelEdit,
        } as JobTableMeta,
    });

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="py-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
