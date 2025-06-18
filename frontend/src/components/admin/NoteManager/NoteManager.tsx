import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Tag,
  Calendar,
  Edit3,
  Trash2,
  Search,
  Filter,
  X,
  Plus,
  Hash
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import type { UnifiedUserView } from '@/types/admin';

export interface AdminNote {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  createdBy: string;
  editedAt?: Date;
  isPinned?: boolean;
}

interface NoteManagerProps {
  user: UnifiedUserView;
  notes: AdminNote[];
  onAddNote: (content: string, tags: string[]) => void;
  onEditNote: (noteId: string, content: string, tags: string[]) => void;
  onDeleteNote: (noteId: string) => void;
  onPinNote?: (noteId: string) => void;
  currentAdminId?: string;
}

const NoteManager: React.FC<NoteManagerProps> = ({
  user,
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onPinNote,
  currentAdminId = 'admin'
}) => {
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 노트 필터링
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // 모든 태그 추출
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // 태그 추가
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!newTags.includes(tag)) {
        setNewTags([...newTags, tag]);
      }
      setTagInput('');
    }
  };

  // 노트 추가
  const handleSubmitNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim(), newTags);
      setNewNote('');
      setNewTags([]);
    }
  };

  // 노트 수정 시작
  const startEditNote = (note: AdminNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditTags(note.tags);
  };

  // 노트 수정 저장
  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      onEditNote(editingNoteId, editContent.trim(), editTags);
      setEditingNoteId(null);
      setEditContent('');
      setEditTags([]);
    }
  };

  // 태그 색상 생성
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700'
    ];
    
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // 상대 시간 계산
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-4">
      {/* 노트 입력 폼 */}
      <Card className="p-4">
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={`@${user.instagramId}에 대한 노트를 작성하세요...`}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
          
          {/* 태그 입력 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              태그:
            </div>
            {newTags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
                <button
                  onClick={() => setNewTags(newTags.filter((_, i) => i !== index))}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="태그 입력 후 Enter"
              className="flex-1 min-w-[120px] px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          {/* 추천 태그 */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">추천:</span>
              {allTags.slice(0, 5).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (!newTags.includes(tag)) {
                      setNewTags([...newTags, tag]);
                    }
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 underline"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitNote}
              disabled={!newNote.trim()}
            >
              <Send className="w-4 h-4 mr-1" />
              노트 추가
            </Button>
          </div>
        </div>
      </Card>

      {/* 필터 및 검색 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="노트 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        {/* 태그 필터 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">모든 태그</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 노트 목록 */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{searchQuery || selectedTag ? '검색 결과가 없습니다' : '아직 작성된 노트가 없습니다'}</p>
          </Card>
        ) : (
          filteredNotes
            .sort((a, b) => {
              // 고정된 노트 우선
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              // 최신순 정렬
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map(note => (
              <Card 
                key={note.id} 
                className={`p-4 ${note.isPinned ? 'border-purple-300 bg-purple-50/50' : ''}`}
              >
                {editingNoteId === note.id ? (
                  // 수정 모드
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      autoFocus
                    />
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {editTags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                        >
                          {tag}
                          <button
                            onClick={() => setEditTags(editTags.filter((_, i) => i !== index))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="태그 추가"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            const tag = e.currentTarget.value.trim().toLowerCase();
                            if (!editTags.includes(tag)) {
                              setEditTags([...editTags, tag]);
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                        className="flex-1 min-w-[100px] px-2 py-1 text-xs border-b border-gray-300 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditContent('');
                          setEditTags([]);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                        
                        {/* 태그 */}
                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* 메타 정보 */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                          <span>{note.createdBy}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getRelativeTime(note.createdAt)}
                          </span>
                          {note.editedAt && (
                            <>
                              <span>•</span>
                              <span className="italic">수정됨</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex items-start gap-1 ml-3">
                        {onPinNote && (
                          <button
                            onClick={() => onPinNote(note.id)}
                            className={`p-1.5 rounded hover:bg-gray-100 ${note.isPinned ? 'text-purple-600' : 'text-gray-400'}`}
                            title={note.isPinned ? '고정 해제' : '고정'}
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        )}
                        
                        {note.createdBy === currentAdminId && (
                          <>
                            <button
                              onClick={() => startEditNote(note)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                              title="수정"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                if (confirm('정말로 이 노트를 삭제하시겠습니까?')) {
                                  onDeleteNote(note.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
        )}
      </div>

      {/* 태그 클라우드 (옵션) */}
      {allTags.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            태그 클라우드
          </h4>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const count = notes.filter(note => note.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-purple-600 text-white'
                      : `${getTagColor(tag)} hover:opacity-80`
                  }`}
                >
                  #{tag}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NoteManager;