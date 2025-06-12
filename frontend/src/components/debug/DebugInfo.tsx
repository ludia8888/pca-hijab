import { useAppStore } from '@/store';

export const DebugInfo = () => {
  const { analysisResult, sessionId, instagramId } = useAppStore();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md overflow-auto max-h-96 text-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Session ID:</strong> {sessionId || 'Not set'}
        </div>
        <div>
          <strong>Instagram ID:</strong> {instagramId || 'Not set'}
        </div>
        <div>
          <strong>Analysis Result:</strong>
          <pre className="mt-1 overflow-x-auto">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;