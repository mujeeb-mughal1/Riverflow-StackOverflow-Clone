"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};

export default function RegisterPage() {
    // 1. Pull 'session' from the store to check if they are already logged in
    const { createAccount, login, session } = useAuthStore();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // LAYER 1: The Route Guard
    // If the user visits this page but already has an active session, redirect immediately.
    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session, router]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Collect data
        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstname");
        const lastName = formData.get("lastname");
        const email = formData.get("email");
        const password = formData.get("password");

        // Validate data
        if (!firstName || !lastName || !email || !password) {
            setError("Please fill out all fields to continue.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await createAccount(
                `${firstName} ${lastName}`,
                email?.toString(),
                password?.toString()
            );

            if (response?.error) {
                let msg = response.error.message;
                if (msg.includes("already exists")) msg = "An account with this email already exists. Please log in.";
                if (msg.includes("session is active")) {
                    msg = "You are already logged in! Taking you to the homepage...";
                    setTimeout(() => router.push("/"), 1500);
                }
                setError(msg);
            } else {
                // Account created! Now try to log them in manually.
                const loginResponse = await login(email.toString(), password.toString());

                if (loginResponse?.error) {
                    // Did it fail because createAccount already logged them in?
                    if (loginResponse.error.message.includes("session is active")) {
                        // They are logged in! Send them to the feed.
                        router.push("/");
                    } else {
                        // A real error happened, display exactly what Appwrite says
                        setError(loginResponse.error.message || "Account created, but we couldn't log you in automatically.");
                    }
                } else {
                    // SUCCESS! Send to homepage
                    router.push("/");
                }
            }
        } catch (err: any) {
            let msg = err.message || "An unexpected error occurred. Please try again.";
            
            if (msg.includes("already exists")) {
                msg = "An account with this email already exists. Please log in instead.";
            } else if (msg.includes("session is active")) {
                msg = "You are already logged in! Taking you to the homepage...";
                setTimeout(() => router.push("/"), 1500);
            }
            
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };
    // Prevent the form from flashing on the screen if the user is already logged in
    if (session) {
        return null; 
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-none border border-solid border-white/30 bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome to Riverflow
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Signup with riverflow if you don&apos;t have an account.
                <br /> If you already have an account,{" "}
                <Link href="/login" className="text-orange-500 hover:underline">
                    login
                </Link>{" "}
                to riverflow
            </p>

            {error && (
                <p className="mt-8 text-center text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
            )}
            
            <form className="my-8" onSubmit={handleSubmit}>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <Input className="text-black" id="firstname" name="firstname" placeholder="Tyler" type="text" />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input className="text-black" id="lastname" name="lastname" placeholder="Durden" type="text" />
                    </LabelInputContainer>
                </div>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        className="text-black"
                        id="email"
                        name="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                    />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            className="text-black w-full pr-10"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </button>
                    </div>
                </LabelInputContainer>

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    disabled={isLoading}
                >
                    Sign up &rarr;
                    <BottomGradient />
                </button>

                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                <div className="flex flex-col space-y-4">
                    <button
                        className="group/btn relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                        type="button"
                        disabled={isLoading}
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Google
                        </span>
                        <BottomGradient />
                    </button>
                    <button
                        className="group/btn relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black shadow-input dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                        type="button"
                        disabled={isLoading}
                    >
                        <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            GitHub
                        </span>
                        <BottomGradient />
                    </button>
                </div>
            </form>
        </div>
    );
}