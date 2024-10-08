"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";

export default function Auth() {
	const [password, setPassword] = useState("");
	const router = useRouter();

	useEffect(() => {
		const authCookie = Cookies.get("auth");
		console.log("Got auth cookie: ", authCookie);
		if (authCookie) {
			router.push("/home");
			router.refresh();
		}
	}, [router]);

	const handleSubmit = () => {
		// Set the auth cookie
		if (process.env.NEXT_PUBLIC_TEST === "true") {
			if (password !== "subtest" && password !== "InsuranceUpload") {
				toast.error("Wrong Password");
				return;
			}

			if (password === "subtest") {
				Cookies.set(
					"auth",
					password,
					//  { expires: 1 }
				); // Expires in 1 day
				router.push("/home");
				router.refresh();
			} else if (password === "InsuranceUpload") {
				Cookies.set(
					"insurance",
					password,
					//  { expires: 1 }
				); // Expires in 1 day
				router.push("/incoming-load");
				router.refresh();
			}
		} else {
			if (
				password !== "Osella2024@" &&
				password !== "WhiteOak4!" &&
				password !== "InsuranceUpload"
			) {
				toast.error("Wrong Password");
				return;
			}

			if (password === "Osella2024@" || password === "WhiteOak4!") {
				Cookies.set(
					"auth",
					password,
					//  { expires: 1 }
				); // Expires in 1 day
				router.push("/home");
				router.refresh();
			} else if (password === "InsuranceUpload") {
				Cookies.set(
					"insurance",
					password,
					//  { expires: 1 }
				); // Expires in 1 day
				router.push("/incoming-load");
				router.refresh();
			}
		}
	};
	const { theme } = useTheme();

	return (
		<Card className="w-full max-w-sm">
			<Toaster richColors theme={theme === "light" ? "light" : "dark"} />
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>Enter your passwordd below to login.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{/* <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                </div> */}
				<div className="grid gap-2">
					<Label htmlFor="password">Password</Label>
					<Input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						id="password"
						type="password"
						required
					/>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					className="w-full"
					type="submit"
					onClick={(e) => handleSubmit()}
				>
					Sign in
				</Button>
			</CardFooter>
		</Card>
	);
	// <div>
	//     <h1>Login</h1>
	//     <form onSubmit={handleSubmit}>
	//         <input
	//             type="password"
	//             value={password}
	//             onChange={(e) => setPassword(e.target.value)}
	//             placeholder="Enter password"
	//             required
	//         />
	//         <button type="submit">Login</button>
	//     </form>
	// </div>
}
