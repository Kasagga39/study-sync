"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setError(data.error || "Failed to create account");
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold text-brand-navy mb-1">Create Account</h1>
                <p className="text-sm text-brand-slate mb-6">Start organizing your studies today</p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" isLoading={loading} className="w-full">Create Account</Button>
                </form>

                <p className="text-xs text-center text-brand-slate mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-brand-primary font-bold hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}