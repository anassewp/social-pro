// Performance tests for application performance monitoring and optimization
// Tests for load testing, stress testing, and performance benchmarks

import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  // API Performance Tests
  describe('API Performance', () => {
    test('should respond to GET /api/campaigns within 500ms', async () => {
      const startTime = performance.now();
      
      const response = await fetch('http://localhost:3000/api/campaigns/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
      
      console.log(`Campaigns list API response time: ${responseTime}ms`);
    }, 10000);

    test('should respond to POST /api/campaigns/create within 1000ms', async () => {
      const campaignData = {
        name: 'Performance Test Campaign',
        description: 'Performance test description',
        budget: 1000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const startTime = performance.now();
      
      const response = await fetch('http://localhost:3000/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(campaignData),
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(1000);
      
      console.log(`Campaign create API response time: ${responseTime}ms`);
    }, 15000);

    test('should handle concurrent API requests efficiently', async () => {
      const concurrentRequests = 50;
      const startTime = performance.now();
      
      const promises = Array.from({ length: concurrentRequests }, async () => {
        const requestStart = performance.now();
        
        try {
          const response = await fetch('http://localhost:3000/api/campaigns/list', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            },
          });
          
          const requestEnd = performance.now();
          return {
            status: response.status,
            time: requestEnd - requestStart,
          };
        } catch (error) {
          return {
            status: 0,
            error: error.message,
          };
        }
      });
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // All requests should complete successfully
      const successfulRequests = results.filter(r => r.status === 200);
      expect(successfulRequests.length).toBe(concurrentRequests);
      
      // Average response time should be reasonable
      const avgResponseTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      expect(avgResponseTime).toBeLessThan(1000);
      
      // Total time should be less than 10 seconds for 50 concurrent requests
      expect(totalTime).toBeLessThan(10000);
      
      console.log(`Concurrent API test results:
        Total requests: ${concurrentRequests}
        Success rate: 100%
        Average response time: ${avgResponseTime}ms
        Total time: ${totalTime}ms`);
    }, 30000);

    test('should maintain performance under load', async () => {
      const rampUpTime = 5000; // 5 seconds
      const concurrentUsers = 20;
      const testDuration = 30000; // 30 seconds
      
      const startTime = Date.now();
      const endTime = startTime + testDuration;
      
      let completedRequests = 0;
      let failedRequests = 0;
      const responseTimes: number[] = [];
      
      // Simulate multiple users making requests
      const userLoops = Array.from({ length: concurrentUsers }, (_, userId) => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(async () => {
            if (Date.now() >= endTime) {
              clearInterval(interval);
              resolve();
              return;
            }
            
            try {
              const requestStart = performance.now();
              
              const response = await fetch('http://localhost:3000/api/campaigns/list', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer mock-token-${userId}`,
                },
              });
              
              const requestEnd = performance.now();
              const responseTime = requestEnd - requestStart;
              
              if (response.status === 200) {
                completedRequests++;
                responseTimes.push(responseTime);
              } else {
                failedRequests++;
              }
            } catch (error) {
              failedRequests++;
            }
          }, Math.random() * 2000 + 500); // Random interval between 500-2500ms
        });
      });
      
      await Promise.all(userLoops);
      const totalTime = Date.now() - startTime;
      
      // Calculate metrics
      const successRate = (completedRequests / (completedRequests + failedRequests)) * 100;
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
      const throughput = completedRequests / (totalTime / 1000);
      
      // Performance assertions
      expect(successRate).toBeGreaterThan(95);
      expect(avgResponseTime).toBeLessThan(2000);
      expect(p95ResponseTime).toBeLessThan(5000);
      expect(throughput).toBeGreaterThan(5); // At least 5 requests per second
      
      console.log(`Load test results:
        Duration: ${totalTime}ms
        Completed requests: ${completedRequests}
        Failed requests: ${failedRequests}
        Success rate: ${successRate}%
        Average response time: ${avgResponseTime}ms
        P95 response time: ${p95ResponseTime}ms
        Throughput: ${throughput} req/sec`);
    }, 60000);

    test('should handle database performance under load', async () => {
      // Test database connection pool performance
      const { createClient } = require('@/lib/supabase/client');
      const db = createClient();
      
      const startTime = performance.now();
      
      // Simulate multiple database queries
      const queries = Array.from({ length: 100 }, async () => {
        return db.from('campaigns').select('*').limit(10);
      });
      
      await Promise.all(queries);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgQueryTime = totalTime / 100;
      
      expect(avgQueryTime).toBeLessThan(100); // Average query time should be under 100ms
      
      console.log(`Database performance test:
        Total queries: 100
        Total time: ${totalTime}ms
        Average query time: ${avgQueryTime}ms`);
    }, 30000);
  });

  // Frontend Performance Tests
  describe('Frontend Performance', () => {
    test('should render dashboard within performance budget', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Monitor performance metrics
      const performanceMetrics: any = {};
      
      page.on('pageerror', error => {
        console.error('Page error:', error.message);
      });
      
      page.on('load', () => {
        performanceMetrics.loadTime = performance.now();
      });
      
      const startTime = performance.now();
      
      await page.goto('http://localhost:3000/dashboard', {
        waitUntil: 'networkidle',
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Get Core Web Vitals
      const vitals = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          ttfb: navigation.responseStart - navigation.requestStart,
        };
      });
      
      await browser.close();
      
      // Performance assertions
      expect(loadTime).toBeLessThan(3000);
      expect(vitals.domContentLoaded).toBeLessThan(2000);
      expect(vitals.loadComplete).toBeLessThan(3000);
      expect(vitals.ttfb).toBeLessThan(600);
      
      console.log(`Frontend performance metrics:
        Page load time: ${loadTime}ms
        DOM content loaded: ${vitals.domContentLoaded}ms
        Load complete: ${vitals.loadComplete}ms
        Time to first byte: ${vitals.ttfb}ms`);
    }, 15000);

    test('should not cause memory leaks during navigation', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Navigate multiple times
      for (let i = 0; i < 50; i++) {
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');
        
        await page.goto('http://localhost:3000/campaigns');
        await page.waitForLoadState('networkidle');
        
        await page.goto('http://localhost:3000/groups');
        await page.waitForLoadState('networkidle');
      }
      
      // Check for memory usage
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      await browser.close();
      
      // Memory should not grow excessively
      expect(memoryInfo).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      
      console.log(`Memory usage after 150 page navigations: ${memoryInfo / 1024 / 1024}MB`);
    }, 60000);

    test('should handle large datasets efficiently', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Mock large dataset response
      await page.route('**/api/campaigns/**', route => {
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
          id: `campaign-${i}`,
          name: `Campaign ${i}`,
          budget: Math.random() * 10000,
          status: i % 2 === 0 ? 'active' : 'draft',
          createdAt: new Date().toISOString(),
        }));
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: largeDataset, total: largeDataset.length }),
        });
      });
      
      const startTime = performance.now();
      
      await page.goto('http://localhost:3000/campaigns');
      await page.waitForSelector('[data-testid="campaign-list"]');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Check if virtual scrolling is implemented
      const virtualElements = await page.locator('[data-virtual-item]').count();
      
      await browser.close();
      
      // Should render quickly even with large dataset (virtual scrolling)
      expect(renderTime).toBeLessThan(2000);
      
      console.log(`Large dataset rendering time: ${renderTime}ms`);
      console.log(`Virtual scrolling elements: ${virtualElements}`);
    }, 20000);
  });

  // Cache Performance Tests
  describe('Cache Performance', () => {
    test('should improve performance with caching', async () => {
      const { CacheManager } = require('@/lib/cache/cache-manager');
      const cache = new CacheManager();
      
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }));
      
      // First request (cache miss)
      const startTime1 = performance.now();
      const result1 = cache.get('test-data');
      const endTime1 = performance.now();
      const missTime = endTime1 - startTime1;
      
      // Store data
      cache.set('test-data', testData, 60000);
      
      // Second request (cache hit)
      const startTime2 = performance.now();
      const result2 = cache.get('test-data');
      const endTime2 = performance.now();
      const hitTime = endTime2 - startTime2;
      
      expect(result1).toBeNull();
      expect(result2).toEqual(testData);
      expect(hitTime).toBeLessThan(missTime);
      
      console.log(`Cache performance:
        Cache miss time: ${missTime}ms
        Cache hit time: ${hitTime}ms
        Speed improvement: ${(missTime / hitTime).toFixed(2)}x`);
    });

    test('should handle cache expiration efficiently', async () => {
      const { CacheManager } = require('@/lib/cache/cache-manager');
      const cache = new CacheManager();
      
      // Set data with short TTL
      cache.set('short-ttl-data', 'test-value', 100);
      
      // Immediate read
      const immediateResult = cache.get('short-ttl-data');
      expect(immediateResult).toBe('test-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 101));
      
      // Read after expiration
      const expiredResult = cache.get('short-ttl-data');
      expect(expiredResult).toBeNull();
    });
  });

  // Bundle Size Tests
  describe('Bundle Size', () => {
    test('should maintain reasonable bundle size', async () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check build artifacts
      const buildDir = path.join(__dirname, '../../../.next');
      
      if (!fs.existsSync(buildDir)) {
        console.log('Build directory not found. Run `npm run build` first.');
        return;
      }
      
      // Calculate bundle sizes
      const getDirectorySize = (dirPath: string): number => {
        let size = 0;
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            size += getDirectorySize(itemPath);
          } else {
            size += stats.size;
          }
        }
        
        return size;
      };
      
      const pageDir = path.join(buildDir, 'server/pages');
      const staticDir = path.join(buildDir, 'static');
      
      if (fs.existsSync(pageDir)) {
        const pageSize = getDirectorySize(pageDir);
        expect(pageSize).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
        console.log(`Server pages bundle size: ${(pageSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      if (fs.existsSync(staticDir)) {
        const staticSize = getDirectorySize(staticDir);
        expect(staticSize).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
        console.log(`Static assets size: ${(staticSize / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  });

  // Real-time Performance Tests
  describe('Real-time Performance', () => {
    test('should handle real-time updates efficiently', async () => {
      const WebSocket = require('ws');
      const ws = new WebSocket('ws://localhost:3000/api/realtime');
      
      const messageCount = 1000;
      const startTime = performance.now();
      let receivedCount = 0;
      
      return new Promise((resolve, reject) => {
        ws.on('open', () => {
          console.log('WebSocket connection opened');
        });
        
        ws.on('message', (data) => {
          receivedCount++;
          
          if (receivedCount === messageCount) {
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const messagesPerSecond = (messageCount / totalTime) * 1000;
            
            expect(messagesPerSecond).toBeGreaterThan(100); // At least 100 messages per second
            
            console.log(`Real-time performance:
              Messages sent: ${messageCount}
              Total time: ${totalTime}ms
              Messages per second: ${messagesPerSecond}
              Average latency: ${totalTime / messageCount}ms`);
            
            ws.close();
            resolve(void 0);
          }
        });
        
        ws.on('error', (error) => {
          reject(error);
        });
        
        // Send messages
        for (let i = 0; i < messageCount; i++) {
          ws.send(JSON.stringify({
            type: 'test',
            data: { message: `Test message ${i}` },
          }));
        }
      });
    }, 30000);
  });

  // Security Performance Tests
  describe('Security Performance', () => {
    test('should handle encryption/decryption efficiently', async () => {
      const { encryptData, decryptData } = require('@/lib/encryption');
      
      const testData = 'This is sensitive data that needs to be encrypted and decrypted';
      const iterations = 1000;
      
      // Test encryption performance
      const encryptStart = performance.now();
      const encryptedData = [];
      
      for (let i = 0; i < iterations; i++) {
        const result = encryptData(testData, `key-${i}`);
        encryptedData.push(result);
      }
      
      const encryptEnd = performance.now();
      const encryptTime = encryptEnd - encryptStart;
      const encryptOpsPerSecond = (iterations / encryptTime) * 1000;
      
      // Test decryption performance
      const decryptStart = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        decryptData(encryptedData[i], `key-${i}`);
      }
      
      const decryptEnd = performance.now();
      const decryptTime = decryptEnd - decryptStart;
      const decryptOpsPerSecond = (iterations / decryptTime) * 1000;
      
      expect(encryptOpsPerSecond).toBeGreaterThan(100); // At least 100 ops/sec
      expect(decryptOpsPerSecond).toBeGreaterThan(100); // At least 100 ops/sec
      
      console.log(`Encryption performance:
        Operations: ${iterations}
        Encrypt time: ${encryptTime}ms
        Encrypt ops/sec: ${encryptOpsPerSecond}
        Decrypt time: ${decryptTime}ms
        Decrypt ops/sec: ${decryptOpsPerSecond}`);
    });
  });

  // Memory Usage Tests
  describe('Memory Usage', () => {
    test('should not consume excessive memory', async () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate heavy operations
      const largeArrays = [];
      for (let i = 0; i < 100; i++) {
        largeArrays.push(new Array(10000).fill(Math.random()));
      }
      
      const peakMemory = process.memoryUsage();
      
      // Clean up
      largeArrays.length = 0;
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      
      const memoryIncrease = (peakMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      const memoryAfterGC = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB peak increase
      expect(memoryAfterGC).toBeLessThan(50); // Less than 50MB after GC
      
      console.log(`Memory usage:
        Initial: ${initialMemory.heapUsed / 1024 / 1024}MB
        Peak: ${peakMemory.heapUsed / 1024 / 1024}MB
        Final: ${finalMemory.heapUsed / 1024 / 1024}MB
        Peak increase: ${memoryIncrease}MB
        After GC: ${memoryAfterGC}MB`);
    });
  });
});