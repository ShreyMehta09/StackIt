'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  Flag, 
  UserPlus,
  Activity,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Settings,
  Ban,
  Lock,
  Eye,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Pin,
  Crown,
  Hash
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AdminStats {
  totalUsers: number
  totalQuestions: number
  totalAnswers: number
  totalComments: number
  pendingReports: number
  bannedUsers: number
  lockedQuestions: number
  deletedContent: number
}

interface ModerationItem {
  _id: string
  type: 'user' | 'question' | 'answer'
  title?: string
  content?: string
  username?: string
  email?: string
  author?: {
    username: string
    reputation: number
  }
  reputation?: number
  role?: string
  voteScore?: number
  isLocked?: boolean
  isPinned?: boolean
  isHidden?: boolean
  isDeleted?: boolean
  isBanned?: boolean
  banReason?: string
  reportCount?: number
  createdAt: string
  lastActivity?: string
  joinedAt?: string
  stats?: {
    questionsAsked: number
    answersGiven: number
    upvotesReceived: number
    acceptedAnswers: number
  }
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [actionReason, setActionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    console.log('Admin page - Auth loading:', isLoading, 'User:', user) // Debug log
    
    if (isLoading) return // Wait for auth to load
    
    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/login')
      return
    }
    
    if (user.role !== 'admin') {
      console.log('User role is not admin:', user.role, 'redirecting to home')
      router.push('/')
      return
    }

