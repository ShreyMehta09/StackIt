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
  Crown
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
      if (item.isBanned) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Banned</span>
      if (item.role === 'admin') return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Admin</span>
      if (item.role === 'moderator') return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Moderator</span>
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
    } else {
      const badges = []
      if (item.isDeleted) badges.push(<span key="deleted" className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Deleted</span>)
      if (item.isHidden) badges.push(<span key="hidden" className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Hidden</span>)
      if (item.isLocked) badges.push(<span key="locked" className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Locked</span>)
      if (item.isPinned) badges.push(<span key="pinned" className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Pinned</span>)
      if (item.reportCount && item.reportCount > 0) badges.push(<span key="reported" className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">{item.reportCount} Reports</span>)
      if (badges.length === 0) badges.push(<span key="active" className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>)
      return <div className="flex gap-1 flex-wrap">{badges}</div>
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user.username}! Comprehensive platform moderation and management
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/admin/create-user" className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Create Admin
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'questions', label: 'Questions', icon: HelpCircle },
            { id: 'answers', label: 'Answers', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setCurrentPage(1)
                setSelectedItems([])
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</p>
                  </div>
                  <HelpCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Answers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pendingReports.toLocaleString()}</p>
                  </div>
                  <Flag className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Banned Users</p>
                    <p className="text-2xl font-bold text-red-600">{stats.bannedUsers.toLocaleString()}</p>
                  </div>
                  <Ban className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Locked Questions</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lockedQuestions.toLocaleString()}</p>
                  </div>
                  <Lock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Comments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deleted Content</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.deletedContent.toLocaleString()}</p>
                  </div>
                  <Trash2 className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('users')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Moderate Users</h4>
                  <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('questions')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <HelpCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Moderate Questions</h4>
                  <p className="text-sm text-gray-600">Review and moderate questions</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('answers')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Moderate Answers</h4>
                  <p className="text-sm text-gray-600">Review and moderate answers</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Tabs */}
      {activeTab !== 'overview' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="btn-primary flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Bulk Actions ({selectedItems.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Moderation Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'users' ? 'User' : 'Content'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'users' ? 'Role' : 'Author'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'users' ? 'Reputation' : 'Score'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="ml-4">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : moderationItems.length > 0 ? (
                    moderationItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
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
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {activeTab === 'users' ? item.username : (item.title || 'Answer')}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {activeTab === 'users' ? item.email : (item.content?.substring(0, 100) + '...')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeTab === 'users' ? (
                            <div className="flex items-center gap-1">
                              {item.role === 'admin' && <Crown className="w-4 h-4 text-yellow-600" />}
                              {item.role === 'moderator' && <Shield className="w-4 h-4 text-blue-600" />}
                              <span className="capitalize">{item.role}</span>
                            </div>
                          ) : (
                            item.author?.username || 'Unknown'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeTab === 'users' ? (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-yellow-600" />
                              {item.reputation}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {(item.voteScore || 0) > 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-600" />
                              ) : (item.voteScore || 0) < 0 ? (
                                <ArrowDown className="w-4 h-4 text-red-600" />
                              ) : null}
                              <span className={`font-medium ${
                                (item.voteScore || 0) > 0 ? 'text-green-600' : 
                                (item.voteScore || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {item.voteScore || 0}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatTimeAgo(activeTab === 'users' ? item.joinedAt! : item.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No {activeTab} found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulk Actions ({selectedItems.length} items)
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter reason for this action..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAction}
                    disabled={submitting || !actionType || !actionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}