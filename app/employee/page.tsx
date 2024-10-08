"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";
import { set } from "date-fns";

export default function Page() {
    const { theme } = useTheme();

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col items-center">
            <Toaster richColors theme={theme === "light" ? "light" : "dark"} />
            <ScrollArea className="flex-1 w-full">
                <div className="max-w-5xl mx-auto">
                    <div className="text-foreground p-4">
                        <h2 className="text-2xl font-semibold">
                            Employee Page
                        </h2>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
