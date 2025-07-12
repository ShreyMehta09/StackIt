// Load environment variables
require('dotenv').config({ path: '.env.local' })

const mongoose = require('mongoose')

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreymehta2023:shrey92@stackit-cluster.gzwvmu1.mongodb.net/?retryWrites=true&w=majority&appName=StackIt-Cluster'

async function testAdminAPIs() {
  try {
    console.log('🧪 Testing Admin API Data...')
    console.log('Connecting to MongoDB...')
    
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB successfully!')

    // Test data availability
    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray()
    const questions = await mongoose.connection.db.collection('questions').find({}).limit(5).toArray()
    const answers = await mongoose.connection.db.collection('answers').find({}).limit(5).toArray()

    console.log('\n📊 Data Available for Admin APIs:')
    console.log(`Users: ${users.length} found`)
    console.log(`Questions: ${questions.length} found`)
    console.log(`Answers: ${answers.length} found`)

    if (users.length > 0) {
      console.log('\n👥 Sample Users:')
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.role || 'user'}) - ${user.reputation || 0} rep`)
      })
    }

    if (questions.length > 0) {
      console.log('\n❓ Sample Questions:')
      questions.forEach(question => {
        console.log(`  - "${question.title}" by ${question.author}`)
      })
    }

    if (answers.length > 0) {
      console.log('\n💬 Sample Answers:')
      answers.forEach(answer => {
        console.log(`  - Answer to question ${answer.question}`)
      })
    }

    console.log('\n✅ Admin APIs should now have data to display!')
    console.log('\n📋 API Endpoints Created:')
    console.log('  - GET /api/admin/stats - Platform statistics')
    console.log('  - GET /api/admin/users - User management')
    console.log('  - GET /api/admin/content?type=question - Question moderation')
    console.log('  - GET /api/admin/content?type=answer - Answer moderation')
    console.log('  - POST /api/admin/bulk-action - Bulk moderation actions')

  } catch (error) {
    console.error('❌ Error testing admin APIs:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the test
console.log('🚀 StackIt Admin API Test Script')
console.log('=================================')
testAdminAPIs()