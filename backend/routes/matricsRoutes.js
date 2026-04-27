const express = require("express");
const { InfluxDB } = require("@influxdata/influxdb-client");

const router = express.Router();

const influx = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN
});

const queryApi = influx.getQueryApi(process.env.INFLUX_ORG);

function getMetricRoute(path, fieldName) {
  router.get(path, (req, res) => {
    const query = `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "ai_metrics")
        |> filter(fn: (r) => r._field == "${fieldName}")
    `;

    const data = [];

    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);

        data.push({
          time: o._time,
          value: o._value
        });
      },
      error(error) {
        console.error("Influx query error:", error);
        res.status(500).json({ error: error.message });
      },
      complete() {
        res.json(data);
      }
    });
  });
}

getMetricRoute("/response-time", "response_time_ms");
getMetricRoute("/tokens", "total_tokens");
getMetricRoute("/cpu", "cpu_usage_percent");
getMetricRoute("/memory", "memory_usage_percent");

module.exports = router;