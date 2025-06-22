// Performance monitoring utilities for WebView optimization

export const performanceMonitor = {
  // Measure frame rate
  measureFPS: () => {
    let frames = 0;
    let lastTime = performance.now();
    
    function countFrames() {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        console.log(`FPS: ${fps}`);
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    }
    
    requestAnimationFrame(countFrames);
  },

  // Measure memory usage
  measureMemory: () => {
    if (performance.memory) {
      const memory = performance.memory;
      console.log({
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  },

  // Monitor scroll performance
  monitorScrollPerformance: (element) => {
    let isScrolling = false;
    let scrollStart = 0;
    
    element.addEventListener('scroll', () => {
      if (!isScrolling) {
        scrollStart = performance.now();
        isScrolling = true;
      }
      
      clearTimeout(scrollTimeout);
      const scrollTimeout = setTimeout(() => {
        const scrollEnd = performance.now();
        console.log(`Scroll duration: ${scrollEnd - scrollStart}ms`);
        isScrolling = false;
      }, 100);
    });
  },

  // Detect WebView type
  detectWebView: () => {
    const userAgent = navigator.userAgent;
    const isWebView = /wv|WebView/.test(userAgent);
    const isElectron = /Electron/.test(userAgent);
    const isWails = window.wails !== undefined;
    
    console.log({
      isWebView,
      isElectron,
      isWails,
      userAgent
    });
    
    return { isWebView, isElectron, isWails };
  }
};

// Auto-start performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.detectWebView();
} 