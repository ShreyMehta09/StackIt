import { Search, Hash } from 'lucide-react'

export default function TagsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
        <p className="text-gray-600 mt-2">
          Browse questions by topic. Tags help organize and find relevant content.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tags..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty State */}
        <div className="col-span-full">
          <div className="card text-center py-12">
            <Hash className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tags yet</h3>
            <p className="text-gray-600">Tags will appear here once questions are posted with tags.</p>
          </div>
        </div>
      </div>
    </div>
  )
}