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
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Form */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <Link href="/questions" className="inline-flex items-center text-[#00ff7f] hover:text-white mb-4 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Link>
            <h1 className="text-4xl font-extrabold text-white mb-2">Ask a Question</h1>
            <p className="text-white/70 text-lg">
              Get help from the community by asking a clear, detailed question.
            </p>
          </div>
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/60 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {/* Form */}
          <div className="rounded-lg bg-black border border-[#00ff7f33] shadow-[0_0_32px_4px_#00ff7f33] p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="title" className="block text-base font-semibold text-white mb-2">
                  Question Title <span className="text-[#00ff7f]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your programming question? Be specific."
                  className="w-full px-4 py-3 bg-black border border-[#00ff7f] rounded-lg text-white focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] placeholder-white/60 shadow-[0_0_16px_2px_#00ff7f22]"
                  required
                />
                <p className="text-sm text-white/60 mt-1">
                  Be specific and imagine you're asking a question to another person.
                </p>
              </div>
              <div>
                <label className="block text-base font-semibold text-white mb-2">
                  Description <span className="text-[#00ff7f]">*</span>
                </label>
                <div className="bg-black border border-[#00ff7f] rounded-lg text-white shadow-[0_0_16px_2px_#00ff7f22]">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Provide more details about your question. Include what you've tried and what you're expecting to happen. You can format your text, add code snippets, images, and links."
                    minHeight="300px"
                  />
                </div>
                <p className="text-sm text-white/60 mt-1">
                  Include all the information someone would need to answer your question. Use the formatting tools to make your question clear and readable.
                </p>
              </div>
              <div>
                <label htmlFor="tags" className="block text-base font-semibold text-white mb-2">
                  Tags <span className="text-[#00ff7f]">*</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. javascript, react, nodejs (separate with commas)"
                  className="w-full px-4 py-3 bg-black border border-[#00ff7f] rounded-lg text-white focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] placeholder-white/60 shadow-[0_0_16px_2px_#00ff7f22]"
                  required
                />
                <p className="text-sm text-white/60 mt-1">
                  Add up to 5 tags to describe what your question is about.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !description.trim() || !tags.trim()}
                  className="bg-[#00ff7f] text-black font-bold px-6 py-3 rounded-lg shadow-[0_0_16px_2px_#00ff7f] hover:bg-[#00e673] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Question'}
                </button>
                <Link href="/questions" className="border border-[#00ff7f] text-[#00ff7f] px-6 py-3 rounded-lg font-bold hover:bg-[#00ff7f] hover:text-black transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
        {/* Right: Tips Card */}
        <div className="w-full md:w-80 mt-8 md:mt-0 md:ml-4 rounded-lg bg-black border border-[#00ff7f] shadow-[0_0_32px_4px_#00ff7f33] p-6 flex flex-col items-start">
          <h3 className="text-lg font-bold text-[#00ff7f] mb-4">Tips for asking a good question:</h3>
          <ul className="space-y-4 text-white/90 text-base">
            <li className="flex items-start gap-2"><span className="text-[#00ff7f]">&#10003;</span> Search to see if your question has been asked before</li>
            <li className="flex items-start gap-2"><span className="text-[#00ff7f]">&#10003;</span> Write a clear, specific title that summarizes your problem</li>
            <li className="flex items-start gap-2"><span className="text-[#00ff7f]">&#10003;</span> Describe what you've tried and what didn't work</li>
            <li className="flex items-start gap-2"><span className="text-[#00ff7f]">&#10003;</span> Include relevant code, error messages, or screenshots</li>
            <li className="flex items-start gap-2"><span className="text-[#00ff7f]">&#10003;</span> Use proper tags to help others find your question</li>
          </ul>
        </div>
      </div>
    </div>
  )
}