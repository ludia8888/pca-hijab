/**
 * TensorFlow.js initialization module
 * Ensures TensorFlow is properly loaded and initialized before use
 * Enhanced with Safari/iOS compatibility and WebGL context recovery
 */

// Import TensorFlow core and backend in correct order
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { isSafari, isIOS, getBrowserOptimizationSettings } from './browserDetection';

// Global initialization flag
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let webglContextLostHandler: (() => void) | null = null;

/**
 * Initialize TensorFlow.js with WebGL backend
 * This must be called before any TensorFlow operations
 */
export async function initializeTensorFlow(): Promise<void> {
  if (isInitialized) {
    console.log('✅ [TensorFlow] Already initialized');
    return;
  }

  if (initializationPromise) {
    console.log('⏳ [TensorFlow] Initialization in progress, waiting...');
    return initializationPromise;
  }

  initializationPromise = performInitialization();
  await initializationPromise;
}

async function performInitialization(): Promise<void> {
  try {
    console.log('🔧 [TensorFlow] Starting initialization...');
    const startTime = performance.now();
    
    // Get browser optimization settings
    const browserSettings = getBrowserOptimizationSettings();
    console.log('🌐 [TensorFlow] Browser detected:', {
      isSafari: isSafari(),
      isIOS: isIOS(),
      optimizationSettings: browserSettings
    });

    // List available backends
    console.log('📊 [TensorFlow] Available backends before init:', tf.engine().backendNames());

    // Configure backend based on browser
    let backendInitialized = false;
    
    if (browserSettings.useWebGL) {
      try {
        // Safari/iOS specific WebGL configuration
        if (isSafari() || isIOS()) {
          console.log('🔧 [TensorFlow] Configuring WebGL for Safari/iOS...');
          
          // Set WebGL flags for better Safari compatibility
          tf.env().set('WEBGL_VERSION', 2);
          tf.env().set('WEBGL_FORCE_F16_TEXTURES', false); // Better Safari compatibility
          tf.env().set('WEBGL_PACK', !isIOS()); // Disable packing on iOS for stability
          
          if (browserSettings.enableMemoryOptimization) {
            tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0); // Aggressive texture cleanup
          }
        }
        
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('✅ [TensorFlow] WebGL backend initialized');
        backendInitialized = true;
        
        // Setup WebGL context loss recovery for Safari
        if (isSafari()) {
          setupWebGLContextRecovery();
        }
        
      } catch (webglError) {
        console.warn('⚠️ [TensorFlow] WebGL backend failed:', webglError);
      }
    }
    
    // Fallback to CPU if WebGL failed or not recommended
    if (!backendInitialized) {
      console.log('🔧 [TensorFlow] Using CPU backend...');
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ [TensorFlow] CPU backend initialized');
    }

    // Verify current backend
    const currentBackend = tf.getBackend();
    console.log('📊 [TensorFlow] Current backend:', currentBackend);

    // Test TensorFlow functionality
    const testTensor = tf.tensor1d([1, 2, 3]);
    const result = await testTensor.data();
    testTensor.dispose();
    
    if (result[0] !== 1 || result[1] !== 2 || result[2] !== 3) {
      throw new Error('TensorFlow test failed: tensor values incorrect');
    }

    const initTime = performance.now() - startTime;
    console.log(`✅ [TensorFlow] Initialization completed in ${Math.round(initTime)}ms`);
    
    // Log memory status with Safari warning
    const memInfo = tf.memory();
    console.log('📊 [TensorFlow] Memory:', {
      numTensors: memInfo.numTensors,
      numBytes: memInfo.numBytes,
      numBytesFormatted: (memInfo.numBytes / 1024 / 1024).toFixed(2) + ' MB',
      ...(isSafari() && { warning: 'Safari has strict memory limits' })
    });

    isInitialized = true;
  } catch (error) {
    console.error('❌ [TensorFlow] Initialization failed:', error);
    initializationPromise = null;
    throw error;
  }
}

/**
 * Setup WebGL context loss recovery for Safari
 */
function setupWebGLContextRecovery(): void {
  console.log('🛡️ [TensorFlow] Setting up WebGL context recovery for Safari...');
  
  // Monitor for context loss
  webglContextLostHandler = () => {
    console.warn('⚠️ [TensorFlow] WebGL context lost! Attempting recovery...');
    isInitialized = false;
    
    // Attempt to reinitialize after a delay
    setTimeout(() => {
      console.log('🔄 [TensorFlow] Attempting to restore WebGL context...');
      initializeTensorFlow().catch(error => {
        console.error('❌ [TensorFlow] Failed to restore WebGL context:', error);
      });
    }, 1000);
  };
  
  // Listen for visibility changes (common trigger for context loss in Safari)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !isInitialized) {
      console.log('🔄 [TensorFlow] Page visible, checking TensorFlow status...');
      
      // Check if TensorFlow is still working
      try {
        const testTensor = tf.tensor1d([1]);
        testTensor.dispose();
      } catch {
        // Context likely lost, reinitialize
        if (webglContextLostHandler) {
          webglContextLostHandler();
        }
      }
    }
  });
}

/**
 * Check if TensorFlow is initialized
 */
export function isTensorFlowInitialized(): boolean {
  return isInitialized;
}

/**
 * Get TensorFlow instance (ensures it's initialized)
 */
export async function getTensorFlow() {
  if (!isInitialized) {
    await initializeTensorFlow();
  }
  return tf;
}

// Pre-initialize on module load - always do this for better performance
// This starts loading TensorFlow.js immediately when the app starts
if (typeof window !== 'undefined') {
  console.log('🚀 [TensorFlow] Pre-initializing on app start...');
  // Start initialization immediately but don't block
  setTimeout(() => {
    initializeTensorFlow().catch(error => {
      console.error('❌ [TensorFlow] Pre-initialization failed:', error);
    });
  }, 100); // Small delay to not block initial render
}