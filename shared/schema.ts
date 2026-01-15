import { pgTable, text, serial, integer, boolean, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export users for convenience
export { users } from "./models/auth";

// === ENUMS ===
export const ROLES = {
  STAFF: "staff",
  SUPERVISOR: "supervisor",
  ADMIN: "admin",
} as const;

export const DEPARTMENTS = {
  GRO: "gro",
  CONCIERGE: "concierge",
  RESERVATIONS: "reservations",
  SWITCHBOARD: "switchboard",
  MANAGEMENT: "management",
} as const;

export const REPORT_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  REVIEWED: "reviewed",
  ACTION_REQUIRED: "action_required",
} as const;

// === TABLE DEFINITIONS ===

// Extend user with profile info for roles/departments
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default(ROLES.STAFF),
  department: text("department"), // Nullable for admins
  name: text("name").notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  department: text("department").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  shift: text("shift").notNull(), // 'Morning', 'Evening', 'Night'
  
  // Report Content
  keyActivities: text("key_activities").notNull(),
  guestFeedback: text("guest_feedback"),
  issues: text("issues"),
  pendingFollowups: text("pending_followups"),
  
  // Status & Flags
  incidentFlag: boolean("incident_flag").default(false),
  status: text("status").notNull().default(REPORT_STATUS.DRAFT),
  
  supervisorRemarks: text("supervisor_remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportAttachments = pgTable("report_attachments", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reports.id),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  fileType: text("file_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const reportComments = pgTable("report_comments", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reports.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  author: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  attachments: many(reportAttachments),
  comments: many(reportComments),
}));

export const attachmentsRelations = relations(reportAttachments, ({ one }) => ({
  report: one(reports, {
    fields: [reportAttachments.reportId],
    references: [reports.id],
  }),
}));

export const commentsRelations = relations(reportComments, ({ one }) => ({
  report: one(reports, {
    fields: [reportComments.reportId],
    references: [reports.id],
  }),
  author: one(users, {
    fields: [reportComments.userId],
    references: [users.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertAttachmentSchema = createInsertSchema(reportAttachments).omit({ id: true, uploadedAt: true });
export const insertCommentSchema = createInsertSchema(reportComments).omit({ id: true, userId: true, createdAt: true });

// === EXPLICIT API TYPES ===

export type Profile = typeof profiles.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ReportAttachment = typeof reportAttachments.$inferSelect;
export type ReportComment = typeof reportComments.$inferSelect;

export type CreateReportRequest = z.infer<typeof insertReportSchema>;
export type UpdateReportRequest = Partial<CreateReportRequest>;

// Response type including relations
export type ReportWithDetails = Report & {
  author?: { firstName: string | null; lastName: string | null; email: string | null };
  attachments?: ReportAttachment[];
  comments?: (ReportComment & { author?: { firstName: string | null; lastName: string | null } })[];
};
