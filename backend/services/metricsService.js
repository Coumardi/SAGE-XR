const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const si = require('systeminformation');

class MetricsService {
    constructor() {
        this.metricsPath = path.join(__dirname, '../logs/metrics.csv');
        this.gpuInfo = null;
        this.ensureMetricsFile();
        // Cache GPU info on startup
        this.updateGpuInfo();
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
            prompt: prompt.replace(/,/g, ';').replace(/\n/g, ' '), // Sanitize prompt for CSV
            prompt_tokens: responseData.usage?.prompt_tokens || 0,
            completion_tokens: responseData.usage?.completion_tokens || 0,
            total_tokens: responseData.usage?.total_tokens || 0,
            response_time_ms: Math.round(responseTime),
            tokens_per_second: responseData.usage?.total_tokens ? 
                Math.round((responseData.usage.total_tokens / (responseTime / 1000)) * 100) / 100 : 0,
            temperature: modelConfig.temperature,
            cpu_model: cpus[0].model.trim(),
            cpu_cores: cpus.length,
            cpu_usage: Math.round(this.getCpuUsage(cpus) * 100) / 100,
            cpu_speed: cpus[0].speed,
            total_memory_gb: Math.round(totalMem / (1024 * 1024 * 1024)),
            memory_usage_percent: Math.round(((totalMem - freeMem) / totalMem) * 100),
            gpu_model: this.gpuInfo?.model || 'Unknown',
            gpu_vendor: this.gpuInfo?.vendor || 'Unknown',
            os: `${os.type()}-${os.release()}`
        };

        this.appendMetrics(metrics);
    }

    getCpuUsage(cpus) {
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        return 100 - (totalIdle / totalTick * 100);
    }

    appendMetrics(metrics) {
        // Write asynchronously to avoid blocking
        const line = Object.values(metrics).join(',') + '\n';
        fs.appendFile(this.metricsPath, line, err => {
            if (err) console.error('Error writing metrics:', err);
        });
    }
}

// Export the class instead of an instance
module.exports = MetricsService; 