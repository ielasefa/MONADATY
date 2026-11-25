import { describe, it, expect } from "vitest";
import { isCheckoutCity, isValidCheckoutEmail } from "@/lib/checkout-validators";

const MOROCCAN_PHONE_REGEX = /^(\+212|0)([5-7]\d{8})$/;

function validateMoroccanPhone(phone: string): boolean {
  return MOROCCAN_PHONE_REGEX.test(phone.replace(/\s/g, ""));
}

const MOROCCAN_POSTAL_REGEX = /^\d{5}$/;

function validatePostalCode(code: string): boolean {
  return code === "" || MOROCCAN_POSTAL_REGEX.test(code);
}


function validateName(name: string): boolean {
  return typeof name === "string" && name.trim().length > 0;
}

describe("checkout field validators", () => {
  describe("validateMoroccanPhone", () => {
    it("accepts 06XXXXXXXX", () => {
      expect(validateMoroccanPhone("0612345678")).toBe(true);
      expect(validateMoroccanPhone("0712345678")).toBe(true);
      expect(validateMoroccanPhone("0512345678")).toBe(true);
    });

    it("accepts +212XXXXXXXX", () => {
      expect(validateMoroccanPhone("+212600112233")).toBe(true);
      expect(validateMoroccanPhone("+212 600 11 22 33")).toBe(true);
    });

    it("rejects malformed numbers", () => {
      expect(validateMoroccanPhone("123")).toBe(false);
      expect(validateMoroccanPhone("0812345678")).toBe(false);
      expect(validateMoroccanPhone("061234567")).toBe(false);
      expect(validateMoroccanPhone("06123456789")).toBe(false);
      expect(validateMoroccanPhone("+212012345678")).toBe(false);
    });
  });

  describe("validatePostalCode", () => {
    it("accepts a 5-digit postal code", () => {
      expect(validatePostalCode("20000")).toBe(true);
      expect(validatePostalCode("10001")).toBe(true);
    });

    it("allows empty (optional field)", () => {
      expect(validatePostalCode("")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(validatePostalCode("1234")).toBe(false);
      expect(validatePostalCode("123456")).toBe(false);
      expect(validatePostalCode("abcde")).toBe(false);
      expect(validatePostalCode("200 00")).toBe(false);
    });
  });

  describe("validateEmail", () => {
    it("accepts a valid email", () => {
      expect(isValidCheckoutEmail("test@example.com")).toBe(true);
      expect(isValidCheckoutEmail("a@b.c")).toBe(true);
    });

    it("rejects missing @", () => {
      expect(isValidCheckoutEmail("test.example.com")).toBe(false);
    });

    it("rejects too-short strings", () => {
      expect(isValidCheckoutEmail("a@")).toBe(false);
    });
  });

  it.each([undefined, null, "", "   "])("allows omitted or blank email (%s)", (email) => {
    expect(isValidCheckoutEmail(email)).toBe(true);
  });

  it.each([false, 42, {}, [], "a@b", "a b@example.com", "a@@example.com", "a@", "a@b.", "a".repeat(255) + "@test.com"])("rejects malformed optional email (%s)", (email) => {
    expect(isValidCheckoutEmail(email)).toBe(false);
  });

  it.each(["Rabat", "Salé"])("allows delivery in %s", (city) => {
    expect(isCheckoutCity(city)).toBe(true);
  });

  it.each(["Casablanca", "Témara", "Sale", "", undefined, null, 0])("rejects unsupported delivery city (%s)", (city) => {
    expect(isCheckoutCity(city)).toBe(false);
  });

  describe("validateName", () => {
    it("accepts a non-empty trimmed name", () => {
      expect(validateName("Test Customer")).toBe(true);
    });

    it("rejects whitespace-only", () => {
      expect(validateName("   ")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(validateName("")).toBe(false);
    });
  });
});
