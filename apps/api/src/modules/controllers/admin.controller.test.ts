import { describe, expect, it, vi } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import type { SessionUser } from "../guards/session.guard.js";
import { AdminController } from "./admin.controller.js";

function actor(role: "OWNER" | "ADMIN", id = "actor-1"): SessionUser {
  return {
    id,
    organizationId: "org-1",
    email: `${role.toLowerCase()}@example.com`,
    name: "Actor",
    role,
    createdAt: new Date("2026-01-01T00:00:00.000Z")
  };
}

function prismaMock(targetRole: string = "AGENT") {
  return {
    organization: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "org-1" }) },
    user: {
      findFirst: vi.fn().mockResolvedValue({ id: "user-1", role: targetRole }),
      create: vi.fn().mockResolvedValue({ id: "user-1", email: "new@example.com", name: "New", role: "AGENT", createdAt: new Date() }),
      update: vi.fn().mockResolvedValue({ id: "user-1", email: "user@example.com", name: "User", role: targetRole, createdAt: new Date() })
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) }
  };
}

function controller(prisma: ReturnType<typeof prismaMock>) {
  return new AdminController(prisma as never, {} as never, {} as never);
}

describe("AdminController user role hierarchy", () => {
  it("forbids an admin from creating an owner", async () => {
    const prisma = prismaMock();
    await expect(controller(prisma).createUser(actor("ADMIN"), {
      email: "new@example.com", name: "New", password: "password123", role: "OWNER"
    })).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("allows an owner to create an owner", async () => {
    const prisma = prismaMock();
    await expect(controller(prisma).createUser(actor("OWNER"), {
      email: "new@example.com", name: "New", password: "password123", role: "OWNER"
    })).resolves.toMatchObject({ id: "user-1" });
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("forbids an admin from modifying an owner account", async () => {
    const prisma = prismaMock("OWNER");
    await expect(controller(prisma).updateUser(actor("ADMIN"), "user-1", { password: "newpassword1" }))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("forbids an admin from promoting a user to owner", async () => {
    const prisma = prismaMock("AGENT");
    await expect(controller(prisma).updateUser(actor("ADMIN"), "user-1", { role: "OWNER" }))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("forbids changing your own role", async () => {
    const prisma = prismaMock("OWNER");
    await expect(controller(prisma).updateUser(actor("OWNER", "user-1"), "user-1", { role: "ADMIN" }))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("allows an admin to update a regular user's name", async () => {
    const prisma = prismaMock("AGENT");
    await expect(controller(prisma).updateUser(actor("ADMIN"), "user-1", { name: "Renamed" }))
      .resolves.toMatchObject({ id: "user-1" });
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
  });
});
