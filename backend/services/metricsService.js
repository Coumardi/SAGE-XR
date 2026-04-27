const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const si = require('systeminformation');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

class MetricsService {
    constructor() {
        this.metricsPath = path.join(__dirname, '../logs/metrics.csv');
        this.gpuInfo = null;
        this.lastCpuInfo = null;

        this.ensureMetricsFile();
        this.updateGpuInfo();

        // InfluxDB setup
        this.influx = new InfluxDB({
            url: process.env.INFLUX_URL,
            token: process.env.INFLUX_TOKEN
        });

        this.writeApi = this.influx.getWriteApi(
            process.env.INFLUX_ORG,
            process.env.INFLUX_BUCKET
        );
    }

    async updateGpuInfo() {
        try {
            const graphics = await si.graphics();

            if (graphics.controllers && graphics.controllers.length > 0) {
                const mainGpu = graphics.controllers[0];

                this.gpuInfo = {
                    model: mainGpu.model || 'Unknown',
                    memory: mainGpu.memoryTotal || 0,
                    vendor: mainGpu.vendor || 'Unknown'
                };
            }
        } catch (error) {
            console.error('Error getting GPU info:', error);

            this.gpuInfo = {
                model: 'Unknown',
                memory: 0,
                vendor: 'Unknown'
            };
        }
    }

    ensureMetricsFile() {
        const dir = path.dirname(this.metricsPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(this.metricsPath)) {
            const headers = [
                'timestamp',
                'model_name',
                'prompt',
                'prompt_tokens',
                'completion_tokens',
                'total_tokens',
                'response_time_ms',
                'tokens_per_second',
                'temperature',
                'cpu_model',
                'cpu_cores',
                'cpu_usage_percent',
                'cpu_speed',
                'total_memory_gb',
                'memory_usage_percent',
                'gpu_model',
                'gpu_vendor',
                'os'
            ].join(',') + '\n';

            fs.writeFileSync(this.metricsPath, headers);
        }
    }

    async collectMetrics(startTime, responseData, modelConfig, prompt) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        const metrics = {
            timestamp: new Date().toISOString(),
            model_name: modelConfig.model,
            prompt: prompt.replace(/,/g, ';').replace(/\n/g, ' '),

            prompt_tokens: responseData.usage?.prompt_tokens || 0,
            completion_tokens: responseData.usage?.completion_tokens || 0,
            total_tokens: responseData.usage?.total_tokens || 0,

            response_time_ms: Math.round(responseTime),

            tokens_per_second: responseData.usage?.total_tokens
                ? Math.round((responseData.usage.total_tokens / (responseTime / 1000)) * 100) / 100
                : 0,

            temperature: modelConfig.temperature,

            cpu_model: cpus[0].model.trim(),
            cpu_cores: cpus.length,
            cpu_usage_percent: Math.round(this.getCpuUsage(cpus) * 100) / 100,
            cpu_speed: cpus[0].speed,

            total_memory_gb: Math.round(totalMem / (1024 * 1024 * 1024)),
            memory_usage_percent: Math.round(((totalMem - freeMem) / totalMem) * 100),

            gpu_model: this.gpuInfo?.model || 'Unknown',
            gpu_vendor: this.gpuInfo?.vendor || 'Unknown',

            os: `${os.type()}-${os.release()}`
        };

        this.appendMetrics(metrics);
        this.writeToInflux(metrics);
    }

    getCpuUsage(currentCpus) {
        if (!this.lastCpuInfo) {
            this.lastCpuInfo = currentCpus;
            return 0;
        }

        let totalUsage = 0;

        for (let i = 0; i < currentCpus.length; i++) {
            const cpu = currentCpus[i];
            const lastCpu = this.lastCpuInfo[i];

            const idleDelta = cpu.times.idle - lastCpu.times.idle;

            const totalDelta = Object.keys(cpu.times).reduce((total, type) => {
                return total + (cpu.times[type] - lastCpu.times[type]);
            }, 0);

            const usage = totalDelta > 0
                ? ((totalDelta - idleDelta) / totalDelta) * 100
                : 0;

            totalUsage += usage;
        }

        this.lastCpuInfo = currentCpus;

        return totalUsage / currentCpus.length;
    }

    appendMetrics(metrics) {
        const line = [
            metrics.timestamp,
            metrics.model_name,
            metrics.prompt,
            metrics.prompt_tokens,
            metrics.completion_tokens,
            metrics.total_tokens,
            metrics.response_time_ms,
            metrics.tokens_per_second,
            metrics.temperature,
            metrics.cpu_model,
            metrics.cpu_cores,
            metrics.cpu_usage_percent,
            metrics.cpu_speed,
            metrics.total_memory_gb,
            metrics.memory_usage_percent,
            metrics.gpu_model,
            metrics.gpu_vendor,
            metrics.os
        ].join(',') + '\n';

        fs.appendFile(this.metricsPath, line, err => {
            if (err) console.error('Error writing metrics CSV:', err);
        });
    }

    writeToInflux(metrics) {
        try {
            const point = new Point('ai_metrics')
                .tag('model_name', metrics.model_name)
                .tag('gpu_vendor', metrics.gpu_vendor)
                .tag('os', metrics.os)

                .floatField('prompt_tokens', metrics.prompt_tokens)
                .floatField('completion_tokens', metrics.completion_tokens)
                .floatField('total_tokens', metrics.total_tokens)
                .floatField('response_time_ms', metrics.response_time_ms)
                .floatField('tokens_per_second', metrics.tokens_per_second)
                .floatField('temperature', metrics.temperature)
                .floatField('cpu_usage_percent', metrics.cpu_usage_percent)
                .floatField('memory_usage_percent', metrics.memory_usage_percent)
                .floatField('cpu_speed', metrics.cpu_speed)

                .intField('cpu_cores', metrics.cpu_cores)
                .intField('total_memory_gb', metrics.total_memory_gb);

            this.writeApi.writePoint(point);

            this.writeApi.flush().catch(error => {
                console.error('Error flushing InfluxDB metrics:', error);
            });

        } catch (error) {
            console.error('Error writing to InfluxDB:', error);
        }
    }

    async collectMetricsDuring(operation) {
        const metrics = [];

        const interval = setInterval(() => {
            const cpus = os.cpus();

            metrics.push({
                timestamp: new Date().toISOString(),
                cpu_usage_percent: this.getCpuUsage(cpus),
                memory_usage_percent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
            });
        }, 100);

        try {
            const result = await operation();
            clearInterval(interval);

            return {
                result,
                metrics
            };
        } catch (error) {
            clearInterval(interval);
            throw error;
        }
    }
}

module.exports = MetricsService;