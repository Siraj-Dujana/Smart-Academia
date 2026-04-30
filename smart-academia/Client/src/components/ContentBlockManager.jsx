// components/ContentBlockManager.jsx
import React from 'react';

const ContentBlockManager = ({ blocks, onChange, onImageUpload, onVideoUpload, uploading }) => {

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      content: '',
      caption: '',
      url: '',
      order: blocks.length
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    );
    onChange(updatedBlocks);
  };

  const removeBlock = (id) => {
    if (window.confirm('Remove this block?')) {
      onChange(blocks.filter(block => block.id !== id));
    }
  };

  const moveBlock = (id, direction) => {
    const index = blocks.findIndex(b => b.id === id);
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      onChange(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
      onChange(newBlocks);
    }
  };

  const handleFileUpload = (blockId, type, file) => {
    if (type === 'image') {
      onImageUpload(file, (url) => {
        updateBlock(blockId, 'url', url);
      });
    } else if (type === 'video') {
      onVideoUpload(file, (url) => {
        updateBlock(blockId, 'url', url);
      });
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
              placeholder="Write your text content here..."
              className="w-full px-4 py-3 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y"
              rows={6}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="relative group">
                <img src={block.url} alt={block.caption} className="w-full rounded-xl max-h-[400px] object-contain bg-gray-900" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => updateBlock(block.id, 'url', '')}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-all"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5" style={{ borderColor: "#334155" }}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(block.id, 'image', file);
                    }}
                  />
                  <span className="material-symbols-outlined text-3xl text-gray-500 mb-2">cloud_upload</span>
                  <p className="text-sm text-gray-400">Click to upload image</p>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">link</span>
                  <input
                    type="text"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                    placeholder="Or paste image URL here..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
              placeholder="Image caption / description..."
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="relative group">
                {block.url.includes('youtube.com') || block.url.includes('youtu.be') ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video content"
                    />
                  </div>
                ) : block.url.includes('.mp4') || block.url.includes('.webm') ? (
                  <video controls className="w-full rounded-xl">
                    <source src={block.url} />
                  </video>
                ) : (
                  <div className="aspect-video rounded-xl bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-gray-500">play_circle</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => updateBlock(block.id, 'url', '')}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-all"
                    title="Remove video"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5" style={{ borderColor: "#334155" }}>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(block.id, 'video', file);
                    }}
                  />
                  <span className="material-symbols-outlined text-3xl text-gray-500 mb-2">cloud_upload</span>
                  <p className="text-sm text-gray-400">Click to upload video</p>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">link</span>
                  <input
                    type="text"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                    placeholder="Or paste video URL (YouTube, Vimeo, or direct link)..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
              placeholder="Video caption / description..."
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Block Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => addBlock('text')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
        >
          <span className="material-symbols-outlined text-base">article</span>
          Add Text
        </button>
        <button
          onClick={() => addBlock('image')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}
        >
          <span className="material-symbols-outlined text-base">image</span>
          Add Image
        </button>
        <button
          onClick={() => addBlock('video')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#a855f722", color: "#c084fc", border: "1px solid #a855f744" }}
        >
          <span className="material-symbols-outlined text-base">smart_display</span>
          Add Video
        </button>
      </div>

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 block">add_circle</span>
          <p className="text-sm text-gray-400">No content blocks yet</p>
          <p className="text-xs text-gray-500">Click the buttons above to add text, images, or videos</p>
        </div>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-xl p-4 transition-all hover:shadow-lg"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {/* Block Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: "#334155" }}>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  block.type === 'text' ? 'text-indigo-400 bg-indigo-500/20' :
                  block.type === 'image' ? 'text-emerald-400 bg-emerald-500/20' :
                  'text-purple-400 bg-purple-500/20'
                }`}>
                  {block.type === 'text' ? 'Text Block' : block.type === 'image' ? 'Image Block' : 'Video Block'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Move up"
                >
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                </button>
                <button
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Move down"
                >
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete block"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            {/* Block Content */}
            {renderBlock(block)}
          </div>
        ))
      )}

      {uploading && (
        <div className="fixed bottom-4 right-4 p-3 rounded-xl shadow-lg flex items-center gap-2 z-50" style={{ background: "#1e293b", border: "1px solid #6366f144" }}>
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-xs text-gray-400">Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default ContentBlockManager;