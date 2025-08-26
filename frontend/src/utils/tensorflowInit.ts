/**
 * TensorFlow.js initialization module
 * Ensures TensorFlow is properly loaded and initialized before use
 */

// Import TensorFlow core and backend in correct order
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

// Global initialization flag
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

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

    // List available backends
    console.log('📊 [TensorFlow] Available backends before init:', tf.engine().backendNames());

    // Try WebGL first
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('✅ [TensorFlow] WebGL backend initialized');
    } catch (webglError) {
      console.warn('⚠️ [TensorFlow] WebGL backend failed, falling back to CPU:', webglError);
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ [TensorFlow] CPU backend initialized (fallback)');
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
    
    // Log memory status
    const memInfo = tf.memory();
    console.log('📊 [TensorFlow] Memory:', {
      numTensors: memInfo.numTensors,
      numBytes: memInfo.numBytes,
      numBytesFormatted: (memInfo.numBytes / 1024 / 1024).toFixed(2) + ' MB'
    });

    isInitialized = true;
  } catch (error) {
    console.error('❌ [TensorFlow] Initialization failed:', error);
    initializationPromise = null;
    throw error;
  }
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