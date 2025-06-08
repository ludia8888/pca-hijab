import { useState } from 'react';
import { convertHEICToJPEG, isHEICSupported } from '@/utils/imageConverter';

export const HEICDebug = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    addLog(`Selected file: ${selectedFile.name} (type: ${selectedFile.type}, size: ${selectedFile.size} bytes)`);
    addLog(`HEIC supported in browser: ${isHEICSupported()}`);

    if (selectedFile.type === 'image/heic' || selectedFile.name.toLowerCase().endsWith('.heic')) {
      addLog('HEIC file detected, attempting conversion...');
      
      try {
        const converted = await convertHEICToJPEG(selectedFile);
        setConvertedFile(converted);
        addLog(`Conversion successful: ${converted.name} (type: ${converted.type}, size: ${converted.size} bytes)`);
      } catch (error) {
        addLog(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      addLog('Not a HEIC file, no conversion needed');
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">HEIC Debug Panel</h3>
      
      <input
        type="file"
        accept="image/*,.heic"
        onChange={handleFileSelect}
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold">Original File:</h4>
          {file && (
            <ul className="text-sm">
              <li>Name: {file.name}</li>
              <li>Type: {file.type || 'not specified'}</li>
              <li>Size: {file.size} bytes</li>
            </ul>
          )}
        </div>
        
        <div>
          <h4 className="font-semibold">Converted File:</h4>
          {convertedFile && (
            <ul className="text-sm">
              <li>Name: {convertedFile.name}</li>
              <li>Type: {convertedFile.type}</li>
              <li>Size: {convertedFile.size} bytes</li>
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-100 p-2 rounded">
        <h4 className="font-semibold mb-2">Logs:</h4>
        <div className="text-xs font-mono space-y-1">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};