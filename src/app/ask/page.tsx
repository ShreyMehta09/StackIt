import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AskQuestionPage() {
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

      {/* Form */}
      <div className="card">
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              placeholder="Provide more details about your question. Include what you've tried and what you're expecting to happen."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Include all the information someone would need to answer your question.
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
            <button type="submit" className="btn-primary">
              Post Question
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