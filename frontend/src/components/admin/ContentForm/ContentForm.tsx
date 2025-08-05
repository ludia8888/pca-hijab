import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Save, Eye, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui';
import { ContentEditor } from '../ContentEditor';
import { ProductAPI } from '@/services/api/admin';
import { useAdminStore } from '@/store/useAdminStore';
import type { Content, ContentFormData, ContentCategory, ContentStatus } from '@/types/admin';
import { CONTENT_CATEGORY_LABELS } from '@/types/admin';
import DOMPurify from 'dompurify';

interface ContentFormProps {
  content?: Content;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ContentForm: React.FC<ContentFormProps> = ({ content, onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { setUploadingImages } = useAdminStore();

  // Form state
  const [formData, setFormData] = useState<ContentFormData>({
    title: content?.title || '',
    subtitle: content?.subtitle || '',
    slug: content?.slug || '',
    thumbnailUrl: content?.thumbnailUrl || '',
    content: content?.content || '',
    excerpt: content?.excerpt || '',
    category: content?.category || 'beauty_tips',
    tags: content?.tags || [],
    status: content?.status || 'draft',
    metaDescription: content?.metaDescription || '',
    metaKeywords: content?.metaKeywords || ''
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>(content?.thumbnailUrl || '');
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!content && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, content]);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: ProductAPI.upload.single,
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: '이미지 업로드 완료',
        message: '이미지가 성공적으로 업로드되었습니다.'
      });
      return data;
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '업로드 실패',
        message: '이미지 업로드 중 오류가 발생했습니다.'
      });
    }
  });

  // Content create/update mutation
  const contentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      if (content) {
        return ProductAPI.contents.update(content.id, data);
      } else {
        return ProductAPI.contents.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] });
      addToast({
        type: 'success',
        title: content ? '컨텐츠 수정 완료' : '컨텐츠 작성 완료',
        message: content ? '컨텐츠가 성공적으로 수정되었습니다.' : '컨텐츠가 성공적으로 작성되었습니다.'
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        type: 'error',
        title: content ? '수정 실패' : '작성 실패',
        message: '컨텐츠 저장 중 오류가 발생했습니다.'
      });
    }
  });

  // Handle thumbnail upload
  const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
      setThumbnailPreview(URL.createObjectURL(file));
    } finally {
      setUploadingImages(false);
    }
  }, [uploadImageMutation, setUploadingImages]);

  // Add tag
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.content || !formData.thumbnailUrl) {
      addToast({
        type: 'error',
        title: '입력 오류',
        message: '필수 항목을 모두 입력해주세요.'
      });
      return;
    }

    // Sanitize HTML content
    const sanitizedData = {
      ...formData,
      content: DOMPurify.sanitize(formData.content)
    };

    contentMutation.mutate(sanitizedData);
  }, [formData, contentMutation, addToast]);

  // Handle save as draft
  const handleSaveDraft = useCallback(() => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    handleSubmit(new Event('submit') as any);
  }, [handleSubmit]);

  // Handle publish
  const handlePublish = useCallback(() => {
    setFormData(prev => ({ ...prev, status: 'published' }));
    handleSubmit(new Event('submit') as any);
  }, [handleSubmit]);

  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              목록으로
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {content ? '컨텐츠 수정' : '새 컨텐츠 작성'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {showPreview ? '편집기로' : '미리보기'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              loading={contentMutation.isPending && formData.status === 'draft'}
              leftIcon={<Save className="w-4 h-4" />}
            >
              임시저장
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePublish}
              loading={contentMutation.isPending && formData.status === 'published'}
            >
              {content?.status === 'published' ? '업데이트' : '발행하기'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
              
              <div className="space-y-4">
                <Input
                  label="제목"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="컨텐츠 제목을 입력하세요"
                  required
                  fullWidth
                />

                <Input
                  label="부제목"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="부제목을 입력하세요 (선택사항)"
                  fullWidth
                />

                <Input
                  label="URL 슬러그"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                  helperText="URL에 사용될 주소입니다. 영문, 숫자, 하이픈만 사용 가능합니다."
                  required
                  fullWidth
                />
              </div>
            </Card>

            {/* Content Editor */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">본문 내용</h3>
              
              {showPreview ? (
                <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg min-h-[400px]">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} />
                </div>
              ) : (
                <ContentEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="내용을 입력하세요..."
                />
              )}
            </Card>

            {/* SEO */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">검색 엔진 최적화 (SEO)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    요약/발췌
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="컨텐츠 요약을 입력하세요 (목록에 표시됩니다)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <Input
                  label="메타 설명"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="검색 결과에 표시될 설명을 입력하세요"
                  fullWidth
                />

                <Input
                  label="메타 키워드"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  placeholder="쉼표로 구분된 키워드를 입력하세요"
                  fullWidth
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">썸네일 이미지</h3>
              
              <div className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="썸네일 미리보기"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
                        setThumbnailPreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">이미지 업로드</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </Card>

            {/* Category */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">카테고리</h3>
              
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ContentCategory }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(CONTENT_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">태그</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="태그 입력"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    size="sm"
                  >
                    추가
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};