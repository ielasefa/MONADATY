"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { adminDeleteCopy } from "@/lib/admin-delete-copy";

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function AdminManagement({ admins: initialAdmins, currentAdminId }: { admins: AdminRecord[]; currentAdminId: string }) {
  const { t, lang } = useTranslation("admin");
  const labels = adminDeleteCopy[lang];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setAdmins((prev) => [...prev, data.admin]);
      setShowCreate(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN");
      router.refresh();
      toast.success(t("admin_created_success", "Admin created successfully"));
    } else {
      const data = await res.json();
      toast.error(data.error || t("fail_create_admin"));
    }
  }

  function deleteReason(admin: AdminRecord) {
    if (admins.length <= 1) return labels.CANNOT_DELETE_LAST_ADMIN;
    if (admin.role === "SUPER_ADMIN" && admins.filter(item => item.role === "SUPER_ADMIN").length <= 1) return labels.CANNOT_DELETE_LAST_SUPER_ADMIN;
    if (admin.id === currentAdminId) return labels.CANNOT_DELETE_CURRENT_ADMIN;
    return undefined;
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAdmins(previous => previous.filter(admin => admin.id !== id));
        router.refresh();
        toast.success(t("admin_deleted_success", "Admin deleted successfully"));
      } else {
        const code = data.error as keyof typeof labels;
        toast.error(labels[code] || labels.failed);
      }
    } catch { toast.error(labels.failed); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="admin-team-page">
      <div className="admin-team-header">
        <div className="admin-team-heading">
          <div className="admin-team-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="luxury-label mb-1">{t("team_label")}</p>
            <h1>{t("admin_management")}</h1>
            <p className="admin-team-description">{t("manage_admins_desc")}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={`admin-team-add ${showCreate ? "btn-secondary" : "btn-primary"}`}
        >
          {!showCreate && <span aria-hidden="true" className="text-lg leading-none">+</span>}
          {showCreate ? t("cancel") : t("add_admin")}
        </button>
      </div>

      <p className="admin-team-history-note" role="note">{labels.history_kept}</p>

      {showCreate && (
        <div className="mb-6 luxury-card p-4 sm:p-7">
          <h2 className="mb-5 text-base font-semibold text-foreground">{t("create_new_admin")}</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="luxury-label">{t("name_label")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-premium w-full px-4 py-2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="luxury-label">{t("email_label")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-premium w-full px-4 py-2.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="luxury-label">{t("password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  className="input-premium w-full px-4 py-2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="luxury-label">{t("role_label")}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                  className="input-premium w-full px-4 py-2.5"
                >
                  <option value="ADMIN">{t("admin_role")}</option>
                  <option value="SUPER_ADMIN">{t("super_admin")}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t("creating") : t("create_admin")}
            </button>
          </form>
        </div>
      )}

      <div className="luxury-card overflow-hidden">
        <div className="admin-team-table-scroll">
        <table className="admin-team-table">
          <thead>
            <tr className="border-b border-line text-start">
              <th>{t("name_label")}</th>
              <th>{t("email_label")}</th>
              <th>{t("role_label")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("last_login", "Last Login")}</th>
              <th>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const blockedReason = deleteReason(a);
              return (
                <tr key={a.id}>
                  <td className="admin-team-name">
                    <span className="admin-team-avatar" aria-hidden="true">{a.name.trim().charAt(0).toLocaleUpperCase()}</span>
                    <span>{a.name}</span>
                  </td>
                  <td className="admin-team-email">{a.email}</td>
                  <td>
                    <span className={a.role === "SUPER_ADMIN" ? "badge-gold" : "admin-team-role"}>
                      {a.role === "SUPER_ADMIN" ? t("super_admin") : t("admin_role")}
                    </span>
                  </td>
                  <td>
                    <span className={a.mustChangePassword ? "badge-red" : "admin-team-status"}>
                      {a.mustChangePassword ? t("must_change") : t("active_status")}
                    </span>
                  </td>
                  <td>
                    <span className={a.lastLoginAt ? "admin-team-login" : "admin-team-never-login"}>
                      {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : t("never_logged")}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={Boolean(blockedReason) || deletingId !== null}
                      className="admin-team-delete disabled:opacity-40"
                      title={blockedReason}
                      aria-describedby={blockedReason ? `admin-delete-reason-${a.id}` : undefined}
                    >
                      {deletingId === a.id ? labels.deleting : t("delete_admin")}
                    </button>
                    {blockedReason && <span id={`admin-delete-reason-${a.id}`} className="admin-team-delete-reason">{blockedReason}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
