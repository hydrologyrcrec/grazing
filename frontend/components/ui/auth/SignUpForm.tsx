"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Unable to create account.");
      router.replace("/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Create account</h1>
      <form onSubmit={submit}>
        <label>First name<input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
        <label>Last name<input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="new-password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button>
      </form>
      <p>Already have an account? <Link href="/login">Sign in</Link></p>
    </main>
  );
}
