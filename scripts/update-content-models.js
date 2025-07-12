// Load environment variables
require('dotenv').config({ path: '.env.local' })

const mongoose = require('mongoose')

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreymehta2023:shrey92@stackit-cluster.gzwvmu1.mongodb.net/?retryWrites=true&w=majority&appName=StackIt-Cluster'

async function updateContentModels() {
  try {
    console.log('🔧 Updating Question and Answer Models...')
    console.log('Connecting to MongoDB...')
    console.log('Using URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Hide credentials in log
    
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB successfully!')

    // Update Questions collection
    console.log('\n📝 Updating Questions...')
    const questionsResult = await mongoose.connection.db.collection('questions').updateMany(
      {},
      {
        $set: {
          isHidden: { $ifNull: ['$isHidden', false] },
          isDeleted: { $ifNull: ['$isDeleted', false] },
          reportCount: { $ifNull: ['$reportCount', 0] }
        }
      }
    )
    console.log(`✅ Updated ${questionsResult.modifiedCount} questions`)

    // Update Answers collection
    console.log('\n💬 Updating Answers...')
    const answersResult = await mongoose.connection.db.collection('answers').updateMany(
      {},
      {
        $set: {
          isLocked: { $ifNull: ['$isLocked', false] },
          isHidden: { $ifNull: ['$isHidden', false] },
          isDeleted: { $ifNull: ['$isDeleted', false] },
          reportCount: { $ifNull: ['$reportCount', 0] }
        }
      }
    )
    console.log(`✅ Updated ${answersResult.modifiedCount} answers`)

    // Get collection counts
    const questionCount = await mongoose.connection.db.collection('questions').countDocuments()
    const answerCount = await mongoose.connection.db.collection('answers').countDocuments()

    console.log('\n📊 Collection Statistics:')
    console.log(`Questions: ${questionCount}`)
    console.log(`Answers: ${answerCount}`)

    console.log('\n✅ Content models updated successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. Restart your Next.js development server')
    console.log('2. Admin page should now show questions and answers')
    console.log('3. All moderation features should work properly')

  } catch (error) {
    console.error('❌ Error updating content models:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the update
console.log('🚀 StackIt Content Models Update Script')
console.log('=======================================')
updateContentModels()