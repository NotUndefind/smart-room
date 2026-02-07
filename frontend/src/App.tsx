import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SensorPayload {
  type: string;
  device: string;
  isLive: boolean;
  data: {
    temperature: number | string;
    humidity: number | string;
  };
  timestamp: number;
}

interface SensorEntry {
  payload: SensorPayload;
  receivedAt: Date;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function App() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [sensor, setSensor] = useState<SensorEntry | null>(null);
  const [history, setHistory] = useState<SensorEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      setStatus("connecting");
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const payload: SensorPayload = JSON.parse(event.data);
          const entry: SensorEntry = {
            payload,
            receivedAt: new Date(),
          };
          setSensor(entry);
          setHistory((prev) => [entry, ...prev].slice(0, 20));
        } catch {
          console.error("Failed to parse message:", event.data);
        }
      };

      ws.onerror = () => {
        console.error("WebSocket error");
      };

      ws.onclose = () => {
        setStatus("disconnected");
        wsRef.current = null;
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--cream-100)" }}
    >
      <div className="noise-overlay" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pt-16 pb-8 px-8"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="font-serif text-5xl md:text-6xl font-light tracking-tight"
                style={{ color: "var(--stone-900)" }}
              >
                Smart Room
              </h1>
              <p
                className="mt-2 text-sm tracking-wide"
                style={{ color: "var(--stone-600)" }}
              >
                Real-time IoT Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              {sensor && <LiveBadge isLive={sensor.payload.isLive} />}
              <ConnectionIndicator status={status} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6">
            {/* Device Info */}
            {sensor && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <DeviceBar
                  device={sensor.payload.device}
                  type={sensor.payload.type}
                  timestamp={sensor.payload.timestamp}
                />
              </motion.div>
            )}

            {/* Sensor Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <SensorCard
                label="Temperature"
                value={sensor?.payload.data.temperature ?? "—"}
                unit="C"
                icon="thermometer"
                accentColor="var(--coral-500)"
              />
              <SensorCard
                label="Humidity"
                value={sensor?.payload.data.humidity ?? "—"}
                unit="%"
                icon="droplet"
                accentColor="var(--success)"
              />
            </motion.div>

            {/* History */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DataHistory history={history} formatTime={formatTime} />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom accent line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--coral-400), transparent)",
          opacity: 0.3,
        }}
      />
    </div>
  );
}

/* ── Live Badge ── */
function LiveBadge({ isLive }: { isLive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        backgroundColor: isLive
          ? "rgba(107, 155, 122, 0.1)"
          : "rgba(201, 107, 82, 0.1)",
      }}
    >
      <div className="relative">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isLive ? "var(--success)" : "var(--error)",
          }}
          animate={isLive ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {isLive && (
          <motion.div
            className="absolute inset-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--success)" }}
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <span
        className="text-xs font-medium tracking-wide uppercase"
        style={{ color: isLive ? "var(--success)" : "var(--error)" }}
      >
        {isLive ? "Live" : "Mock"}
      </span>
    </motion.div>
  );
}

/* ── Connection Indicator ── */
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const statusConfig = {
    connecting: { color: "var(--warning)", text: "Connecting", pulse: true },
    connected: { color: "var(--success)", text: "Connected", pulse: false },
    disconnected: { color: "var(--error)", text: "Disconnected", pulse: true },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5 px-4 py-2 rounded-full"
      style={{ backgroundColor: "var(--cream-200)" }}
    >
      <div className="relative">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
          animate={config.pulse ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <span
        className="text-xs font-medium tracking-wide uppercase"
        style={{ color: "var(--stone-600)" }}
      >
        {config.text}
      </span>
    </motion.div>
  );
}

/* ── Device Bar ── */
function DeviceBar({
  device,
  type,
  timestamp,
}: {
  device: string;
  type: string;
  timestamp: number;
}) {
  const date = new Date(timestamp * 1000);

  return (
    <div
      className="flex items-center justify-between px-6 py-4 rounded-xl"
      style={{
        backgroundColor: "var(--cream-200)",
        borderLeft: "3px solid var(--coral-500)",
      }}
    >
      <div className="flex items-center gap-6">
        <div>
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--stone-600)" }}
          >
            Device
          </span>
          <p
            className="text-sm font-medium mt-0.5"
            style={{ color: "var(--stone-900)" }}
          >
            {device}
          </p>
        </div>
        <div
          className="w-px h-8"
          style={{ backgroundColor: "var(--cream-400)" }}
        />
        <div>
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--stone-600)" }}
          >
            Type
          </span>
          <p
            className="text-sm font-medium mt-0.5"
            style={{ color: "var(--stone-900)" }}
          >
            {type}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--stone-600)" }}
        >
          Last update
        </span>
        <p
          className="text-sm tabular-nums mt-0.5"
          style={{ color: "var(--stone-900)" }}
        >
          {date.toLocaleTimeString("fr-FR")}
        </p>
      </div>
    </div>
  );
}

/* ── Sensor Card ── */
function SensorCard({
  label,
  value,
  unit,
  icon,
  accentColor,
}: {
  label: string;
  value: number | string;
  unit: string;
  icon: "thermometer" | "droplet";
  accentColor: string;
}) {
  const displayValue =
    typeof value === "string" ? value.replace(/[^0-9.]/g, "") || value : value;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8"
      style={{
        backgroundColor: "var(--cream-50)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.04)",
      }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />

      {/* Icon */}
      <div className="absolute top-6 right-6 opacity-10">
        {icon === "thermometer" ? (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
          >
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
        ) : (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        )}
      </div>

      <div className="relative">
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--stone-600)" }}
        >
          {label}
        </span>

        <div className="mt-4 flex items-baseline gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={String(value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-5xl md:text-6xl font-light"
              style={{ color: "var(--stone-900)" }}
            >
              {displayValue}
            </motion.span>
          </AnimatePresence>
          <span
            className="text-xl font-light"
            style={{ color: "var(--stone-600)" }}
          >
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Data History ── */
function DataHistory({
  history,
  formatTime,
}: {
  history: SensorEntry[];
  formatTime: (date: Date) => string;
}) {
  if (history.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: "var(--cream-50)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        className="text-xs font-medium tracking-widest uppercase mb-6"
        style={{ color: "var(--stone-600)" }}
      >
        Recent Activity
      </h2>

      <div>
        <AnimatePresence initial={false}>
          {history.map((entry, index) => (
            <motion.div
              key={entry.receivedAt.getTime()}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-3 border-b"
              style={{
                borderColor: "var(--cream-300)",
                opacity: 1 - index * 0.04,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      index === 0 ? "var(--coral-500)" : "var(--cream-400)",
                  }}
                />
                <div className="flex items-center gap-6">
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: "var(--stone-800)" }}
                  >
                    {entry.payload.data.temperature}
                    <span style={{ color: "var(--stone-600)" }}> C</span>
                  </span>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: "var(--stone-800)" }}
                  >
                    {entry.payload.data.humidity}
                    <span style={{ color: "var(--stone-600)" }}> %</span>
                  </span>
                  {!entry.payload.isLive && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(201, 107, 82, 0.1)",
                        color: "var(--error)",
                      }}
                    >
                      mock
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--stone-600)" }}
                >
                  {entry.payload.device}
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "var(--stone-600)" }}
                >
                  {formatTime(entry.receivedAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
