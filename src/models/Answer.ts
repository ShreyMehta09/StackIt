import mongoose, { Document, Schema } from 'mongoose'

export interface IAnswer extends Document {
  content: string
  author: mongoose.Types.ObjectId
  question: mongoose.Types.ObjectId
  upvotes: mongoose.Types.ObjectId[]
  downvotes: mongoose.Types.ObjectId[]
  isAccepted: boolean
  createdAt: Date
  updatedAt: Date
  editHistory: {
    editedAt: Date
    editedBy: mongoose.Types.ObjectId
    previousContent: string
  }[]
}

const AnswerSchema = new Schema<IAnswer>({
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    previousContent: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

// Indexes for better performance
AnswerSchema.index({ author: 1 })
AnswerSchema.index({ question: 1 })
AnswerSchema.index({ createdAt: -1 })
AnswerSchema.index({ isAccepted: -1 })

// Virtual for vote score
AnswerSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length
})

// Method to mark as accepted
AnswerSchema.methods.markAsAccepted = async function() {
  // Unmark any other accepted answers for this question
  await mongoose.model('Answer').updateMany(
    { question: this.question, _id: { $ne: this._id } },
    { isAccepted: false }
  )
  
  this.isAccepted = true
  return this.save()
}

// Method to add edit history
AnswerSchema.methods.addEditHistory = function(editedBy: mongoose.Types.ObjectId, previousContent: string) {
  this.editHistory.push({
    editedAt: new Date(),
    editedBy,
    previousContent
  })
  return this.save()
}

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema)