import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function MetricsChart() {
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState("response-time");

  const metricConfig = {
    "response-time": {
      label: "Response Time (s)",
      endpoint: "response-time",
      format: (v) => Math.round((v / 1000) * 100) / 100,
      alertLimit: 10,
      alertMessage: "⚠️ Response time is high"
    },
    tokens: {
      label: "Tokens",
      endpoint: "tokens",
      format: (v) => v,
      alertLimit: 500,
      alertMessage: "⚠️ Token usage is high"
    },
    cpu: {
      label: "CPU Usage (%)",
      endpoint: "cpu",
      format: (v) => Math.round(v * 100) / 100,
      alertLimit: 80,
      alertMessage: "⚠️ CPU usage is high"
    },
    memory: {
      label: "Memory Usage (%)",
      endpoint: "memory",
      format: (v) => Math.round(v * 100) / 100,
      alertLimit: 80,
      alertMessage: "⚠️ Memory usage is high"
    }
  };

  const fetchMetrics = async () => {
    try {
      const config = metricConfig[metric];

      const response = await fetch(
        `http://localhost:5000/api/metrics/${config.endpoint}`
      );

      const result = await response.json();

      const formattedData = result.map((item) => ({
        time: new Date(item.time).toLocaleTimeString(),
        value: config.format(item.value)
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, [metric]);

  const values = data.map((d) => d.value);

  const avg = values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
    : 0;

  const max = values.length ? Math.max(...values) : 0;

  const latest = values.length ? values[values.length - 1] : 0;

  const currentConfig = metricConfig[metric];
  const showAlert = latest > currentConfig.alertLimit;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2 style={{ marginBottom: "15px" }}>
        {currentConfig.label}
      </h2>

      <div style={{ marginBottom: "15px" }}>
        {Object.keys(metricConfig).map((key) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            style={{
              marginRight: "10px",
              padding: "8px 14px",
              background: metric === key ? "#4f46e5" : "#e5e7eb",
              color: metric === key ? "white" : "#111",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            {metricConfig[key].label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <div style={cardStyle}>Avg: {avg}</div>
        <div style={cardStyle}>Max: {max}</div>
        <div style={cardStyle}>Latest: {latest}</div>
      </div>

      {showAlert && (
        <div style={alertStyle}>
          {currentConfig.alertMessage}
        </div>
      )}

      <ResponsiveContainer width="100%" height="65%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const cardStyle = {
  background: "#f3f4f6",
  padding: "10px 15px",
  borderRadius: "10px",
  fontWeight: "600",
  minWidth: "120px",
  textAlign: "center"
};

const alertStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "10px 15px",
  borderRadius: "8px",
  marginBottom: "12px",
  fontWeight: "700"
};

export default MetricsChart;