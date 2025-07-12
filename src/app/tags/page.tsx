import { Search, Hash } from 'lucide-react'

export default function TagsPage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl flex flex-col items-center space-y-10">
        {/* Header */}
        <div className="w-full">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Tags</h1>
          <p className="text-gray-400 text-lg">Browse questions by topic. Tags help organize and find relevant content.</p>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff7f] w-6 h-6 drop-shadow-[0_0_8px_#00ff7f]" />
          <input
            type="text"
            placeholder="Search tags..."
            className="w-full pl-12 pr-4 py-3 bg-black border border-[#00ff7f55] rounded-2xl text-white placeholder-white/60 shadow-[0_0_16px_2px_#00ff7f22] focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] transition"
          />
        </div>

        {/* Tags Grid / Empty State */}
        <div className="w-full flex flex-col items-center justify-center pt-10">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center">
            <Hash className="w-24 h-24 mb-6 text-[#00ff7f] drop-shadow-[0_0_32px_#00ff7f]" />
            <h3 className="text-2xl font-semibold text-white mb-2">No tags yet</h3>
            <p className="text-gray-400">Tags will appear here once questions are posted with tags.</p>
          </div>
        </div>
      </div>
    </div>
  )
}