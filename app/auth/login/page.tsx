"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoBackground } from "@/components/video-background";
import { useEffect, useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-signin-button";

export default function LoginPage() {
	const router = useRouter();
	const [method, setMethod] = useState<"password" | "otp">("password");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [otp, setOtp] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		if (countdown <= 0) return;
		const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [countdown]);

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Login failed");
			}

			// Store user data in localStorage for navigation
			if (data.user) {
				localStorage.setItem("profile", JSON.stringify(data.user));
			}
			router.push("/profile");
		} catch (err) {
			console.error("Login error:", err);
			setError(err instanceof Error ? err.message : "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const sendLoginOtp = async () => {
		if (!email) {
			setError("Please enter your email first");
			return;
		}
		setLoading(true);
		setError(null);
		setSuccess(null);
		try {
			const response = await fetch("/api/send-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, type: "login" }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.message || "Failed to send OTP");
			setOtpSent(true);
			setCountdown(30);
			setSuccess("OTP sent! Check your email.");
			// Dev convenience: auto-fill if server returned it (only in dev)
			if (data?.devOtp) setOtp(String(data.devOtp));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const verifyLoginOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp || otp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}
		setLoading(true);
		setError(null);
		setSuccess(null);
		try {
			const response = await fetch("/api/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email, otp, type: "login" }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.message || "OTP verification failed");
			if (data.user) localStorage.setItem("profile", JSON.stringify(data.user));
			setSuccess("Signed in successfully. Redirecting...");
			router.push("/profile");
		} catch (err) {
			setError(err instanceof Error ? err.message : "OTP verification failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen w-full text-foreground">
			<VideoBackground />
			<div className="relative z-10 mx-auto max-w-md px-6 py-16">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<LogIn className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-semibold">Welcome Back</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Sign in to your account to continue
					</p>
				</div>

				<div className="mt-8 grid grid-cols-2 gap-2">
					<button
						type="button"
						onClick={() => {
							setMethod("password");
							setError(null);
							setSuccess(null);
						}}
						className={`rounded-md px-3 py-2 text-sm font-medium border transition ${
							method === "password"
								? "bg-white/15 border-white/25 text-white"
								: "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
						}`}
					>
						Password
					</button>
					<button
						type="button"
						onClick={() => {
							setMethod("otp");
							setPassword("");
							setShowPassword(false);
							setOtp("");
							setOtpSent(false);
							setCountdown(0);
							setError(null);
							setSuccess(null);
						}}
						className={`rounded-md px-3 py-2 text-sm font-medium border transition ${
							method === "otp"
								? "bg-white/15 border-white/25 text-white"
								: "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
						}`}
					>
						One-time code
					</button>
				</div>

				<form className="mt-4" onSubmit={method === "password" ? handlePasswordLogin : verifyLoginOtp}>
					<div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
						{error && (
							<div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded text-red-200 text-sm flex items-center gap-2">
								<Lock className="w-4 h-4" />
								{error}
							</div>
						)}
						{success && (
							<div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded text-green-200 text-sm">
								{success}
							</div>
						)}
						
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Email Address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>

							{method === "password" ? (
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										className="w-full rounded-md border bg-background/60 px-3 py-2 pr-10 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
									/>
									<button
										type="button"
										aria-label={showPassword ? "Hide password" : "Show password"}
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
									>
										{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
							</div>
							) : (
								<div className="space-y-2">
									<label htmlFor="otp" className="text-sm font-medium">
										One-time code (OTP)
									</label>
									<input
										id="otp"
										name="otp"
										type="text"
										inputMode="numeric"
										maxLength={6}
										value={otp}
										onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
										placeholder="123456"
										className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400 text-center tracking-widest"
										disabled={!otpSent}
									/>
									<div className="flex items-center justify-between text-xs text-white/70">
										<button
											type="button"
											onClick={sendLoginOtp}
											disabled={loading || countdown > 0}
											className="text-cyan-300 hover:text-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{otpSent ? (countdown > 0 ? `Resend in ${countdown}s` : "Resend code") : "Send code"}
										</button>
										<span>{otpSent ? "Code expires in 10 minutes" : "We’ll email you a 6-digit code"}</span>
									</div>
								</div>
							)}

							<button
								type="submit"
								disabled={loading || (method === "otp" && !otpSent)}
								className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-600 hover:to-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										{method === "otp" ? "Verifying..." : "Signing in..."}
									</>
								) : (
									<>
										<LogIn className="w-4 h-4 mr-2" />
										{method === "otp" ? "Verify & Sign In" : "Sign In"}
									</>
								)}
							</button>
							<div className="mt-3">
								<GoogleSignInButton label="Sign in with Google" />
							</div>
						</div>
					</div>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don't have an account?{" "}
					<Link href="/auth/register" className="font-medium text-primary hover:underline">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
