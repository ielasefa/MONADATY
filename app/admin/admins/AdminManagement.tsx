"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function AdminManagement({ admins: initialAdmins }: { admins: AdminRecord[] }) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
    } else {
      const data = await res.json();
      setError(data.error || t("fail_create_admin"));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirm_delete_admin"))) return;

    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });

    if (res.ok) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || t("fail_delete_admin"));
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">{t("team_label")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("admin_management")}</h1>
          <p className="mt-1 text-sm text-muted">{t("manage_admins_desc")}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={showCreate ? "btn-secondary" : "btn-primary"}
        >
          {showCreate ? t("cancel") : t("add_admin")}
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 luxury-card p-8">
          <h2 className="luxury-label mb-5">{t("create_new_admin")}</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="luxury-label">{t("password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

            {error && <p className="text-sm text-burgundy">{error}</p>}

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
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              <th className="luxury-label px-6 py-4">{t("name_label")}</th>
              <th className="luxury-label px-6 py-4">{t("email_label")}</th>
              <th className="luxury-label px-6 py-4">{t("role_label")}</th>
              <th className="luxury-label px-6 py-4">Status</th>
              <th className="luxury-label px-6 py-4">Last Login</th>
              <th className="luxury-label px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-white/[0.06] text-sm">
                <td className="px-6 py-4 font-medium text-white">{a.name}</td>
                <td className="px-6 py-4 text-muted">{a.email}</td>
        <td className="px-6 py-4">
  <span className={a.role === "SUPER_ADMIN" ? "badge-gold" : "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] border border-white/[0.06] bg-white/[0.04] text-white/70"}>
    {a.role === "SUPER_ADMIN" ? t("super_admin") : t("admin_role")}
  </span>
</td>
        <td className="px-6 py-4">
  <span className={a.mustChangePassword ? "badge-red" : "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] border border-gold/20 bg-gold/[0.06] text-gold"}>
    {a.mustChangePassword ? t("must_change") : t("active_status")}
  </span>
</td>
        <td className="px-6 py-4">
 <span className={a.lastLoginAt ? "text-sm font-medium text-white/60" : "text-sm font-bold tracking-wider uppercase text-burgundy"}>
  {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : t("never_logged")}
 </span>
</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={admins.length <= 1}
                    className="badge-red disabled:opacity-30"
                    title={admins.length <= 1 ? t("cannot_delete_last") : undefined}
                  >
                    {t("delete_admin")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
