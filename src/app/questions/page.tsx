import Link from 'next/link'
import { Plus, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react'

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="text-gray-600 mt-2">0 questions</p>
        </div>
        <Link href="/ask" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium">
          Newest
        </button>
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
          Active
        </button>
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
          Unanswered
        </button>
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
          Most Voted
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {/* Empty State */}
        <div className="card text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
          <p className="text-gray-600 mb-6">Be the first to ask a question and help build our community!</p>
          <Link href="/ask" className="btn-primary">
            Ask the First Question
          </Link>
        </div>
      </div>
    </div>
  )
}