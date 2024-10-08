"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
    Bell,
    CircleGauge,
    CircleUser,
    Home,
    Drill,
    Users,
    LineChart,
    LogOut,
    MapPinned,
    HardHat,
    Menu,
    Package2,
    Truck,
    RotateCw,
    ReceiptPoundSterling,
    SlidersHorizontal,
} from "lucide-react";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
// import { RefreshProvider } from "@/context/RefreshContext";
import { format } from "date-fns";

export function Sidebar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [incomingLoadsCount, setIncomingLoadsCount] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const router = useRouter();

    const [navItems, setNavItems] = useState([
        { href: "/home", label: "Home", icon: Home, badge: 0 },
        { href: "/company", label: "Company", icon: Drill, badge: 0 },
        {
            href: "/insurance",
            label: "Company Insurance",
            icon: HardHat,
            badge: 0,
        },
        { href: "/employee", label: "Employee", icon: Users, badge: 0 },
        { href: "/admin", label: "Admin", icon: SlidersHorizontal, badge: 0 },
    ]);

    useEffect(() => {
        const handleRouteChange = () => {
            const scrollPosition = localStorage.getItem("scrollPosition");
            if (scrollPosition) {
                window.scrollTo(0, Number.parseInt(scrollPosition, 10));
                localStorage.removeItem("scrollPosition");
            }
        };

        window.addEventListener("load", handleRouteChange);
        return () => window.removeEventListener("load", handleRouteChange);
    }, []);

    const reloadPage = () => {
        localStorage.setItem("scrollPosition", window.scrollY.toString());
        window.location.reload();
    };

    const handleLogout = () => {
        // Function to remove all cookies for the current domain
        const removeAllDomainCookies = () => {
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(
                        /=.*/,
                        `=;expires=${new Date().toUTCString()};path=/`,
                    );
            });
        };

        // Remove all cookies for the current domain
        removeAllDomainCookies();

        // Redirect to login page or refresh the current page
        router.push("/auth"); // Adjust this to your login page route
    };

    return pathname.toLowerCase() !== "/auth" ? (
        <div className="grid min-h-screen w-full xl:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 xl:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <Image
                                src="/AmicoMaster 2023 Horiz.png"
                                alt={""}
                                width={100}
                                height={100}
                            />
                        </Link>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className=" h-8 w-8"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="sr-only">
                                    Toggle notifications
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className=" h-8 w-8"
                                onClick={reloadPage}
                            >
                                <RotateCw className="h-4 w-4" />
                                <span className="sr-only">Reload</span>
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                            {navItems.map((item, index) => {
                                const isActive = pathname
                                    .toLowerCase()
                                    .startsWith(item.href.toLowerCase());
                                const isCompanyActive = pathname
                                    .toLowerCase()
                                    .includes("/company/");
                                const isCompanySlug =
                                    index === 2 &&
                                    item.href.includes("company");
                                const isEmployeeSlug =
                                    index === 4 &&
                                    item.href.includes("employee");

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                                            isActive
                                                ? "bg-muted text-primary"
                                                : "text-muted-foreground"
                                        } ${isCompanySlug ? "ml-4" : ""} ${
                                            isEmployeeSlug && !isCompanyActive
                                                ? "ml-4"
                                                : ""
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                        {item.badge > 0 && (
                                            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 xl:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-1 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <Package2 className="h-6 w-6" />
                                    <span className="sr-only">Amico-Flo</span>
                                </Link>
                                {navItems.map((item, index) => {
                                    const isActive = pathname
                                        .toLowerCase()
                                        .startsWith(item.href.toLowerCase());
                                    const isCompanyActive = pathname
                                        .toLowerCase()
                                        .includes("/company/");
                                    const isCompanySlug =
                                        index === 2 &&
                                        item.href.includes("company");
                                    const isEmployeeSlug =
                                        index === 4 &&
                                        item.href.includes("employee");

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                                                isActive
                                                    ? "bg-muted text-primary"
                                                    : "text-muted-foreground"
                                            } ${isCompanySlug ? "ml-4" : ""} ${
                                                isEmployeeSlug &&
                                                !isCompanyActive
                                                    ? "ml-4"
                                                    : ""
                                            }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                            {item.badge > 0 && (
                                                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="w-full flex-1">
                        {process.env.NEXT_PUBLIC_TEST === "true" ? (
                            <p className="">TEST SERVER</p>
                        ) : null}
                        {/* <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form> */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-full"
                            >
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">
                                    Toggle user menu
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            {/* <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ModeToggle />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {/* <div className="flex items-center">
                        <h1 className="text-lg font-semibold md:text-2xl">
                            Inventory
                        </h1>
                    </div>
                    <div
                        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                        x-chunk="dashboard-02-chunk-1"
                    >
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                You have no products
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You can start selling as soon as you add a
                                product.
                            </p>
                            <Button className="mt-4">Add Product</Button>
                        </div>
                    </div> */}
                    {/* <RefreshProvider triggerRefresh={triggerRefresh}> */}
                    {children}
                    {/* </RefreshProvider> */}
                </main>
            </div>
        </div>
    ) : (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/* <div className="flex items-center">
                        <h1 className="text-lg font-semibold md:text-2xl">
                            Inventory
                        </h1>
                    </div>
                    <div
                        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                        x-chunk="dashboard-02-chunk-1"
                    >
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                You have no products
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You can start selling as soon as you add a
                                product.
                            </p>
                            <Button className="mt-4">Add Product</Button>
                        </div>
                    </div> */}
            {/* <RefreshProvider triggerRefresh={triggerRefresh}> */}
            {children}
            {/* </RefreshProvider> */}
        </main>
    );
}
