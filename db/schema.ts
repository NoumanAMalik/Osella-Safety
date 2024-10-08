// import { sql } from "drizzle-orm";
// import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

// export const companyTable = sqliteTable("company", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name").notNull(),
//     address: text("address"),
//     contact: text("contact"),
// });

// export const jobTable = sqliteTable("job", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name"),
//     location: text("location"),
//     mapLink: text("map_link"),
//     contact: text("contact"),
// });

// export const jobCompanyTable = sqliteTable("job_company", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     jobId: integer("job_id")
//         .notNull()
//         .references(() => jobTable.id),
//     companyId: integer("company_id")
//         .notNull()
//         .references(() => companyTable.id),
//     active: integer("active", { mode: "boolean" }).default(true),
// });

// export const employeeTable = sqliteTable("employee", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name").notNull(),
//     email: text("email"),
//     phoneNumber: text("phone_number"),
//     companyId: integer("company_id")
//         .notNull()
//         .references(() => companyTable.id),
// });

// export const companyFileTable = sqliteTable("company_file", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     filename: text("filename").notNull(),
//     originalFilename: text("original_filename"),
//     fileKey: text("file_key").notNull().unique(),
//     fileType: text("file_type"),
//     fileSize: integer("file_size"),
//     fileCategory: text("file_category"),
//     uploadDate: text("upload_date"),
//     expirationDate: text("expiration_date"),
//     companyId: integer("company_id")
//         .notNull()
//         .references(() => companyTable.id),
//     jobId: integer("job_id").references(() => jobTable.id),
// });

// export const employeeFileTable = sqliteTable("employee_file", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     filename: text("filename").notNull(),
//     originalFilename: text("original_filename"),
//     fileKey: text("file_key").notNull().unique(),
//     fileType: text("file_type"),
//     fileSize: integer("file_size"),
//     fileCategory: text("file_category"),
//     uploadDate: text("upload_date"),
//     expirationDate: text("expiration_date"),
//     employeeId: integer("employee_id")
//         .notNull()
//         .references(() => employeeTable.id),
// });

// export const companyContactTable = sqliteTable("company_contact", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name"),
//     email: text("email"),
//     phone: text("phone"),
//     companyId: integer("company_id")
//         .notNull()
//         .references(() => companyTable.id),
// });

// export type InsertCompanyTable = typeof companyTable.$inferInsert;
// export type SelectCompanyTable = typeof companyTable.$inferSelect;

// export type InsertEmployeeTable = typeof employeeTable.$inferInsert;
// export type SelectEmployeeTable = typeof employeeTable.$inferSelect;

// export type InsertCompanyFileTable = typeof companyFileTable.$inferInsert;
// export type SelectCompanyFileTable = typeof companyFileTable.$inferSelect;

// export type InsertEmployeeFileTable = typeof employeeFileTable.$inferInsert;
// export type SelectEmployeeFileTable = typeof employeeFileTable.$inferSelect;

// export type InsertCompanyContactTable = typeof companyContactTable.$inferInsert;
// export type SelectCompanyContactTable = typeof companyContactTable.$inferSelect;
