"use client";

export function VideoBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			<video
				autoPlay
				loop
				muted
				playsInline
				className="absolute inset-0 w-full h-full object-cover"
			>
				<source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/files-blob/MarEye-SIH-enchance/public/Underwater%20loop%20background.-VLfqbz13foEn193Hm4agdC8jIBW7LP.mp4" type="video/mp4" />
			</video>
			<div className="absolute inset-0 bg-black/40" />
		</div>
	);
}
