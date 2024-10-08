"use client";

import React, { useCallback, useState } from "react";
import {
    Column,
    FilterFn,
    SortingFn,
    sortingFns,
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    getPaginationRowModel,
    Table as ReactTable,
} from "@tanstack/react-table";

import {
    RankingInfo,
    rankItem,
    compareItems,
} from "@tanstack/match-sorter-utils";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
import { Contact } from "@/types/company-contact";

// Local type augmentation
type AugmentedReactTable<TData> = ReactTable<TData> & {
    options: {
        filterFns: {
            fuzzy: FilterFn<unknown>;
        };
    };
    // Add other properties you might be using here
};

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
        itemRank,
    });
    return itemRank.passed;
};

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
    let dir = 0;
    if (rowA.columnFiltersMeta[columnId]) {
        dir = compareItems(
            //@ts-ignore
            rowA.columnFiltersMeta[columnId]?.itemRank!,
            //@ts-ignore
            rowB.columnFiltersMeta[columnId]?.itemRank!
        );
    }
    return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onUpdate: (updatedContact: Contact) => Promise<void>;
    onDelete: (contactId: number) => Promise<void>;
}

type ContactTableMeta = {
    editingRow: number | null;
    setEditingRow: (rowId: number | null) => void;
    updateData: (rowId: number, key: string, value: string) => void;
    saveRow: (rowId: number, contactId: number) => void;
    cancelEdit: (rowId: number) => void;
    deleteRow: (rowId: number) => void;
};

export function ContactDataTable<TData, TValue>({
    columns,
    data,
    onUpdate,
    onDelete,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const router = useRouter();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<{
        [key: number]: Partial<Contact>;
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

    const deleteRow = useCallback(
        async (rowId: number) => {
            try {
                await onDelete(rowId);
                // Optionally, you can update the local state here to remove the deleted contact
                // or rely on the parent component to refetch the data
            } catch (error) {
                console.error("Error deleting contact:", error);
                // Handle error (e.g., show an error message to the user)
            }
        },
        [onDelete]
    );

    const saveRow = useCallback(
        async (rowId: number, contactId: number) => {
            const originalContact = data.find(
                (contact: any) => contact.id === contactId
            ) as Contact;
            if (!originalContact) {
                console.error("Original contact not found");
                return;
            }

            const updatedFields = editedData[rowId] || {};
            const updatedContact: Contact = {
                ...originalContact,
                ...updatedFields,
            };

            console.log("Updating Contact:", updatedContact);

            try {
                await onUpdate(updatedContact);
                setEditingRow(null);
                setEditedData((prev) => {
                    const { [rowId]: _, ...rest } = prev;
                    return rest;
                });
            } catch (error) {
                console.error("Error updating contact:", error);
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
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
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
            deleteRow,
        } as ContactTableMeta,
    }) as AugmentedReactTable<TData>;

    return (
        <div>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
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
