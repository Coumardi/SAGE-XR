const fs = require('fs');
const os = require('os');
const path = require('path');
const si = require('systeminformation');
const MetricsService = require('../services/metricsService');

// Mock dependencies
jest.mock('fs');
jest.mock('os');
jest.mock('systeminformation');
jest.mock('perf_hooks', () => ({
    performance: {
        now: jest.fn(() => 1000)
    }
}));

describe('MetricsService', () => {
    let metricsService;
    const createMockCpuInfo = (times) => ({
        model: 'Test CPU',
        speed: 3000,
        times: times
    });

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock fs.existsSync to return false so ensureMetricsFile creates the file
        fs.existsSync = jest.fn().mockReturnValue(false);

        // Mock OS functions
        os.cpus.mockReturnValue(Array(4).fill(createMockCpuInfo({
            user: 100,
            nice: 0,
            sys: 50,
            idle: 200,
            irq: 0
        })));
        os.totalmem.mockReturnValue(16000000000); // 16GB
        os.freemem.mockReturnValue(8000000000);  // 8GB
        os.type.mockReturnValue('Windows_NT');
        os.release.mockReturnValue('10.0.0');

        // Mock systeminformation graphics call
        si.graphics.mockResolvedValue({
            controllers: [{
                model: 'Test GPU',
                vendor: 'Test Vendor',
                memoryTotal: 8000
            }]
        });

        // Create new instance for each test
        metricsService = new MetricsService();
    });

    test('constructor creates metrics file if it doesn\'t exist', () => {
        expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('timestamp,model_name,prompt,prompt_tokens')
        );
    });

    test('updateGpuInfo fetches and stores GPU information', async () => {
        await metricsService.updateGpuInfo();
        
        expect(si.graphics).toHaveBeenCalled();
        expect(metricsService.gpuInfo).toEqual({
            model: 'Test GPU',
            memory: 8000,
            vendor: 'Test Vendor'
        });
    });

    test('updateGpuInfo handles errors gracefully', async () => {
        si.graphics.mockRejectedValueOnce(new Error('GPU info failed'));
        
        await metricsService.updateGpuInfo();
        
        expect(metricsService.gpuInfo).toEqual({
            model: 'Unknown',
            memory: 0,
            vendor: 'Unknown'
        });
    });

    test('getCpuUsage returns 0 on first call', () => {
        const firstCpuInfo = Array(4).fill(createMockCpuInfo({
            user: 100,
            nice: 0,
            sys: 50,
            idle: 200,
            irq: 0
        }));

        const usage = metricsService.getCpuUsage(firstCpuInfo);
        expect(usage).toBe(0);
    });

    test('getCpuUsage calculates delta between measurements correctly', () => {
        // First measurement
        const firstCpuInfo = Array(4).fill(createMockCpuInfo({
            user: 100,
            nice: 0,
            sys: 50,
            idle: 200,
            irq: 0
        }));

        // Second measurement (all values increased)
        const secondCpuInfo = Array(4).fill(createMockCpuInfo({
            user: 200,  // +100
            nice: 0,    // +0
            sys: 100,   // +50
            idle: 300,  // +100
            irq: 0      // +0
        }));

        // First call should return 0
        metricsService.getCpuUsage(firstCpuInfo);

        // Second call should calculate the actual usage
        const usage = metricsService.getCpuUsage(secondCpuInfo);

        // Delta calculation:
        // Total delta = (200-100) + (0-0) + (100-50) + (300-200) + (0-0) = 250
        // Idle delta = 300-200 = 100
        // Usage = ((250-100)/250)*100 = 60%
        expect(usage).toBeCloseTo(60, 2);
    });

    test('collectMetrics generates correct metrics object', async () => {
        const startTime = 1000;
        const responseData = {
            usage: {
                prompt_tokens: 100,
                completion_tokens: 50,
                total_tokens: 150
            }
        };
        const modelConfig = {
            model: 'test-model',
            temperature: 0.5
        };
        const prompt = 'test prompt';

        fs.appendFile.mockImplementation((path, data, callback) => callback(null));

        await metricsService.collectMetrics(startTime, responseData, modelConfig, prompt);

        expect(fs.appendFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('test-model'),
            expect.any(Function)
        );
    });

    test('appendMetrics handles write errors', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const mockError = new Error('Write failed');
        
        fs.appendFile.mockImplementation((path, data, callback) => callback(mockError));
        
        const metrics = {
            model_name: 'test-model',
            prompt_tokens: 100
        };

        await metricsService.appendMetrics(metrics);
        
        expect(consoleSpy).toHaveBeenCalledWith('Error writing metrics:', mockError);
        consoleSpy.mockRestore();
    });
}); 