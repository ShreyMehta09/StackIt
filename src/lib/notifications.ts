import Notification from '@/models/Notification'
import mongoose from 'mongoose'

export interface CreateNotificationData {
  recipientId: string
  senderId: string
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accepted_answer' | 'system'
  title: string
  message: string
  relatedQuestionId?: string
  relatedAnswerId?: string
}

export async function createNotification(data: CreateNotificationData) {
  try {
    // Don't send notification to yourself
    if (data.recipientId === data.senderId) {
      return null
    }

    const notification = new Notification({
      recipient: new mongoose.Types.ObjectId(data.recipientId),
      sender: new mongoose.Types.ObjectId(data.senderId),
      type: data.type,
      title: data.title,
      message: data.message,
      relatedQuestion: data.relatedQuestionId ? new mongoose.Types.ObjectId(data.relatedQuestionId) : undefined,
      relatedAnswer: data.relatedAnswerId ? new mongoose.Types.ObjectId(data.relatedAnswerId) : undefined,
      isRead: false
    })

    await notification.save()
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function createAnswerNotification(
  questionAuthorId: string,
  answerAuthorId: string,
  questionId: string,
  answerId: string,
  questionTitle: string,
  answerAuthorUsername: string
) {
  return createNotification({
    recipientId: questionAuthorId,
    senderId: answerAuthorId,
    type: 'answer',
    title: 'New answer to your question',
    message: `${answerAuthorUsername} answered your question "${questionTitle}"`,
    relatedQuestionId: questionId,
    relatedAnswerId: answerId
  })
}

export async function createVoteNotification(
  contentAuthorId: string,
  voterId: string,
  voteType: 'up' | 'down',
  contentType: 'question' | 'answer',
  contentTitle: string,
  voterUsername: string,
  questionId?: string,
  answerId?: string
) {
  if (voteType === 'down') {
    // Don't send notifications for downvotes to avoid negativity
    return null
  }

  return createNotification({
    recipientId: contentAuthorId,
    senderId: voterId,
    type: 'vote',
    title: `Your ${contentType} received an upvote`,
    message: `${voterUsername} upvoted your ${contentType}${contentTitle ? ` "${contentTitle}"` : ''}`,
    relatedQuestionId: questionId,
    relatedAnswerId: answerId
  })
}

export async function createAcceptedAnswerNotification(
  answerAuthorId: string,
  questionAuthorId: string,
  questionId: string,
  answerId: string,
  questionTitle: string,
  questionAuthorUsername: string
) {
  return createNotification({
    recipientId: answerAuthorId,
    senderId: questionAuthorId,
    type: 'accepted_answer',
    title: 'Your answer was accepted!',
    message: `${questionAuthorUsername} accepted your answer to "${questionTitle}"`,
    relatedQuestionId: questionId,
    relatedAnswerId: answerId
  })
}

export async function createMentionNotification(
  mentionedUserId: string,
  mentionerUserId: string,
  contentType: 'question' | 'answer',
  contentTitle: string,
  mentionerUsername: string,
  questionId?: string,
  answerId?: string
) {
  return createNotification({
    recipientId: mentionedUserId,
    senderId: mentionerUserId,
    type: 'mention',
    title: `You were mentioned in a ${contentType}`,
    message: `${mentionerUsername} mentioned you in a ${contentType}${contentTitle ? ` "${contentTitle}"` : ''}`,
    relatedQuestionId: questionId,
    relatedAnswerId: answerId
  })
}

export async function createSystemNotification(
  recipientId: string,
  title: string,
  message: string
) {
  return createNotification({
    recipientId,
    senderId: recipientId, // System notifications use the same user as sender
    type: 'system',
    title,
    message
  })
}