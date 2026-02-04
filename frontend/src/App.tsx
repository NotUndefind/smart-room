import { useEffect, useRef, useState } from "react";
function App() {
	const [message, setMessage] = useState("");

	// Création du WebSocket
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		wsRef.current = new WebSocket("ws://localhost:8080");
		wsRef.current.onopen = () => {
			console.log("WebSocket connection established");
		};

		wsRef.current.onmessage = (event) => {
			console.log("Received message:", event.data);
		};

		wsRef.current.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	}, []);

	function sendMessage(): void {
		wsRef.current?.send(message);
	}

	// --- RENDU JSX ---
	return (
		<div className="app-container text-white justify-center items-center flex flex-col gap-4 h-screen">
			<h1>Smart Room</h1>
			<div className="flex gap-2">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Message..."
					className="px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white outline-none focus:border-blue-500"
				/>
				<button
					onClick={() => sendMessage()}
					className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
				>
					Envoyer
				</button>
			</div>
		</div>
	);
}

export default App;
