import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // === API ROUTES ===

  // Profile
  app.get(api.profiles.me.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.put(api.profiles.updateMe.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const data = req.body; // Validation handled by schema if we use parsing, let's allow partial for now or use schema
    
    // Check if profile exists
    let profile = await storage.getProfile(userId);
    if (!profile) {
      // Create
      profile = await storage.createProfile(userId, {
        name: data.name,
        department: data.department,
        role: data.role || 'staff' // Default to staff
      });
    } else {
      // Update
      profile = await storage.updateProfile(userId, data);
    }
    res.json(profile);
  });

  // Reports
  app.get(api.reports.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    
    // If staff, can only view own reports unless filters say otherwise?
    // Requirement: Staff -> view own. Supervisor -> view all.
    // We'll enforce this logic here.
    
    const isStaff = profile?.role === 'staff';
    const filters = {
      department: req.query.department as string,
      status: req.query.status as string,
      date: req.query.date as string,
      mine: req.query.mine === 'true',
      userId: isStaff ? userId : undefined // Force userId filter for staff
    };

    // If supervisor wants to see "mine", we filter by their ID. 
    if (filters.mine) {
      filters.userId = userId;
    }

    const reports = await storage.getReports(filters);
    res.json(reports);
  });

  app.get(api.reports.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    const id = parseInt(req.params.id);

    const report = await storage.getReport(id);
    if (!report) return res.status(404).json({ message: "Not found" });

    // Access control
    if (profile?.role === 'staff' && report.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(report);
  });

  app.post(api.reports.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(userId, input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.reports.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    const profile = await storage.getProfile(userId);
    const existing = await storage.getReport(id);

    if (!existing) return res.status(404).json({ message: "Not found" });

    // Access control: Only author can edit draft. Supervisor can edit status/remarks.
    if (profile?.role === 'staff' && existing.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    // TODO: Add stricter checks (e.g. staff can't edit if status != draft)

    try {
      const input = api.reports.update.input.parse(req.body);
      const report = await storage.updateReport(id, input);
      res.json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.comments.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const reportId = parseInt(req.params.reportId);
    
    try {
      const input = api.comments.create.input.parse(req.body);
      const comment = await storage.createComment(reportId, userId, input.content);
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
