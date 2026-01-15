import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  users, profiles, reports, reportAttachments, reportComments,
  type Profile, type Report, type ReportAttachment, type ReportComment,
  type CreateReportRequest, type UpdateReportRequest, type ReportWithDetails
} from "@shared/schema";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string, profile: { name: string; department?: string; role: string }): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile>;

  // Reports
  getReports(filters: { department?: string; date?: string; status?: string; mine?: boolean; userId?: string }): Promise<ReportWithDetails[]>;
  getReport(id: number): Promise<ReportWithDetails | undefined>;
  createReport(userId: string, report: CreateReportRequest): Promise<Report>;
  updateReport(id: number, report: UpdateReportRequest): Promise<Report>;
  deleteReport(id: number): Promise<void>;

  // Comments
  createComment(reportId: number, userId: string, content: string): Promise<ReportComment>;
  
  // Attachments (usually handled via report creation/update, but here for utility)
  addAttachment(reportId: number, attachment: { filename: string; url: string; fileType?: string }): Promise<ReportAttachment>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(userId: string, data: { name: string; department?: string; role: string }): Promise<Profile> {
    const [profile] = await db.insert(profiles).values({
      userId,
      name: data.name,
      department: data.department,
      role: data.role,
    }).returning();
    return profile;
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const [profile] = await db.update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getReports(filters: { department?: string; date?: string; status?: string; mine?: boolean; userId?: string }): Promise<ReportWithDetails[]> {
    let conditions = [];

    if (filters.mine && filters.userId) {
      conditions.push(eq(reports.userId, filters.userId));
    } else if (filters.department) {
      conditions.push(eq(reports.department, filters.department));
    }

    if (filters.date) {
      // Simple date matching (assuming ISO string YYYY-MM-DD or similar)
      // For simplicity, we might just filter by day if needed, but exact match for now
      // Or range? Let's assume frontend sends YYYY-MM-DD and we match start/end of day
      // const startOfDay = new Date(filters.date);
      // const endOfDay = new Date(filters.date); endOfDay.setHours(23,59,59,999);
      // conditions.push(between(reports.date, startOfDay, endOfDay));
    }

    if (filters.status) {
      conditions.push(eq(reports.status, filters.status));
    }

    const result = await db.query.reports.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(reports.date)],
      with: {
        author: true, // This gets the user relation, but we might want profile data too?
        attachments: true,
        comments: {
          with: {
            author: true
          }
        }
      }
    });

    // Map author data from profiles if possible? 
    // The relations in schema link report.userId -> users.id. 
    // We might need to join profiles to get names if they aren't in users.
    // However, users table from Auth has firstName/lastName. We can use that.
    
    return result as ReportWithDetails[];
  }

  async getReport(id: number): Promise<ReportWithDetails | undefined> {
    const result = await db.query.reports.findFirst({
      where: eq(reports.id, id),
      with: {
        author: true,
        attachments: true,
        comments: {
          with: {
            author: true
          },
          orderBy: [desc(reportComments.createdAt)]
        }
      }
    });
    return result as ReportWithDetails | undefined;
  }

  async createReport(userId: string, data: CreateReportRequest): Promise<Report> {
    const [report] = await db.insert(reports).values({
      ...data,
      userId,
      date: new Date(), // Force current date for "Today's Report"
    }).returning();
    return report;
  }

  async updateReport(id: number, data: UpdateReportRequest): Promise<Report> {
    const [report] = await db.update(reports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async createComment(reportId: number, userId: string, content: string): Promise<ReportComment> {
    const [comment] = await db.insert(reportComments).values({
      reportId,
      userId,
      content,
    }).returning();
    return comment;
  }

  async addAttachment(reportId: number, attachment: { filename: string; url: string; fileType?: string }): Promise<ReportAttachment> {
    const [att] = await db.insert(reportAttachments).values({
      reportId,
      ...attachment
    }).returning();
    return att;
  }
}

export const storage = new DatabaseStorage();
