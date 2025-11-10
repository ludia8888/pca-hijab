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
        .replace(/[^a-z0-9\s-]/g, '')
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
        title: 'Image uploaded',
        message: 'The image was uploaded successfully.'
      });
      return data;
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Something went wrong while uploading the image.'
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
        title: content ? 'Content updated' : 'Content created',
        message: content ? 'The content item was updated successfully.' : 'The content item was created successfully.'
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        type: 'error',
        title: content ? 'Update failed' : 'Creation failed',
        message: 'Something went wrong while saving the content.'
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
          title: 'Missing information',
          message: 'Please complete all required fields.'
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
              Back to list
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {content ? 'Edit content' : 'Create new content'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {showPreview ? 'Back to editor' : 'Preview'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              loading={contentMutation.isPending && formData.status === 'draft'}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save draft
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePublish}
              loading={contentMutation.isPending && formData.status === 'published'}
            >
              {content?.status === 'published' ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic information</h3>
              
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter the content title"
                  required
                  fullWidth
                />

                <Input
                  label="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter a subtitle (optional)"
                  fullWidth
                />

                <Input
                  label="URL slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                  helperText="Used for the URL. Letters, numbers, and hyphens only."
                  required
                  fullWidth
                />
              </div>
            </Card>

            {/* Content Editor */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Body content</h3>
              
              {showPreview ? (
                <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg min-h-[400px]">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} />
                </div>
              ) : (
                <ContentEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Start writing your article..."
                />
              )}
            </Card>

            {/* SEO */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Search optimization (SEO)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary / excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Write a short summary (shown in lists)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <Input
                  label="Meta description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Description shown in search results"
                  fullWidth
                />

                <Input
                  label="Meta keywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  placeholder="Enter comma-separated keywords"
                  fullWidth
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thumbnail image</h3>
              
              <div className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
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
                      <span className="text-sm text-gray-600">Upload image</span>
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
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              
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
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Enter a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    size="sm"
                  >
                    Add
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
