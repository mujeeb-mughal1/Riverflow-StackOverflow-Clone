"use client";
import React, { useEffect } from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion } from "@tabler/icons-react";
import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";

export default function Header() {
    // 1. Pull verifySession from the store
    const { user, verifySession } = useAuthStore();

    // 2. THE SYNC HOOK: Check with Appwrite on load to ensure state is accurate
    useEffect(() => {
        verifySession();
    }, [verifySession]);

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Questions",
            link: "/questions",
            icon: <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ];

    if (user) {
        navItems.push({
            name: "Profile",
            link: `/users/${user.$id}/${slugify(user.name)}`,
            icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
        });
    }

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}