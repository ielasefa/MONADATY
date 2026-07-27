"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type Supplier = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxNumber: string;
  contactPerson: string;
  notes: string;
  active: boolean;
};

export function SupplierForm({ supplier }: { supplier: Supplier | null }) {
  const { t } = useTranslation("inventory");
  const router = useRouter();
  const isNew = !supplier;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setSaving(true);
      setError("");
      try {
        const data = Object.fromEntries(formData.entries());
        const method = isNew ? "POST" : "PUT";
        const url = isNew ? "/api/admin/inventory/suppliers" : `/api/admin/inventory/suppliers/${supplier.id}`;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }
        router.push("/admin/inventory/suppliers");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setSaving(false);
      }
    },
    [isNew, supplier, router]
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin/inventory/suppliers"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-white"
          >
            &larr; Back to Suppliers
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isNew ? "Add Supplier" : `Edit: ${supplier.name}`}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-card border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-6">
          <p className="luxury-label mb-6 text-[10px] text-muted">Supplier Information</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Supplier Name" name="name" defaultValue={supplier?.name} required />
            <Field label="Company" name="company" defaultValue={supplier?.company} />
            <Field label={t("email_field")} name="email" defaultValue={supplier?.email} type="email" />
            <Field label={t("phone_field")} name="phone" defaultValue={supplier?.phone} />
            <div className="md:col-span-2">
              <Field label={t("address_field")} name="address" defaultValue={supplier?.address} />
            </div>
            <Field label="Website" name="website" defaultValue={supplier?.website} />
            <Field label="Tax Number" name="taxNumber" defaultValue={supplier?.taxNumber} />
            <Field label="Contact Person" name="contactPerson" defaultValue={supplier?.contactPerson} />
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="luxury-label text-[10px] text-muted">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={supplier?.notes}
                  rows={3}
                  className="input-premium w-full min-h-[80px] resize-y px-4 py-3"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                defaultChecked={supplier?.active ?? true}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
              />
              <span className="text-sm text-white">Active</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Supplier" : "Update Supplier"}
          </button>
          <Link
            href="/admin/inventory/suppliers"
            className="btn-secondary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="luxury-label text-[10px] text-muted">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="input-premium w-full"
      />
    </div>
  );
}
