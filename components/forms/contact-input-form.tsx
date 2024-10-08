// import React, { useState } from "react";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { Company, InsertCompany } from "@/types/company";
// import { InsertContact } from "@/types/company-contact";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "../ui/select";

// interface ContactInputFormProps {
//     companies: Company[];
//     onAddContact: (contact: InsertContact) => void;
// }

// export function ContactInputForm({
//     onAddContact,
//     companies,
// }: ContactInputFormProps) {
//     const [name, setName] = useState<string>("");
//     const [email, setEmail] = useState<string>("");
//     const [phone, setPhone] = useState<string>("");
//     const [companyId, setCompanyId] = useState<string>("");

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         if (name && companyId) {
//             const company = companies.find((c) => c.id === parseInt(companyId));
//             onAddContact({
//                 name,
//                 email: email,
//                 phone: phone,
//                 companyId: parseInt(companyId),
//                 companyName: company ? company.name : "Unknown Company",
//             });

//             setName("");
//             setEmail("");
//             setPhone("");
//             setCompanyId("");
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
//             <Select value={companyId} onValueChange={setCompanyId}>
//                 <SelectTrigger className="w-[240px]">
//                     <SelectValue placeholder="Select company" />
//                 </SelectTrigger>
//                 <SelectContent>
//                     {companies.map((company) => (
//                         <SelectItem
//                             key={company.id}
//                             value={company.id.toString()}
//                         >
//                             {company.name}
//                         </SelectItem>
//                     ))}
//                 </SelectContent>
//             </Select>
//             <Input
//                 placeholder="Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="flex-1 min-w-0"
//             />
//             <Input
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="flex-1 min-w-0"
//             />
//             <Input
//                 placeholder="Phone"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="flex-1 min-w-0"
//             />
//             {/* <Input
//                 placeholder="Company"
//                 value={companyId}
//                 onChange={(e) => setCompanyId(e.target.value)}
//                 className="flex-1 min-w-0"
//             /> */}
//             <Button type="submit">Add Contact</Button>
//         </form>
//     );
// }
