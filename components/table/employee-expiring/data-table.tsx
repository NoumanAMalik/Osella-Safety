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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
}

export function EmployeeExpiryDataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const router = useRouter();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
        meta: {
            router,
        },
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
