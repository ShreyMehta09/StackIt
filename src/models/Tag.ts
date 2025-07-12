import mongoose, { Document, Schema } from 'mongoose'

export interface ITag extends Document {
  name: string
  description: string
  color: string
  questionCount: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  isOfficial: boolean
}

const TagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
    match: /^[a-z0-9\-\.\_\+\#]+$/
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6',
    match: /^#[0-9a-fA-F]{6}$/
  },
  questionCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isOfficial: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for better performance
// Note: name index is created automatically by unique: true
TagSchema.index({ questionCount: -1 })
TagSchema.index({ createdAt: -1 })

// Method to increment question count
TagSchema.methods.incrementQuestionCount = function() {
  this.questionCount += 1
  return this.save()
}

// Method to decrement question count
TagSchema.methods.decrementQuestionCount = function() {
  if (this.questionCount > 0) {
    this.questionCount -= 1
  }
  return this.save()
}

export default mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema)