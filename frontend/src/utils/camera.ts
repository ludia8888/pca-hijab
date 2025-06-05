/**
 * Check if MediaStream API is supported
 */
export const isMediaStreamSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaStream !== 'undefined'
  );
};

/**
 * Check if the device has camera capabilities
 */
export const hasCameraCapability = async (): Promise<boolean> => {
  if (!isMediaStreamSupported()) {
    return false;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
};

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after getting permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
};