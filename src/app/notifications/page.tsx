'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell, 
  Check, 
  MessageSquare, 
  ArrowUp, 
  User, 
  Award, 
  Clock,
  Trash2,
  CheckCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  _id: string
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accepted_answer' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  sender: {
    username: string
    avatar?: string
  }
  relatedQuestion?: {
    _id: string
    title: string
    slug: string
  }
  relatedAnswer?: {
    _id: string
    content: string
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, currentPage, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const unreadParam = filter === 'unread' ? '&unread=true' : ''
      const response = await fetch(`/api/notifications?page=${currentPage}&limit=20${unreadParam}`)
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications)
        setTotalPages(data.pagination.pages)
        setUnreadCount(data.unreadCount)
      } else {
        console.error('Failed to fetch notifications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        )
        if (!notifications.find(n => n._id === notificationId)?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="w-5 h-5 text-blue-600" />
      case 'vote':
        return <ArrowUp className="w-5 h-5 text-green-600" />
      case 'accepted_answer':
        return <Award className="w-5 h-5 text-yellow-600" />
      case 'mention':
        return <User className="w-5 h-5 text-purple-600" />
      case 'system':
        return <Bell className="w-5 h-5 text-gray-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
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

  const getNotificationLink = (notification: Notification) => {
    if (notification.relatedQuestion) {
      return `/questions/${notification.relatedQuestion._id}`
    }
    return '#'
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-10">
          <div className="bg-black border border-[#00ff7f55] rounded-2xl p-12 text-center flex flex-col items-center shadow-[0_0_16px_2px_#00ff7f22]">
            <Bell className="w-16 h-16 mb-4 text-[#00ff7f] drop-shadow-[0_0_8px_#00ff7f]" />
            <h1 className="text-2xl font-bold text-white mb-4">Please Log In</h1>
            <p className="text-gray-400 mb-6">You need to be logged in to view notifications.</p>
            <Link href="/login" className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f]">
              Log In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight">Notifications</h1>
            <p className="text-gray-400 text-lg">
              {unreadCount > 0 ? (
                <span className="text-[#00ff7f] font-bold">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
              ) : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-[#00ff7f] text-black px-5 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f] mt-4 sm:mt-0"
            >
              <CheckCheck className="w-5 h-5 inline-block mr-2" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-[#222] pb-4 w-full">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium border transition-all
              ${filter === 'all'
                ? 'bg-[#00ff7f] text-black border-[#00ff7f] shadow-[0_0_8px_#00ff7f]'
                : 'bg-black text-white border-[#222] hover:border-[#00ff7f88] hover:text-[#00ff7f]'}
            `}
          >
            All Notifications
          </button>
          <button
            onClick={() => { setFilter('unread'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium border transition-all
              ${filter === 'unread'
                ? 'bg-[#00ff7f] text-black border-[#00ff7f] shadow-[0_0_8px_#00ff7f]'
                : 'bg-black text-white border-[#222] hover:border-[#00ff7f88] hover:text-[#00ff7f]'}
            `}
          >
            Unread <span className="ml-1">({unreadCount})</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-6 w-full">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-black border border-[#00ff7f33] rounded-2xl p-6 flex gap-4 animate-pulse shadow-[0_0_16px_2px_#00ff7f22]">
                  <div className="w-10 h-10 bg-[#222] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#222] rounded w-3/4" />
                    <div className="h-3 bg-[#222] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-black rounded-2xl p-6 flex gap-4 items-start transition-shadow shadow-[0_0_16px_2px_#00ff7f22] border ${!notification.isRead ? 'border-[#00ff7f] shadow-[0_0_24px_4px_#00ff7f88]' : 'border-[#222]'}`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        {/* Related content link */}
                        {notification.relatedQuestion && (
                          <Link
                            href={getNotificationLink(notification)}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className="text-[#00ff7f] hover:text-white text-sm font-medium"
                          >
                            View Question: {notification.relatedQuestion.title}
                          </Link>
                        )}
                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#00ff7f]" />
                            <Link 
                              href={`/users/${notification.sender.username}`}
                              className="hover:text-[#00ff7f] text-white/80"
                            >
                              {notification.sender.username}
                            </Link>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-white/60" />
                            <span className="text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-[#00ff7f] hover:text-white transition-colors rounded-full bg-[#00ff7f22]"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full bg-[#222]"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg border transition-all
                            ${currentPage === pageNum
                              ? 'bg-[#00ff7f] text-black border-[#00ff7f] shadow-[0_0_8px_#00ff7f]'
                              : 'bg-black text-white border-[#222] hover:border-[#00ff7f88] hover:text-[#00ff7f]'}
                          `}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="bg-black border border-[#00ff7f55] rounded-2xl p-12 text-center flex flex-col items-center shadow-[0_0_16px_2px_#00ff7f22]">
              <Bell className="w-20 h-20 mb-6 text-[#00ff7f] drop-shadow-[0_0_32px_#00ff7f]" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new notifications.'
                  : 'When you receive answers, votes, or mentions, they\'ll appear here.'
                }
              </p>
              {filter === 'unread' && (
                <button
                  onClick={() => setFilter('all')}
                  className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f]"
                >
                  View All Notifications
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}