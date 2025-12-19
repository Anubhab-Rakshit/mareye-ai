"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoBackground } from "@/components/video-background";
import { useState, useEffect } from "react";
import { Mail, Shield, ArrowLeft, CheckCircle, User, Upload } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-signin-button";

export default function RegisterPage() {
	const router = useRouter();
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [step, setStep] = useState<'form' | 'otp'>('form');
	const [userData, setUserData] = useState<any>(null);
	const [otp, setOtp] = useState('');
	const [countdown, setCountdown] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Countdown timer for resend OTP
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	async function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		const form = new FormData(e.currentTarget);
		let avatar = "";
		const file = form.get("avatar");
		if (file && file instanceof File && file.size > 0) {
			avatar = await fileToBase64(file);
		}

		const firstName = String(form.get("firstName") || "");
		const lastName = String(form.get("lastName") || "");
		const dob = String(form.get("dob") || "");
		const email = String(form.get("email") || "");
		const confirmEmail = String(form.get("confirmEmail") || "");
		const password = String(form.get("password") || "");
		const confirmPassword = String(form.get("confirmPassword") || "");

		// Validation
		if (email !== confirmEmail) {
			setError("Emails do not match");
			setLoading(false);
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		// Prepare user data for OTP verification
		const userData = {
			username: `${firstName} ${lastName}`,
			email,
			password,
			firstName,
			lastName,
			dob,
			avatar,
		};

		try {
			// Send OTP for email verification
			const response = await fetch("/api/send-otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					email, 
					type: 'registration',
					userData 
				}),
			});

			let data;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error("Failed to parse response as JSON:", parseError);
				throw new Error("Server returned invalid response. Please try again.");
			}

			if (!response.ok) {
				throw new Error(data?.message || `Server error: ${response.status}`);
			}

			setUserData(userData);
			setStep('otp');
			setSuccess("OTP sent successfully! Check your email.");
			setCountdown(30);
		} catch (err) {
			console.error("Send OTP error:", err);
			setError(err instanceof Error ? err.message : "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	}

	async function verifyOTP(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		if (!otp || otp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/verify-otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					email: userData?.email, 
					otp, 
					type: 'registration' 
				}),
			});

			let data;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error("Failed to parse response as JSON:", parseError);
				throw new Error("Server returned invalid response. Please try again.");
			}

			if (!response.ok) {
				throw new Error(data?.message || `Server error: ${response.status}`);
			}

			// Store user data in localStorage for navigation
			if (data.user) {
				localStorage.setItem("profile", JSON.stringify(data.user));
			}

			setSuccess("Registration successful! Redirecting to dashboard...");
			setTimeout(() => {
				router.push("/profile");
			}, 2000);
		} catch (err) {
			console.error("Verify OTP error:", err);
			setError(err instanceof Error ? err.message : "OTP verification failed");
		} finally {
			setLoading(false);
		}
	}

	async function resendOTP() {
		if (countdown > 0 || !userData) {
			return;
		}
		
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/send-otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					email: userData.email, 
					type: 'registration',
					userData 
				}),
			});

			let data;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error("Failed to parse response as JSON:", parseError);
				throw new Error("Server returned invalid response. Please try again.");
			}

			if (!response.ok) {
				throw new Error(data?.message || `Server error: ${response.status}`);
			}

			setSuccess("OTP resent successfully!");
			setCountdown(30);
		} catch (err) {
			console.error("Resend OTP error:", err);
			setError(err instanceof Error ? err.message : "Failed to resend OTP");
		} finally {
			setLoading(false);
		}
	}

	function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const url = URL.createObjectURL(file);
		setAvatarPreview(url);
	}

	return (
		<div className="relative min-h-screen w-full text-foreground">
			<VideoBackground />
			<div className="relative z-10 mx-auto max-w-md px-6 py-16">
				{step === 'form' ? (
					<>
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<User className="w-8 h-8 text-white" />
							</div>
							<h1 className="text-3xl font-semibold">Create your account</h1>
							<p className="mt-2 text-sm text-muted-foreground">
								Fill in your details to get started with OTP verification
							</p>
						</div>

						<form className="mt-8" onSubmit={onSubmit}>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
								{error && (
									<div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded text-red-200 text-sm flex items-center gap-2">
										<Shield className="w-4 h-4" />
										{error}
									</div>
								)}
								{success && (
									<div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded text-green-200 text-sm flex items-center gap-2">
										<CheckCircle className="w-4 h-4" />
										{success}
									</div>
								)}
								
								<div className="space-y-4">
									<label className="text-sm font-medium block">Upload avatar</label>
									<div className="flex items-center gap-4">
										<div 
											className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-colors"
											onClick={() => document.getElementById('avatar')?.click()}
										>
											{avatarPreview ? (
												<img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
											) : (
												<Upload className="w-8 h-8 text-white/70" />
											)}
										</div>
										<div className="flex-1">
											<label 
												htmlFor="avatar" 
												className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 rounded-lg cursor-pointer transition-colors text-sm font-medium"
											>
												<Upload className="w-4 h-4 mr-2" />
												Choose File
											</label>
											<input 
												id="avatar" 
												name="avatar" 
												type="file" 
												accept="image/*" 
												onChange={onAvatarChange} 
												className="hidden"
											/>
											<p className="text-xs text-white/60 mt-2">JPG/PNG, up to ~2MB recommended.</p>
										</div>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2 mt-6">
									<div className="space-y-2">
										<label htmlFor="firstName" className="text-sm font-medium">
											First name
										</label>
										<input
											id="firstName"
											name="firstName"
											type="text"
											required
											placeholder="John"
											className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="lastName" className="text-sm font-medium">
											Last name
										</label>
										<input
											id="lastName"
											name="lastName"
											type="text"
											required
											placeholder="Doe"
											className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
										/>
									</div>
								</div>

								<div className="space-y-2 mt-4">
									<label htmlFor="dob" className="text-sm font-medium">
										Date of birth
									</label>
									<input
										id="dob"
										name="dob"
										type="date"
										required
										className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
									/>
								</div>

								<div className="space-y-4 mt-4">
									<div className="space-y-2">
										<label htmlFor="email" className="text-sm font-medium">
											Email
										</label>
										<input
											id="email"
											name="email"
											type="email"
											required
											placeholder="you@example.com"
											className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="confirmEmail" className="text-sm font-medium">
											Confirm email
										</label>
										<input
											id="confirmEmail"
											name="confirmEmail"
											type="email"
											required
											placeholder="you@example.com"
											className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
										/>
									</div>
								</div>

								<div className="space-y-4 mt-4">
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
												placeholder="••••••••"
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
									<div className="space-y-2">
										<label htmlFor="confirmPassword" className="text-sm font-medium">
											Confirm password
										</label>
										<div className="relative">
											<input
												id="confirmPassword"
												name="confirmPassword"
												type={showConfirmPassword ? "text" : "password"}
												required
												placeholder="••••••••"
												className="w-full rounded-md border bg-background/60 px-3 py-2 pr-10 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
											/>
											<button
												type="button"
												aria-label={showConfirmPassword ? "Hide password" : "Show password"}
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
											>
												{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-600 hover:to-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Sending OTP...
										</>
									) : (
										<>
											<Mail className="w-4 h-4 mr-2" />
											Send OTP & Register
										</>
									)}
								</button>
								<div className="mt-3">
									<GoogleSignInButton label="Continue with Google" />
								</div>
							</div>
						</form>
					</>
				) : (
					<>
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Shield className="w-8 h-8 text-white" />
							</div>
							<h1 className="text-3xl font-semibold">Verify Your Email</h1>
							<p className="mt-2 text-sm text-muted-foreground">
								We've sent a 6-digit code to <strong>{userData?.email}</strong>
							</p>
						</div>

						<form className="mt-8" onSubmit={verifyOTP}>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
								{error && (
									<div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded text-red-200 text-sm flex items-center gap-2">
										<Shield className="w-4 h-4" />
										{error}
									</div>
								)}
								{success && (
									<div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded text-green-200 text-sm flex items-center gap-2">
										<CheckCircle className="w-4 h-4" />
										{success}
									</div>
								)}
								<div className="space-y-4">
									<div className="space-y-2">
										<label htmlFor="otp" className="text-sm font-medium">
											Enter 6-digit OTP
										</label>
										<input
											id="otp"
											name="otp"
											type="text"
											required
											maxLength={6}
											value={otp}
											onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
											placeholder="123456"
											className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400 text-center text-2xl tracking-widest"
										/>
									</div>

									<div className="flex items-center justify-between text-sm">
										<button
											type="button"
											onClick={() => setStep('form')}
											className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
										>
											<ArrowLeft className="w-4 h-4" />
											Back to Form
										</button>
										<button
											type="button"
											onClick={resendOTP}
											disabled={countdown > 0 || loading}
											className="text-cyan-300 hover:text-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
										</button>
									</div>

									<button
										type="submit"
										disabled={loading || otp.length !== 6}
										className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-600 hover:to-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Verifying...
											</>
										) : (
											<>
												<CheckCircle className="w-4 h-4 mr-2" />
												Verify & Complete Registration
											</>
										)}
									</button>
								</div>
							</div>
						</form>
					</>
				)}

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/auth/login" className="font-medium text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
