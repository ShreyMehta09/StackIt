import Link from 'next/link'
import { MessageSquare, Users, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to StackIt
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A community-driven Q&A platform where developers help each other solve problems and share knowledge.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/questions" className="btn-primary">
            Browse Questions
          </Link>
          <Link href="/ask" className="btn-secondary">
            Ask Question
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">0</h3>
          <p className="text-gray-600">Questions Asked</p>
        </div>
        <div className="card text-center">
          <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">0</h3>
          <p className="text-gray-600">Active Users</p>
        </div>
        <div className="card text-center">
          <Award className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">0</h3>
          <p className="text-gray-600">Answers Given</p>
        </div>
      </div>

      {/* Recent Questions Preview */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Questions</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No questions yet. Be the first to ask!</p>
          <Link href="/ask" className="btn-primary mt-4 inline-block">
            Ask the First Question
          </Link>
        </div>
      </div>
    </div>
  )
}