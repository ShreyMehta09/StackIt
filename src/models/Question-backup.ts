import mongoose, { Document, Schema } from 'mongoose'

export interface IQuestion extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  tags: string[]
  views: number
  upvotes: mongoose.Types.ObjectId[]
  downvotes: mongoose.Types.ObjectId[]
  answers: mongoose.Types.ObjectId[]
  acceptedAnswer?: mongoose.Types.ObjectId
  isResolved: boolean
  isPinned: boolean
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
  lastActivity: Date
  slug: string
}

const QuestionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 20
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    unique: true,
    required: false // Will be generated automatically
  }
}, {
  timestamps: true
})

// Indexes for better performance
QuestionSchema.index({ author: 1 })
QuestionSchema.index({ tags: 1 })
QuestionSchema.index({ createdAt: -1 })
QuestionSchema.index({ lastActivity: -1 })
QuestionSchema.index({ views: -1 })
// Note: slug index is created automatically by unique: true
QuestionSchema.index({ title: 'text', content: 'text' })

// Virtual for vote score
QuestionSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length
})

// Virtual for answer count
QuestionSchema.virtual('answerCount').get(function() {
  return this.answers.length
})

// Method to generate slug from title
QuestionSchema.methods.generateSlug = function() {
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
  
  this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`
  return this.slug
}

// Method to increment views
QuestionSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Method to update last activity
QuestionSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date()
  return this.save()
}

// Pre-validate middleware to generate slug before validation
QuestionSchema.pre('validate', function(next) {
  if (this.isNew && !this.slug) {
    this.generateSlug()
  }
  next()
})

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)