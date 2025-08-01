import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: 'guest' | 'user' | 'moderator' | 'admin'
  avatar?: string
  bio?: string
  reputation: number
  joinedAt: Date
  lastActive: Date
  isActive: boolean
  isVerified: boolean
  isBanned: boolean
  banReason?: string
  banExpiresAt?: Date
  bannedAt?: Date
  bannedBy?: mongoose.Types.ObjectId
  unbannedAt?: Date
  unbannedBy?: mongoose.Types.ObjectId
  roleChangedAt?: Date
  roleChangedBy?: mongoose.Types.ObjectId
  preferences: {
    emailNotifications: boolean
    theme: 'light' | 'dark'
  }
  stats: {
    questionsAsked: number
    answersGiven: number
    upvotesReceived: number
    downvotesReceived: number
    acceptedAnswers: number
  }
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'moderator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  banExpiresAt: {
    type: Date,
    default: null
  },
  bannedAt: {
    type: Date,
    default: null
  },
  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  unbannedAt: {
    type: Date,
    default: null
  },
  unbannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  roleChangedAt: {
    type: Date,
    default: null
  },
  roleChangedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  stats: {
    questionsAsked: {
      type: Number,
      default: 0
    },
    answersGiven: {
      type: Number,
      default: 0
    },
    upvotesReceived: {
      type: Number,
      default: 0
    },
    downvotesReceived: {
      type: Number,
      default: 0
    },
    acceptedAnswers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for better performance
// Note: email and username indexes are created automatically by unique: true
UserSchema.index({ reputation: -1 })
UserSchema.index({ role: 1 })
UserSchema.index({ isBanned: 1 })
UserSchema.index({ isActive: 1 })

// Virtual for user's display name
UserSchema.virtual('displayName').get(function() {
  return this.username
})

// Method to update last active
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date()
  return this.save()
}

// Method to check if user is currently banned
UserSchema.methods.isCurrentlyBanned = function() {
  if (!this.isBanned) return false
  if (!this.banExpiresAt) return true // Permanent ban
  return new Date() < this.banExpiresAt
}

// Method to check if user can perform action based on role
UserSchema.methods.hasRole = function(requiredRole: string) {
  const roleHierarchy = ['guest', 'user', 'moderator', 'admin']
  const userRoleIndex = roleHierarchy.indexOf(this.role)
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
  return userRoleIndex >= requiredRoleIndex
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)