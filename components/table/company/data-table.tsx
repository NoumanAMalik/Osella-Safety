"use client";

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Company } from "@/types/company";
import { useCallback, useState } from "react";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

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
    onUpdate: (updatedCompany: Company) => Promise<void>;
}

type CompanyTableMeta = {
    editingRow: number | null;
    setEditingRow: (rowId: number | null) => void;
    updateData: (rowId: number, key: string, value: string) => void;
    saveRow: (rowId: number, companyId: number) => void;
    cancelEdit: (rowId: number) => void;
    // deleteRow: (rowId: number) => void;
};

export function CompanyDataTable<TData, TValue>({
    columns,
    data,
    onUpdate,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const router = useRouter();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<{
        [key: number]: Partial<Company>;
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
        async (rowId: number, companyId: number) => {
            const originalCompany = data.find(
                (company: any) => company.id === companyId
            ) as Company;
            if (!originalCompany) {
                console.error("Original company not found");
                return;
            }

            const updatedFields = editedData[rowId] || {};
            const updatedCompany: Company = {
                ...originalCompany,
                ...updatedFields,
            };

            console.log("Updating Company:", updatedCompany);

            try {
                await onUpdate(updatedCompany);
                setEditingRow(null);
                setEditedData((prev) => {
                    const { [rowId]: _, ...rest } = prev;
                    return rest;
                });
            } catch (error) {
                console.error("Error updating company:", error);
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
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5, //custom default page size
            },
        },
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        meta: {
            editingRow,
            setEditingRow,
            updateData,
            saveRow,
            cancelEdit,
        } as CompanyTableMeta,
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
