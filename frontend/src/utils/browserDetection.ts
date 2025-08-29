/**
 * Browser Detection Utilities
 * Detect Safari, iOS, and specific browser versions for compatibility handling
 */

/**
 * Detect if running on iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro detection
}

/**
 * Detect if running on Safari
 */
export function isSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const isSafariBrowser = /safari/.test(ua) && !/chrome/.test(ua) && !/android/.test(ua);
  return isSafariBrowser;
}

/**
 * Get iOS version
 */
export function getIOSVersion(): number | null {
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Get Safari version
 */
export function getSafariVersion(): number | null {
  const match = navigator.userAgent.match(/Version\/(\d+)\.(\d+)/);
  if (match && isSafari()) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Check if Canvas.toBlob is supported
 */
export function hasCanvasToBlobSupport(): boolean {
  const canvas = document.createElement('canvas');
  return typeof canvas.toBlob === 'function';
}

/**
 * Check if WebGL is available and stable
 */
export function isWebGLStable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Detect if device has low memory (iOS specific)
 */
export function isLowMemoryDevice(): boolean {
  // @ts-ignore - navigator.deviceMemory is not in standard types
  const deviceMemory = navigator.deviceMemory;
  
  if (deviceMemory && deviceMemory < 4) {
    return true;
  }
  
  // For iOS devices without deviceMemory API
  if (isIOS()) {
    const ua = navigator.userAgent;
    // Older iPhone models with less memory
    if (/iPhone (6|7|8|SE)/.test(ua) && !/Plus/.test(ua)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get recommended settings for current browser/device
 */
export interface BrowserOptimizationSettings {
  useWebGL: boolean;
  maxFaces: number;
  refineLandmarks: boolean;
  enableMemoryOptimization: boolean;
  requireHTTPS: boolean;
  showCompatibilityWarning: boolean;
}

export function getBrowserOptimizationSettings(): BrowserOptimizationSettings {
  const settings: BrowserOptimizationSettings = {
    useWebGL: true,
    maxFaces: 1,
    refineLandmarks: true,
    enableMemoryOptimization: false,
    requireHTTPS: false,
    showCompatibilityWarning: false,
  };

  // iOS Safari optimizations
  if (isIOS() && isSafari()) {
    settings.requireHTTPS = true;
    settings.enableMemoryOptimization = true;
    
    const iosVersion = getIOSVersion();
    if (iosVersion && iosVersion < 14) {
      settings.showCompatibilityWarning = true;
      settings.refineLandmarks = false; // Reduce accuracy for performance
    }
    
    if (isLowMemoryDevice()) {
      settings.maxFaces = 1;
      settings.refineLandmarks = false;
    }
  }

  // Safari desktop optimizations
  if (isSafari() && !isIOS()) {
    const safariVersion = getSafariVersion();
    if (safariVersion && safariVersion < 15) {
      settings.enableMemoryOptimization = true;
    }
  }

  // Check WebGL stability
  if (!isWebGLStable()) {
    settings.useWebGL = false;
  }

  return settings;
}

/**
 * Canvas.toBlob polyfill for Safari
 */
export function installCanvasToBlobPolyfill(): void {
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function(callback: (blob: Blob | null) => void, type = 'image/png', quality?: number) {
        const canvas = this as HTMLCanvasElement;
        setTimeout(() => {
          const dataURL = canvas.toDataURL(type, quality);
          const data = dataURL.split(',')[1];
          const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
          
          // Convert base64 to binary
          const byteString = atob(data);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([uint8Array], { type: mimeString });
          callback(blob);
        });
      }
    });
  }
}

// Auto-install polyfill on module load
if (typeof window !== 'undefined') {
  installCanvasToBlobPolyfill();
}