    console.log('User is admin, fetching admin data')
    fetchAdminData()
  }, [user, isLoading, router, activeTab, currentPage, searchQuery, filterStatus])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'overview') {
        // Fetch admin stats
        const statsResponse = await fetch('/api/admin/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          console.error('Failed to fetch admin stats:', statsResponse.status)
          // Set default stats if API fails
          setStats({
            totalUsers: 0,
            totalQuestions: 0,
            totalAnswers: 0,
            totalComments: 0,
            pendingReports: 0,
            bannedUsers: 0,
            lockedQuestions: 0,
            deletedContent: 0
          })
        }
      } else {
        // Fetch moderation items based on active tab
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          search: searchQuery,
          status: filterStatus
        })

        let endpoint = ''
        switch (activeTab) {
          case 'users':
            endpoint = `/api/admin/users?${params}`
            break
          case 'questions':
            endpoint = `/api/admin/content?type=question&${params}`
            break
          case 'answers':
            endpoint = `/api/admin/content?type=answer&${params}`
            break
        }

        if (endpoint) {
          const response = await fetch(endpoint)
          if (response.ok) {
            const data = await response.json()
            setModerationItems(activeTab === 'users' ? data.users || [] : data.content || [])
            setTotalPages(data.pagination?.pages || 1)
          } else {
            console.error(`Failed to fetch ${activeTab}:`, response.status)
            setModerationItems([])
            setTotalPages(1)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      // Set default values on error
      if (activeTab === 'overview') {
        setStats({
          totalUsers: 0,
          totalQuestions: 0,
          totalAnswers: 0,
          totalComments: 0,
          pendingReports: 0,
          bannedUsers: 0,
          lockedQuestions: 0,
          deletedContent: 0
        })
      } else {
        setModerationItems([])
        setTotalPages(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async () => {
    if (selectedItems.length === 0 || !actionType || !actionReason.trim()) return

    try {
      setSubmitting(true)
      
      // Implement bulk action API call
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          items: selectedItems,
          reason: actionReason,
          type: activeTab
        }),
      })

      if (response.ok) {
        setShowActionModal(false)
        setSelectedItems([])
        setActionReason('')
        setActionType('')
        fetchAdminData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to perform bulk action')
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      alert('Failed to perform bulk action')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = (item: ModerationItem) => {
    if (item.type === 'user') {
      if (item.isBanned) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/60 text-red-400 border border-red-500">Banned</span>;
      if (item.role === 'admin') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#00ff7f22] text-[#00ff7f] border border-[#00ff7f]">Admin</span>;
      if (item.role === 'moderator') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-400 border border-blue-500">Moderator</span>;
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-800 text-white border border-[#222]">Active</span>;
    } else {
      const badges = [];
      if (item.isDeleted) badges.push(<span key="deleted" className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-900/80 text-gray-400 border border-gray-600">Deleted</span>);
      if (item.isHidden) badges.push(<span key="hidden" className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/60 text-yellow-400 border border-yellow-500">Hidden</span>);
      if (item.isLocked) badges.push(<span key="locked" className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-400 border border-blue-500">Locked</span>);
      if (item.isPinned) badges.push(<span key="pinned" className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-900/60 text-purple-400 border border-purple-500">Pinned</span>);
      if (item.reportCount && item.reportCount > 0) badges.push(<span key="reported" className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-900/60 text-orange-400 border border-orange-500">{item.reportCount} Reports</span>);
      if (badges.length === 0) badges.push(<span key="active" className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-800 text-white border border-[#222]">Active</span>);
      return <div className="flex gap-1 flex-wrap">{badges}</div>;
    }
  }

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this page. 
            {user && <span className="block mt-2">Current role: {user.role}</span>}
          </p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-6xl mx-auto flex flex-col space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#00ff7f] drop-shadow-[0_0_8px_#00ff7f]" />
              Admin Control Center
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome, {user.username}! Manage and moderate the StackIt platform here.
            </p>
          </div>
          <Link href="/admin/create-user" className="bg-[#00ff7f] text-black font-bold px-6 py-3 rounded-lg border-2 border-green-600 hover:bg-[#00e673] transition flex items-center gap-2 mt-6 sm:mt-0">
            <UserPlus className="w-4 h-4" />
            Create Admin
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#222]">
          <nav className="flex gap-8 px-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'questions', label: 'Questions', icon: HelpCircle },
              { id: 'answers', label: 'Answers', icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  setCurrentPage(1)
                  setSelectedItems([])
                }}
                className={`pb-3 px-1 border-b-2 font-semibold text-lg transition-all flex items-center gap-2
                  ${activeTab === id
                    ? 'border-[#00ff7f] text-[#00ff7f]'
                    : 'border-transparent text-white hover:text-[#00ff7f88] hover:border-[#00ff7f44]'}
                `}
                style={{ background: 'transparent' }}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex flex-col gap-2 shadow-[0_0_16px_2px_#00ff7f22] animate-pulse">
                    <div className="h-4 bg-[#222] rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-[#222] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Each stat card */}
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Total Questions</p>
                    <p className="text-2xl font-bold text-white">{stats.totalQuestions.toLocaleString()}</p>
                  </div>
                  <HelpCircle className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Total Answers</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAnswers.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Pending Reports</p>
                    <p className="text-2xl font-bold text-[#00ff7f]">{stats.pendingReports.toLocaleString()}</p>
                  </div>
                  <Flag className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Banned Users</p>
                    <p className="text-2xl font-bold text-[#00ff7f]">{stats.bannedUsers.toLocaleString()}</p>
                  </div>
                  <Ban className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Locked Questions</p>
                    <p className="text-2xl font-bold text-[#00ff7f]">{stats.lockedQuestions.toLocaleString()}</p>
                  </div>
                  <Lock className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Total Comments</p>
                    <p className="text-2xl font-bold text-white">{stats.totalComments.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-[#00ff7f]" />
                </div>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center justify-between shadow-[0_0_16px_2px_#00ff7f22]">
                  <div>
                    <p className="text-sm font-medium text-[#00ff7f]">Deleted Content</p>
                    <p className="text-2xl font-bold text-[#00ff7f]">{stats.deletedContent.toLocaleString()}</p>
                  </div>
                  <Trash2 className="w-8 h-8 text-[#00ff7f]" />
                </div>
              </div>
            ) : null}

            {/* Quick Actions */}
            <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 shadow-[0_0_16px_2px_#00ff7f22]">
              <h3 className="text-lg font-semibold text-[#00ff7f] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-3 p-4 border border-[#00ff7f] rounded-2xl hover:bg-[#00ff7f11] transition-colors text-left bg-black text-[#00ff7f] font-semibold shadow-[0_0_8px_#00ff7f22]"
                >
                  <Users className="w-6 h-6 text-[#00ff7f]" />
                  <div>
                    <h4 className="font-medium text-white">Moderate Users</h4>
                    <p className="text-sm text-[#00ff7f99]">Manage user accounts and permissions</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-3 p-4 border border-[#00ff7f] rounded-2xl hover:bg-[#00ff7f11] transition-colors text-left bg-black text-[#00ff7f] font-semibold shadow-[0_0_8px_#00ff7f22]"
                >
                  <HelpCircle className="w-6 h-6 text-[#00ff7f]" />
                  <div>
                    <h4 className="font-medium text-white">Moderate Questions</h4>
                    <p className="text-sm text-[#00ff7f99]">Review and moderate questions</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('answers')}
                  className="flex items-center gap-3 p-4 border border-[#00ff7f] rounded-2xl hover:bg-[#00ff7f11] transition-colors text-left bg-black text-[#00ff7f] font-semibold shadow-[0_0_8px_#00ff7f22]"
                >
                  <MessageSquare className="w-6 h-6 text-[#00ff7f]" />
                  <div>
                    <h4 className="font-medium text-white">Moderate Answers</h4>
                    <p className="text-sm text-[#00ff7f99]">Review and moderate answers</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Tabs */}
        {['users', 'questions', 'answers'].includes(activeTab) && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 shadow-[0_0_16px_2px_#00ff7f22]">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00ff7f] w-5 h-5 drop-shadow-[0_0_8px_#00ff7f]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab}...`}
                    className="w-full pl-10 pr-4 py-2 border border-[#00ff7f55] rounded-2xl focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] bg-black text-white placeholder-[#00ff7f77] shadow-[0_0_16px_2px_#00ff7f22]"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-[#00ff7f55] rounded-2xl focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] bg-black text-white"
                  >
                    <option value="all">All Status</option>
                    {activeTab === 'users' ? (
                      <>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="admin">Admins</option>
                      </>
                    ) : (
                      <>
                        <option value="active">Active</option>
                        <option value="locked">Locked</option>
                        <option value="reported">Reported</option>
                        <option value="deleted">Deleted</option>
                      </>
                    )}
                  </select>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={() => setShowActionModal(true)}
                      className="bg-[#00ff7f] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00e673] transition border-2 border-green-600 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Bulk Actions ({selectedItems.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Moderation Table */}
            <div className="bg-black border border-[#00ff7f55] rounded-2xl shadow-[0_0_16px_2px_#00ff7f22] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#00ff7f22]">
                  <thead className="bg-[#00ff7f11]">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(moderationItems.map(item => item._id))
                            } else {
                              setSelectedItems([])
                            }
                          }}
                          className="rounded border-[#00ff7f] bg-black"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        {activeTab === 'users' ? 'User' : 'Content'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        {activeTab === 'users' ? 'Role' : 'Author'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        {activeTab === 'users' ? 'Reputation' : 'Score'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#00ff7f] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-[#00ff7f11]">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="w-4 h-4 bg-[#00ff7f22] rounded"></div></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[#00ff7f22] rounded-full"></div>
                              <div className="ml-4">
                                <div className="h-4 bg-[#00ff7f22] rounded w-24"></div>
                                <div className="h-3 bg-[#00ff7f22] rounded w-32 mt-1"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><div className="h-4 bg-[#00ff7f22] rounded w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-[#00ff7f22] rounded w-12"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-[#00ff7f22] rounded w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-[#00ff7f22] rounded w-20"></div></td>
                          <td className="px-6 py-4"><div className="h-8 bg-[#00ff7f22] rounded w-8 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : moderationItems.length > 0 ? (
                      moderationItems.map((item) => (
                        <tr key={item._id} className="hover:bg-[#00ff7f11] transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item._id])
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== item._id))
                                }
                              }}
                              className="rounded border-[#00ff7f] bg-black"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[#00ff7f] rounded-full flex items-center justify-center shadow-[0_0_8px_#00ff7f88]">
                                <User className="w-5 h-5 text-black" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {activeTab === 'users' ? item.username : (item.title || 'Answer')}
                                </div>
                                <div className="text-sm text-[#00ff7f99] truncate max-w-xs">
                                  {activeTab === 'users' ? item.email : (item.content?.substring(0, 100) + '...')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {activeTab === 'users' ? (
                              <div className="flex items-center gap-1">
                                {item.role === 'admin' && <Crown className="w-4 h-4 text-[#00ff7f]" />}
                                {item.role === 'moderator' && <Shield className="w-4 h-4 text-[#00ff7f]" />}
                                <span className="capitalize">{item.role}</span>
                              </div>
                            ) : (
                              item.author?.username || 'Unknown'
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {activeTab === 'users' ? (
                              <div className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-yellow-400" />
                                {item.reputation}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {(item.voteScore || 0) > 0 ? (
                                  <ArrowUp className="w-4 h-4 text-[#00ff7f]" />
                                ) : (item.voteScore || 0) < 0 ? (
                                  <ArrowDown className="w-4 h-4 text-[#00ff7f]" />
                                ) : null}
                                <span className={`font-medium text-[#00ff7f]`}>
                                  {item.voteScore || 0}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(item)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#00ff7f99]">
                            {formatTimeAgo(activeTab === 'users' ? item.joinedAt! : item.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#00ff7f] hover:text-white">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-[#00ff7f99]">
                          No {activeTab} found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-black px-4 py-3 border-t border-[#00ff7f22] sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-[#00ff7f99]">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-[#00ff7f55] rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00ff7f11] bg-black text-white"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-[#00ff7f55] rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00ff7f11] bg-black text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-black rounded-2xl max-w-md w-full border border-[#00ff7f55] shadow-[0_0_16px_2px_#00ff7f22]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[#00ff7f]">
                    Bulk Moderation ({selectedItems.length} selected)
                  </h3>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="text-[#00ff7f] hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#00ff7f] mb-2">
                      Moderation Action
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full p-3 border border-[#00ff7f55] rounded-2xl focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] bg-black text-white"
                    >
                      <option value="">Select action...</option>
                      {activeTab === 'users' ? (
                        <>
                          <option value="ban">Ban Users</option>
                          <option value="unban">Unban Users</option>
                          <option value="promote">Promote to Moderator</option>
                          <option value="demote">Demote to User</option>
                        </>
                      ) : (
                        <>
                          <option value="lock">Lock Content</option>
                          <option value="unlock">Unlock Content</option>
                          <option value="hide">Hide Content</option>
                          <option value="delete">Delete Content</option>
                          {activeTab === 'questions' && <option value="pin">Pin Questions</option>}
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#00ff7f] mb-2">
                      Reason *
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Enter reason for this action..."
                      className="w-full p-3 border border-[#00ff7f55] rounded-2xl focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] bg-black text-white"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowActionModal(false)}
                      className="flex-1 px-4 py-2 border border-[#00ff7f55] text-white rounded-2xl hover:bg-[#00ff7f11]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkAction}
                      disabled={submitting || !actionType || !actionReason.trim()}
                      className="flex-1 px-4 py-2 bg-[#00ff7f] text-black rounded-2xl font-bold hover:bg-[#00e673] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Processing...' : 'Apply Action'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}