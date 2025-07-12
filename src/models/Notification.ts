import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accepted_answer' | 'system'
  title: string
  message: string
  relatedQuestion?: mongoose.Types.ObjectId
  relatedAnswer?: mongoose.Types.ObjectId
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['answer', 'comment', 'mention', 'vote', 'accepted_answer', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedQuestion: {
    type: Schema.Types.ObjectId,
    ref: 'Question'
  },
  relatedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for better performance
NotificationSchema.index({ recipient: 1, isRead: 1 })
NotificationSchema.index({ createdAt: -1 })

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true
  return this.save()
}

// Static method to create notification
NotificationSchema.statics.createNotification = async function(data: Partial<INotification>) {
  const notification = new this(data)
  return notification.save()
}

// Static method to mark all as read for a user
NotificationSchema.statics.markAllAsRead = async function(userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  )
}

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)