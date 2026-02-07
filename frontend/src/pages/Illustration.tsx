import { motion } from "motion/react";

/*
 * Dot = un paquet de donnees qui s'accumule puis traverse la ligne.
 * Cycle de 6s :
 *   0-3s : le dot apparait et attend (accumulation)
 *   3-4.5s : le dot traverse vers l'autre cote
 *   4.5-6s : pause, reset
 */
function Dot({
	color,
	index,
	direction,
	delay,
}: {
	color: string;
	index: number;
	direction: "right" | "left";
	delay: number;
}) {
	const isRight = direction === "right";

	return (
		<motion.div
			animate={{
				// appear at start, then shoot across, then disappear
				x: isRight ? [0, 0, 0, 500, 500, 0] : [0, 0, 0, -500, -500, 0],
				opacity: [0, 1, 1, 1, 0, 0],
				scale: [0, 1, 1, 0.8, 0, 0],
			}}
			transition={{
				duration: 6,
				repeat: Infinity,
				delay: delay + index * 0.5,
				times: [0, 0.08, 0.45, 0.7, 0.75, 1],
				ease: "easeInOut",
			}}
			className="w-4 h-4 rounded-full shadow-lg"
			style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
		/>
	);
}

function Illustration() {
	return (
		<div className="bg-[#0a0a0a]">
			{/* ===== SECTION 1 : Architecture ===== */}
			<div className="h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

				<motion.h2
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-white/60 text-sm uppercase tracking-[0.3em] mb-12 font-mono"
				>
					Smart Room — Architecture
				</motion.h2>

				<div className="flex items-center gap-6 md:gap-10 relative z-10">
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex flex-col items-center gap-3"
					>
						<div className="w-28 h-28 rounded-2xl bg-linear-to-br from-green-500/20 to-green-600/5 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
							<div className="text-center">
								<div className="text-2xl mb-1">🔌</div>
								<span className="text-green-400 text-xs font-mono font-bold">
									ESP32
								</span>
							</div>
						</div>
						<span className="text-white/40 text-xs font-mono">
							Capteurs / LED
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scaleX: 0 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ duration: 0.4, delay: 0.5 }}
						className="flex flex-col items-center gap-1"
					>
						<span className="text-white/30 text-[10px] font-mono">
							MQTT
						</span>
						<div className="w-16 md:w-24 h-0.5 bg-linear-to-r from-green-500/50 to-orange-500/50 relative">
							<div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-orange-500/50 border-y-4 border-y-transparent" />
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
						className="flex flex-col items-center gap-3"
					>
						<div className="w-28 h-28 rounded-2xl bg-linear-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm">
							<div className="text-center">
								<div className="text-2xl mb-1">📡</div>
								<span className="text-orange-400 text-xs font-mono font-bold">
									MQTT
								</span>
							</div>
						</div>
						<span className="text-white/40 text-xs font-mono">
							Broker
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scaleX: 0 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ duration: 0.4, delay: 0.9 }}
						className="flex flex-col items-center gap-1"
					>
						<span className="text-white/30 text-[10px] font-mono">
							Subscribe
						</span>
						<div className="w-16 md:w-24 h-0.5 bg-linear-to-r from-orange-500/50 to-blue-500/50 relative">
							<div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-blue-500/50 border-y-4 border-y-transparent" />
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 1.0 }}
						className="flex flex-col items-center gap-3"
					>
						<div className="w-28 h-28 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
							<div className="text-center">
								<div className="text-2xl mb-1">🐍</div>
								<span className="text-blue-400 text-xs font-mono font-bold">
									Python
								</span>
							</div>
						</div>
						<span className="text-white/40 text-xs font-mono">
							WebSocket Server
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scaleX: 0 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ duration: 0.4, delay: 1.3 }}
						className="flex flex-col items-center gap-1"
					>
						<span className="text-white/30 text-[10px] font-mono">
							WS
						</span>
						<div className="w-16 md:w-24 h-0.5 bg-linear-to-r from-blue-500/50 to-purple-500/50 relative">
							<div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-purple-500/50 border-y-4 border-y-transparent" />
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 1.4 }}
						className="flex flex-col items-center gap-3"
					>
						<div className="w-28 h-28 rounded-2xl bg-linear-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
							<div className="text-center">
								<div className="text-2xl mb-1">⚛️</div>
								<span className="text-purple-400 text-xs font-mono font-bold">
									React
								</span>
							</div>
						</div>
						<span className="text-white/40 text-xs font-mono">
							Dashboard
						</span>
					</motion.div>
				</div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1.8 }}
					className="mt-16 text-white/20 text-xs font-mono"
				>
					smart-room / architecture
				</motion.p>
			</div>

			{/* ===== SECTION 2 : WebSocket ===== */}
			<div className="h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
				<div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-125 h-125 bg-cyan-400/10 rounded-full blur-[150px]" />
				<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400/8 rounded-full blur-[120px]" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-[120px]" />

				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-white text-lg uppercase tracking-[0.3em] mb-20 font-mono"
				>
					WebSocket
				</motion.h2>

				<div className="relative z-10 w-full max-w-2xl">
					<div className="flex items-center justify-between">
						{/* Frontend box */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="w-28 h-28 rounded-xl bg-purple-500/15 border border-purple-400/50 flex flex-col items-center justify-center shrink-0 backdrop-blur-sm"
						>
							<span className="text-purple-300 text-sm font-mono font-bold">
								Frontend
							</span>
						</motion.div>

						{/* Middle : connection line + dots */}
						<div className="flex-1 flex flex-col items-center gap-8 mx-6 relative">
							{/* Persistent line */}
							<motion.div
								initial={{ scaleX: 0 }}
								whileInView={{ scaleX: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8 }}
								className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-white/20 origin-left"
							/>

							{/* ws:// label */}
							<motion.span
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.5 }}
								className="text-cyan-300 text-xs font-mono mb-2"
							>
								ws://
							</motion.span>

							{/* Row 1: Frontend → Backend (dots going right) */}
							<div className="flex gap-3 items-center self-start">
								<Dot
									color="#c4b5fd"
									index={0}
									direction="right"
									delay={0}
								/>
								<Dot
									color="#c4b5fd"
									index={1}
									direction="right"
									delay={0}
								/>
								<Dot
									color="#c4b5fd"
									index={2}
									direction="right"
									delay={0}
								/>
							</div>

							{/* Row 2: Backend → Frontend (dots going left) */}
							<div className="flex gap-3 items-center self-end">
								<Dot
									color="#93c5fd"
									index={0}
									direction="left"
									delay={3}
								/>
								<Dot
									color="#93c5fd"
									index={1}
									direction="left"
									delay={3}
								/>
								<Dot
									color="#93c5fd"
									index={2}
									direction="left"
									delay={3}
								/>
							</div>
						</div>

						{/* Backend box */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="w-28 h-28 rounded-xl bg-blue-500/15 border border-blue-400/50 flex flex-col items-center justify-center shrink-0 backdrop-blur-sm"
						>
							<span className="text-blue-300 text-sm font-mono font-bold">
								Backend
							</span>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Illustration;
