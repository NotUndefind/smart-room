import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SensorData {
  topic: string;
  payload: string;
  timestamp: Date;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function App() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      setStatus("connected");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newData: SensorData = {
          topic: data.topic || "unknown",
          payload: data.payload || event.data,
          timestamp: new Date(),
        };
        setSensorData(newData);
        setDataHistory((prev) => [newData, ...prev].slice(0, 10));
      } catch {
        const newData: SensorData = {
          topic: "raw",
          payload: event.data,
          timestamp: new Date(),
        };
        setSensorData(newData);
        setDataHistory((prev) => [newData, ...prev].slice(0, 10));
      }
    };

    ws.onerror = () => {
      console.error("WebSocket error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getTopicName = (topic: string) => {
    const parts = topic.split("/");
    return parts[parts.length - 1] || topic;
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--cream-100)" }}
    >
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pt-16 pb-8 px-8"
      >
        <div className="max-w-4xl mx-auto">
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

            {/* Connection Status */}
            <ConnectionIndicator status={status} />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Primary Sensor Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SensorCard data={sensorData} />
            </motion.div>

            {/* Data History */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DataHistory
                history={dataHistory}
                formatTime={formatTime}
                getTopicName={getTopicName}
              />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Subtle decorative element */}
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

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const statusConfig = {
    connecting: {
      color: "var(--warning)",
      text: "Connecting",
      pulse: true,
    },
    connected: {
      color: "var(--success)",
      text: "Connected",
      pulse: false,
    },
    disconnected: {
      color: "var(--error)",
      text: "Disconnected",
      pulse: true,
    },
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
        {config.pulse && (
          <motion.div
            className="absolute inset-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: config.color }}
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
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

function SensorCard({ data }: { data: SensorData | null }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 md:p-10"
      style={{
        backgroundColor: "var(--cream-50)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.04)",
      }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, var(--coral-400) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "var(--stone-600)" }}
            >
              Latest Reading
            </span>
            <AnimatePresence mode="wait">
              {data ? (
                <motion.div
                  key={data.topic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1"
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--coral-500)" }}
                  >
                    {data.topic}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1"
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--stone-600)" }}
                  >
                    Waiting for data...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {data && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs tabular-nums"
              style={{ color: "var(--stone-600)" }}
            >
              {data.timestamp.toLocaleTimeString("fr-FR")}
            </motion.span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              key={data.payload + data.timestamp.getTime()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <p
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight"
                style={{ color: "var(--stone-900)" }}
              >
                {data.payload}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="h-16 flex items-center"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--cream-400)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DataHistory({
  history,
  formatTime,
  getTopicName,
}: {
  history: SensorData[];
  formatTime: (date: Date) => string;
  getTopicName: (topic: string) => string;
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

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {history.map((item, index) => (
            <motion.div
              key={item.timestamp.getTime()}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-3 border-b"
              style={{
                borderColor: "var(--cream-300)",
                opacity: 1 - index * 0.08,
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
                <div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--stone-800)" }}
                  >
                    {item.payload}
                  </span>
                  <span
                    className="ml-3 text-xs"
                    style={{ color: "var(--stone-600)" }}
                  >
                    {getTopicName(item.topic)}
                  </span>
                </div>
              </div>
              <span
                className="text-xs tabular-nums"
                style={{ color: "var(--stone-600)" }}
              >
                {formatTime(item.timestamp)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
