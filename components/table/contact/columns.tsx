// "use client";

// import { ColumnDef } from "@tanstack/react-table";
// import Link from "next/link";
// import { Company } from "@/types/company";
// import { Button } from "@/components/ui/button";
// import { Trash2, Settings2, MapPinned, Check, X } from "lucide-react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";

// import { Input } from "@/components/ui/input";
// import { Job } from "@/types/job";
// import { Contact } from "@/types/company-contact";

// // Import the fuzzy sort function
// import { fuzzySort } from "./data-table";

// export const contactColumns: ColumnDef<Contact>[] = [
//     {
//         accessorKey: "companyName",
//         header: "Company Name",
//         sortingFn: fuzzySort,
//     },
//     {
//         accessorKey: "name",
//         header: "Name",
//         cell: ({ row, table }) => {
//             const { name } = row.original;
//             const meta = table.options.meta as any;
//             const isEditing = meta?.editingRow === row.id;

//             if (isEditing) {
//                 return (
//                     <Input
//                         placeholder={name}
//                         onChange={(e) =>
//                             meta?.updateData(row.id, "name", e.target.value)
//                         }
//                     />
//                 );
//             }
//             return name;
//         },
//         sortingFn: fuzzySort,
//     },
//     {
//         accessorKey: "email",
//         header: "Email",
//         cell: ({ row, table }) => {
//             const { email } = row.original;
//             const meta = table.options.meta as any;
//             const isEditing = meta?.editingRow === row.id;

//             if (isEditing) {
//                 return (
//                     <Input
//                         placeholder={email}
//                         onChange={(e) =>
//                             meta?.updateData(row.id, "email", e.target.value)
//                         }
//                     />
//                 );
//             }
//             return email;
//         },
//         sortingFn: fuzzySort,
//     },
//     {
//         accessorKey: "phone",
//         header: "Phone",
//         cell: ({ row, table }) => {
//             const { phone } = row.original;
//             const meta = table.options.meta as any;
//             const isEditing = meta?.editingRow === row.id;

//             if (isEditing) {
//                 return (
//                     <Input
//                         placeholder={phone}
//                         onChange={(e) =>
//                             meta?.updateData(row.id, "phone", e.target.value)
//                         }
//                     />
//                 );
//             }
//             return phone;
//         },
//         sortingFn: fuzzySort,
//     },
//     {
//         id: "actions",
//         cell: ({ row, table }) => {
//             const meta = table.options.meta as any;
//             const isEditing = meta?.editingRow === row.id;

//             return (
//                 <div className="flex justify-end gap-2">
//                     {isEditing ? (
//                         <>
//                             <Button
//                                 onClick={() =>
//                                     meta.saveRow(row.id, row.original.id)
//                                 }
//                                 variant="outline"
//                                 size="icon"
//                             >
//                                 <Check className="h-4 w-4" />
//                             </Button>
//                             <Button
//                                 onClick={() => meta.cancelEdit(row.id)}
//                                 variant="outline"
//                                 size="icon"
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </>
//                     ) : (
//                         <>
//                             <Button
//                                 onClick={() => meta.setEditingRow(row.id)}
//                                 variant="outline"
//                                 size="icon"
//                             >
//                                 <Settings2 className="h-4 w-4" />
//                             </Button>
//                             <Button
//                                 onClick={() => meta.deleteRow(row.original.id)}
//                                 variant="outline"
//                                 size="icon"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </Button>
//                         </>
//                     )}
//                 </div>
//             );
//         },
//     },
// ];
