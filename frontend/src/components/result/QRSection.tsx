import React, { useEffect, useState } from 'react';
import { Share2, Download } from 'lucide-react';
import { shareOrCopy } from '@/utils/helpers';
import { generateResultCard, downloadResultCard } from '@/utils/resultCardGeneratorV3';
import type { PersonalColorResult } from '@/types';

interface QRSectionProps {
  result: PersonalColorResult;
  instagramId?: string;
}

export const QRSection: React.FC<QRSectionProps> = ({ result, instagramId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code for the current page URL
    const currentUrl = window.location.href;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
    setQrCodeUrl(qrApiUrl);
  }, []);

  const handleShare = async () => {
    try {
      await shareOrCopy({
        title: 'Hijab Personal Color Analysis Results',
        text: `My personal color is ${result.personal_color_en}!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleSaveImage = async () => {
    try {
      const blob = await generateResultCard(result, instagramId || '');
      const filename = `hijab_color_${result.personal_color_en.replace(' ', '_')}_${Date.now()}.jpg`;
      downloadResultCard(blob, filename);
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8">
      <div className="text-center">
        {/* Title */}
        <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1">
          Qr코드 스캔하고
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
          나만의 결과지, 추천상품 받아보기
        </p>

        {/* QR Code */}
        <div className="inline-block bg-white p-2 md:p-3 border-2 border-gray-200 rounded-xl mb-3 md:mb-4">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-gray-100 animate-pulse rounded" />
          )}
        </div>

        {/* Scan Button */}
        <button
          onClick={handleSaveImage}
          className="w-full max-w-xs mx-auto py-2.5 md:py-3 bg-yellow-300 text-gray-800 text-sm md:text-base font-medium rounded-xl"
        >
          스캔받기
        </button>
      </div>
    </div>
  );
};