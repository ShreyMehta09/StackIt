'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Smile,
  Undo,
  Redo,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  minHeight = "200px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '���', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐',
    '💯', '💪', '🔥', '⭐', '✨', '💡', '❤️', '💙', '💚', '💛'
  ]

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isComposing) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== value) {
        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null
        const startOffset = range?.startOffset || 0
        const endOffset = range?.endOffset || 0
        
        editorRef.current.innerHTML = value || ''
        
        // Restore cursor position if possible
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange()
            const textNode = editorRef.current.firstChild
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0))
            newRange.setEnd(textNode, Math.min(endOffset, textNode.textContent?.length || 0))
            selection?.removeAllRanges()
            selection?.addRange(newRange)
          } catch (e) {
            // Ignore cursor restoration errors
          }
        }
      }
    }
  }, [value, isComposing])

  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand(command, false, value)
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing && editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange, isComposing])

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            execCommand('redo')
          } else {
            execCommand('undo')
          }
          break
        case 'y':
          e.preventDefault()
          execCommand('redo')
          break
      }
    }

    // Handle Enter key to create proper line breaks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      execCommand('insertHTML', '<br><br>')
    }
  }, [execCommand])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (text) {
      // Insert text as HTML to maintain formatting
      const htmlText = text.replace(/\n/g, '<br>')
      execCommand('insertHTML', htmlText)
    }
  }, [execCommand])

  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji)
    setShowEmojiPicker(false)
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${linkText}</a>`
      execCommand('insertHTML', linkHtml)
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`
        execCommand('insertHTML', imageHtml)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatButtons = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough' },
  ]

  const listButtons = [
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
  ]

  const alignButtons = [
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
  ]

  const historyButtons = [
    { command: 'undo', icon: Undo, title: 'Undo (Ctrl+Z)' },
    { command: 'redo', icon: Redo, title: 'Redo (Ctrl+Y)' },
  ]

  return (
    <div className="border border-[#00ff7f] rounded-lg overflow-hidden shadow-[0_0_16px_2px_#00ff7f22] focus-within:ring-2 focus-within:ring-[#00ff7f] focus-within:border-[#00ff7f] bg-black">
      {/* Toolbar */}
      <div className="bg-black border-b border-[#00ff7f33] p-2 flex flex-wrap gap-1">
        {/* Format Buttons */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          {formatButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* List Buttons */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          {listButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Alignment Buttons */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          {alignButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Link Button */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => setShowLinkDialog(true)}
            className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>

        {/* Image Button */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
            title="Upload Image"
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Emoji Button */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2 relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
              <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Buttons */}
        <div className="flex gap-1">
          {historyButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              className="p-2 text-[#00ff7f] hover:text-black hover:bg-[#00ff7f] rounded transition-colors"
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="p-4 focus:outline-none bg-black text-[#00ff7f] min-h-[150px]"
        style={{ 
          minHeight,
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'bidi-override'
        }}
        data-placeholder={placeholder}
        dir="ltr"
        spellCheck="true"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
              <button
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                  setLinkText('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          direction: ltr;
          unicode-bidi: bidi-override;
        }
        
        [contenteditable] {
          direction: ltr !important;
          unicode-bidi: bidi-override !important;
        }
        
        [contenteditable] * {
          direction: ltr !important;
          unicode-bidi: bidi-override !important;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          direction: ltr;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 20px;
          direction: ltr;
        }
        
        [contenteditable] li {
          margin: 4px 0;
          direction: ltr;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
          direction: ltr;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
      `}</style>
    </div>
  )
}