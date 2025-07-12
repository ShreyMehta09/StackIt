import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: 'guest' | 'user' | 'admin'
  avatar?: string
  bio?: string
  reputation: number
  joinedAt: Date
  lastActive: Date
  isVerified: boolean
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
    enum: ['guest', 'user', 'admin'],
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
  isVerified: {
    type: Boolean,
    default: false
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
UserSchema.index({ email: 1 })
UserSchema.index({ username: 1 })
UserSchema.index({ reputation: -1 })

// Virtual for user's display name
UserSchema.virtual('displayName').get(function() {
  return this.username
})

// Method to update last active
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date()
  return this.save()
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)