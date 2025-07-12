'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Process tags - split by comma and clean up
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
      
      if (tagArray.length === 0) {
        alert('Please add at least one tag')
        setIsSubmitting(false)
        return
      }
      
      if (tagArray.length > 5) {
        alert('Maximum 5 tags allowed')
        setIsSubmitting(false)
        return
      }
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          title: title.trim(),
          content: description,
          tags: tagArray
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Redirect to the questions page
        window.location.href = '/questions'
      } else {
        setError(data.error || 'Failed to post question')
      }
    } catch (error) {
      console.error('Error posting question:', error)
      alert('An error occurred while posting your question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/questions" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-600 mt-2">
          Get help from the community by asking a clear, detailed question.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question? Be specific."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific and imagine you're asking a question to another person.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide more details about your question. Include what you've tried and what you're expecting to happen. You can format your text, add code snippets, images, and links."
              minHeight="300px"
            />
            <p className="text-sm text-gray-500 mt-1">
              Include all the information someone would need to answer your question. Use the formatting tools to make your question clear and readable.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. javascript, react, nodejs (separate with commas)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Add up to 5 tags to describe what your question is about.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !description.trim() || !tags.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
            <Link href="/questions" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for asking a good question:</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Search to see if your question has been asked before</li>
          <li>• Write a clear, specific title that summarizes your problem</li>
          <li>• Describe what you've tried and what didn't work</li>
          <li>• Include relevant code, error messages, or screenshots</li>
          <li>• Use proper tags to help others find your question</li>
        </ul>
      </div>
    </div>
  )
}