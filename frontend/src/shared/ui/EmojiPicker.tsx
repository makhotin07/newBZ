import React, { useRef, useEffect } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  const emojiCategories = {
    'Smileys & Emotion': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😙', '😚',
    ],
    'Objects & Symbols': [
      '📄', '📝', '📊', '📈', '📉', '📋', '📌', '📍', '💡', '🔍',
      '🔧', '🔨', '⚙️', '🎯', '🎪', '🎨', '🖼️', '📱', '💻', '⌨️',
    ],
    'Nature & Animals': [
      '🌟', '⭐', '💫', '✨', '🌙', '☀️', '🌈', '🔥', '💧', '🌱',
      '🌿', '🍀', '🌸', '🌺', '🌻', '🌷', '🦋', '🐝', '🦄', '🎄',
    ],
    'Food & Drink': [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🥝', '🍅',
      '🥕', '🌽', '🍞', '🧀', '🥪', '🍔', '🍕', '☕', '🍵', '🥤',
    ],
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72 max-h-80 overflow-y-auto"
    >
      <div className="space-y-4">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onEmojiSelect(emoji)}
                  className="text-xl p-1 hover:bg-gray-100 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
