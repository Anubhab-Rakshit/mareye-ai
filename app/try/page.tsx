import Link from "next/link";
import { VideoBackground } from "@/components/video-background";

export default function TryPage() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950">
			<VideoBackground />
			
			{/* Animated header with floating data metrics */}

			<div className="absolute top-0 left-0 right-0 h-32 z-20">

				<div className="relative w-full h-full">
					{/* Flowing data streams */}
					<div className="absolute inset-0 overflow-hidden">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={`stream-${i}`}
								className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-pulse"
								style={{
									top: `${20 + i * 15}%`,
									left: `-100%`,
									width: "200%",
									animationDelay: `${i * 0.8}s`,
									animationDuration: `${4 + i}s`,
									transform: `translateX(${Math.sin(i) * 50}px)`,
								}}
							/>
						))}

					</div>


					{/* Ocean depth indicator */}
					<div className="absolute top-4 right-8">
						<div className="relative bg-slate-900/40 backdrop-blur-sm border border-blue-400/20 rounded-lg px-4 py-3">
							<div className="text-xs text-blue-300 font-medium mb-2">Ocean Depth</div>
							<div className="flex items-center space-x-3">
								<div className="relative w-2 h-16 bg-slate-700 rounded-full overflow-hidden">
									<div
										className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full animate-pulse"
										style={{ height: "75%", animationDuration: "3s" }}
									/>
								</div>
								<div>
									<div className="text-lg font-bold text-blue-100">3,847m</div>
									<div className="text-xs text-blue-300">Abyssal Zone</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Animated constellation network */}
			<div className="absolute top-0 left-0 right-0 h-96 z-10">
				<svg className="w-full h-full" viewBox="0 0 1200 400">
					{/* Connection lines */}
					{Array.from({ length: 12 }).map((_, i) => {
						const x1 = i * 100 + Math.sin(i) * 50
						const y1 = 50 + Math.cos(i) * 30
						const x2 = (i + 1) * 100 + Math.sin(i + 1) * 50
						const y2 = 50 + Math.cos(i + 1) * 30
						return (
							<line
								key={`line-${i}`}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								stroke="rgba(6,182,212,0.3)"
								strokeWidth="1"
								className="animate-pulse"
								style={{ animationDelay: `${i * 0.2}s`, animationDuration: "4s" }}
							/>
						)
					})}

					{/* Network nodes */}
					{Array.from({ length: 15 }).map((_, i) => {
						const x = i * 80 + Math.sin(i * 0.5) * 40
						const y = 50 + Math.cos(i * 0.3) * 25
						return (
							<g key={`node-${i}`}>
								<circle
									cx={x}
									cy={y}
									r="3"
									fill="rgba(6,182,212,0.6)"
									className="animate-pulse"
									style={{ animationDelay: `${i * 0.15}s` }}
								/>
								<circle
									cx={x}
									cy={y}
									r="8"
									fill="none"
									stroke="rgba(6,182,212,0.2)"
									strokeWidth="1"
									className="animate-ping"
									style={{ animationDelay: `${i * 0.15}s`, animationDuration: "3s" }}
								/>
							</g>
						)
					})}
				</svg>
			</div>

			{/* Floating marine life silhouettes */}
			<div className="absolute inset-0 z-5">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={`marine-${i}`}
						className="absolute opacity-20"
						style={{
							left: `${Math.random() * 90}%`,
							top: `${Math.random() * 60 + 10}%`,
							animationDelay: `${Math.random() * 10}s`,
						}}
					>
						<div
							className="w-8 h-4 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-pulse transform"
							style={{
								animationDuration: `${Math.random() * 4 + 3}s`,
								transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
							}}
						/>
					</div>
				))}
			</div>

			{/* System status indicators */}
			<div className="absolute top-32 left-4 z-20">
				<div className="space-y-2">
					{[
						{ name: "AI Processing", status: "Active", color: "green" },
						{ name: "Analysis Engine", status: "Running", color: "cyan" },
					].map((system, i) => (
						<div key={system.name} className="flex items-center space-x-2 text-xs">
							<div
								className={`w-2 h-2 bg-${system.color}-400 rounded-full animate-pulse`}
								style={{ animationDelay: `${i * 0.5}s` }}
							/>
							<span className="text-slate-300 font-medium">{system.name}</span>
							<span className={`text-${system.color}-300`}>{system.status}</span>
						</div>
					))}
				</div>
			</div>

			{/* Environmental readings */}
			<div className="absolute top-36 right-5 z-5">
				<div className="bg-slate-900/30 backdrop-blur-sm border border-teal-400/20 rounded-lg p-3">
					<div className="text-xs text-teal-300 font-medium mb-2">Environmental Data</div>
					<div className="space-y-1 text-xs">
						<div className="flex justify-between">
							<span className="text-slate-300">Temperature:</span>
							<span className="text-teal-200 animate-pulse">2.1°C</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-300">Pressure:</span>
							<span className="text-blue-200 animate-pulse">384 atm</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-300">Salinity:</span>
							<span className="text-cyan-200 animate-pulse">34.7 ppt</span>
						</div>
					</div>
				</div>
			</div>

			{/* Deep ocean current effect */}
			<div className="absolute inset-0 opacity-30">
				<div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"
					style={{ animationDuration: "8s" }}
				></div>
				<div
					className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-500/5 to-transparent animate-pulse"
					style={{ animationDuration: "12s", animationDelay: "2s" }}
				></div>
			</div>

			{/* Enhanced particle system with multiple types */}
			<div className="absolute inset-0">
				{/* Micro particles */}
				{Array.from({ length: 80 }).map((_, i) => (
					<div
						key={`micro-${i}`}
						className="absolute rounded-full bg-cyan-400/30 animate-pulse"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							width: `${Math.random() * 4 + 1}px`,
							height: `${Math.random() * 4 + 1}px`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${Math.random() * 4 + 3}s`,
						}}
					/>
				))}

				{/* Medium floating particles */}
				{Array.from({ length: 25 }).map((_, i) => (
					<div
						key={`medium-${i}`}
						className="absolute rounded-full bg-gradient-to-r from-cyan-300/20 to-blue-300/20 animate-bounce"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							width: `${Math.random() * 12 + 6}px`,
							height: `${Math.random() * 12 + 6}px`,
							animationDelay: `${Math.random() * 6}s`,
							animationDuration: `${Math.random() * 5 + 4}s`,
						}}
					/>
				))}
			</div>

			{/* Enhanced floating orbs with glow effects */}
			<div className="absolute inset-0">
				{Array.from({ length: 12 }).map((_, i) => (
					<div
						key={`orb-${i}`}
						className="absolute rounded-full bg-gradient-to-r from-cyan-400/15 via-blue-400/10 to-teal-400/15 blur-2xl animate-pulse"
						style={{
							left: `${Math.random() * 90}%`,
							top: `${Math.random() * 90}%`,
							width: `${Math.random() * 300 + 150}px`,
							height: `${Math.random() * 300 + 150}px`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${Math.random() * 10 + 8}s`,
							transform: `rotate(${Math.random() * 360}deg)`,
						}}
					/>
				))}
			</div>

			<div className="absolute inset-0 opacity-20">
				<svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
					<path
						d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
						fill="url(#wave1)"
						className="animate-pulse"
						style={{ animationDuration: "6s" }}
					/>
					<path
						d="M0,500 Q400,400 800,500 T1200,500 L1200,800 L0,800 Z"
						fill="url(#wave2)"
						className="animate-pulse"
						style={{ animationDuration: "8s", animationDelay: "1s" }}
					/>
					<defs>
						<linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stopColor="rgba(6,182,212,0.1)" />
							<stop offset="100%" stopColor="rgba(6,182,212,0.05)" />
						</linearGradient>
						<linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
							<stop offset="100%" stopColor="rgba(59,130,246,0.03)" />
						</linearGradient>
					</defs>
				</svg>
			</div>

			{/* Main content */}
			<div className="relative z-15 flex min-h-screen items-center justify-center px-15">
				<div className="text-center max-w-5xl mx-auto">
						<div className="mb-15 flex items-center justify-center">
							<div className="relative flex items-center space-x-5">
								<div className="relative">
									<div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-lg opacity-60 animate-pulse"></div>
									<div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl">
										<div
											className="w-8 h-8 rounded-full bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm animate-spin"
											style={{ animationDuration: "8s" }}
										></div>
									</div>
								</div>
								<div className="text-left">
									<h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 animate-pulse">
										AI-Driven
									</h3>
									<p className="text-lg text-cyan-200/90 font-medium">MarEye</p>
								</div>
							</div>
						</div>

					<div className="mb-8 relative z-20">
						<h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-cyan-200 mb-2 leading-none tracking-tight drop-shadow-lg">
							<span className="inline-block animate-pulse" style={{ animationDelay: "0s" }}>
								Mar
							</span>{" "}
							<span className="inline-block animate-pulse" style={{ animationDelay: "0.2s" }}>
								Eye
							</span>
						</h1>
						<h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-blue-300 mb-2 leading-none drop-shadow-lg">
							<span className="inline-block animate-pulse" style={{ animationDelay: "0.4s" }}>
								Marine
							</span>
						</h2>
						<h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-teal-300 leading-tight drop-shadow-lg">
							<span className="inline-block animate-pulse" style={{ animationDelay: "0.6s" }}>
								Security
							</span>{" "}
							<span className="inline-block animate-pulse" style={{ animationDelay: "0.8s" }}>
								Platform
							</span>
						</h3>
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent blur-xl"></div>
						<p className="relative text-2xl md:text-3xl text-blue-100/95 max-w-4xl mx-auto leading-relaxed font-light text-balance">
							Revolutionizing marine security through{" "}
							<span className="text-cyan-300 font-medium">advanced AI-powered</span> submarine detection,
							mine identification, and <span className="text-teal-300 font-medium">threat assessment</span> for
							underwater defense systems.
						</p>
					</div>

					{/* Marine security feature cards */}
					<div className="grid gap-6 md:grid-cols-2 mb-16">
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-xl blur-xl animate-pulse"></div>
							<div className="relative rounded-xl border border-cyan-400/20 bg-slate-900/40 backdrop-blur-sm p-6 shadow-sm hover:border-cyan-400/40 transition-all duration-300">
								<div className="flex items-center space-x-3 mb-3">
									<div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
									<h2 className="text-xl font-semibold text-cyan-100">Submarine Detection</h2>
								</div>
								<p className="text-sm text-cyan-200/80">
									Advanced AI-powered detection systems for identifying submarines and underwater vehicles using sonar and visual recognition.
								</p>
							</div>
						</div>
						
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-teal-400/10 rounded-xl blur-xl animate-pulse"></div>
							<div className="relative rounded-xl border border-blue-400/20 bg-slate-900/40 backdrop-blur-sm p-6 shadow-sm hover:border-blue-400/40 transition-all duration-300">
								<div className="flex items-center space-x-3 mb-3">
									<div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
									<h2 className="text-xl font-semibold text-blue-100">Mine Identification</h2>
								</div>
								<p className="text-sm text-blue-200/80">
									Intelligent mine detection and classification systems for underwater explosive threat assessment and neutralization.
								</p>
							</div>
						</div>
						
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 rounded-xl blur-xl animate-pulse"></div>
							<div className="relative rounded-xl border border-teal-400/20 bg-slate-900/40 backdrop-blur-sm p-6 shadow-sm hover:border-teal-400/40 transition-all duration-300">
								<div className="flex items-center space-x-3 mb-3">
									<div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></div>
									<h2 className="text-xl font-semibold text-teal-100">Diver Tracking</h2>
								</div>
								<p className="text-sm text-teal-200/80">
									Real-time diver monitoring and tracking systems for underwater security operations and threat assessment.
								</p>
							</div>
						</div>
						
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-xl blur-xl animate-pulse"></div>
							<div className="relative rounded-xl border border-cyan-400/20 bg-slate-900/40 backdrop-blur-sm p-6 shadow-sm hover:border-cyan-400/40 transition-all duration-300">
								<div className="flex items-center space-x-3 mb-3">
									<div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
									<h2 className="text-xl font-semibold text-cyan-100">Threat Assessment</h2>
								</div>
								<p className="text-sm text-cyan-200/80">
									Comprehensive threat analysis and risk evaluation systems for marine security operations and defense planning.
								</p>
							</div>
						</div>
					</div>


					<div className="relative mb-16">
						{/* Outer glow ring */}
						<div className="absolute inset-0 -m-4">

							<div
								className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-teal-400/20 blur-2xl animate-pulse"
								style={{ animationDuration: "3s" }}
							></div>
						</div>

						{/* Middle glow */}

						<div className="absolute inset-0 -m-2">

							<div
								className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-500/30 blur-xl animate-pulse"
								style={{ animationDuration: "2s", animationDelay: "0.5s" }}
							></div>
						</div>


						{/* Button - keeping your original link */}
						<Link
							href="/"
							className="relative inline-flex items-center px-16 py-6 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 rounded-full shadow-2xl hover:from-cyan-400 hover:via-blue-500 hover:to-teal-400 transition-all duration-500 transform hover:scale-110 hover:shadow-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 group overflow-hidden"

						>
							{/* Button inner glow */}
							<div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>


							<span className="relative mr-4 tracking-wide">Get started</span>
							<svg
								className="relative w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110"

								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>

							{/* Animated border */}
							<div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
						</Link>
					</div>

					<div className="flex justify-center">
						<div className="flex space-x-3">
							{Array.from({ length: 7 }).map((_, i) => (
								<div key={i} className="relative">
									<div
										className="w-3 h-3 rounded-full bg-cyan-400/60 animate-pulse"
										style={{ animationDelay: `${i * 0.15}s` }}
									></div>
									<div
										className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400/30 animate-ping"
										style={{ animationDelay: `${i * 0.15 + 1}s`, animationDuration: "2s" }}
									></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div
				className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none animate-pulse"
				style={{ animationDuration: "4s" }}
			></div>

			<div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/20 pointer-events-none"></div>
		</div>
	);
}
