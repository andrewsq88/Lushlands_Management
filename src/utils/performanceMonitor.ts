// Performance monitoring for concurrent users and load testing
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: {
    pageLoadTime: number;
    apiResponseTimes: number[];
    errorCount: number;
    userActions: number;
  } = {
    pageLoadTime: 0,
    apiResponseTimes: [],
    errorCount: 0,
    userActions: 0
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startPageLoadTimer() {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now() - startTime;
      console.log('Page load time:', this.metrics.pageLoadTime.toFixed(2), 'ms');
    });
  }

  trackApiCall(url: string, startTime: number) {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTimes.push(responseTime);
    
    console.log(`API call to ${url} took ${responseTime.toFixed(2)}ms`);
    
    // Alert if response time is too slow
    if (responseTime > 5000) {
      console.warn('Slow API response detected:', url, responseTime);
    }
  }

  trackError(error: Error, context: string) {
    this.metrics.errorCount++;
    console.error(`Error in ${context}:`, error);
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  trackUserAction(action: string) {
    this.metrics.userActions++;
    console.log('User action:', action, 'Total actions:', this.metrics.userActions);
  }

  getMetrics() {
    const avgApiResponseTime = this.metrics.apiResponseTimes.length > 0
      ? this.metrics.apiResponseTimes.reduce((a, b) => a + b, 0) / this.metrics.apiResponseTimes.length
      : 0;

    return {
      ...this.metrics,
      avgApiResponseTime: avgApiResponseTime.toFixed(2),
      totalApiCalls: this.metrics.apiResponseTimes.length
    };
  }

  logPerformanceReport() {
    const metrics = this.getMetrics();
    console.log('=== Performance Report ===');
    console.log('Page Load Time:', metrics.pageLoadTime.toFixed(2), 'ms');
    console.log('Average API Response Time:', metrics.avgApiResponseTime, 'ms');
    console.log('Total API Calls:', metrics.totalApiCalls);
    console.log('Error Count:', metrics.errorCount);
    console.log('User Actions:', metrics.userActions);
    console.log('========================');
  }

  // Simulate concurrent user load for testing
  simulateConcurrentUsers(userCount: number = 10) {
    console.log(`Simulating ${userCount} concurrent users...`);
    
    const promises = Array.from({ length: userCount }, (_, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.trackUserAction(`simulated-user-${index + 1}-action`);
          resolve(index);
        }, Math.random() * 1000);
      });
    });

    Promise.all(promises).then(() => {
      console.log(`Concurrent user simulation completed for ${userCount} users`);
      this.logPerformanceReport();
    });
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();