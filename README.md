
# StackIt - Q&A Forum

A minimal question-and-answer forum web app built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **User Roles**: Guest (view content), User (post questions/answers, vote), Admin (moderate content)
- **User Authentication**: Complete JWT-based login/register system with secure sessions
- **Ask Questions**: Post questions with title, rich-text description, and tags
- **Rich Text Editor**: Support for formatting, lists, emoji, hyperlinks, images, and text alignment
- **Answering**: Users can post answers with rich text formatting and view all answers
- **Voting System**: Upvote/downvote questions and answers with reputation tracking
- **Answer Acceptance**: Question authors can accept the best answer to mark questions as resolved
- **Reputation System**: Earn reputation through upvotes (+10), accepted answers (+15), lose through downvotes (-2)
- **Advanced Search**: Full-text search across questions, users, and tags with filtering and sorting
- **Tag System**: Organize questions with flexible tags (supports dots, underscores, special chars)
- **Tag Filtering**: Filter questions by specific tags with seamless navigation
- **Real-time Updates**: Optimistic UI updates for votes and answer submissions
- **Responsive Design**: Mobile-friendly interface with loading states and error handling
- **Global Search**: Header search bar available on all pages with instant results
- **Search Highlighting**: Visual emphasis on matching search terms in results
- **Pagination**: Efficient navigation through large result sets
- **URL State Management**: Shareable URLs with preserved search and filter states
- **Notifications**: Get notified for replies, comments, and @mentions (planned)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: JWT tokens with HTTP-only cookies
- **Database**: MongoDB Atlas with Mongoose ODM

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API endpoints
│   │   ├── auth/       # Authentication endpoints
│   │   ├── questions/  # Question CRUD and voting
│   │   └── answers/    # Answer operations and voting
│   ├── ask/            # Ask question page
│   ├── login/          # Login page
│   ├── questions/      # Questions listing and details
│   ├── register/       # Registration page
│   ├── tags/           # Tags page
│   ├── users/          # Users page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # Reusable components
│   ├── Header.tsx      # Navigation header
│   └── RichTextEditor.tsx # Rich text editor
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utility libraries
│   ├── auth.ts         # JWT utilities
│   └── mongodb.ts      # Database connection
├── models/             # Mongoose schemas
│   ├── User.ts         # User model
│   ├── Question.ts     # Question model
│   ├── Answer.ts       # Answer model
│   ├── Tag.ts          # Tag model
│   └── Notification.ts # Notification model
└── types/              # TypeScript definitions
```

## Development Roadmap

- [x] Basic project setup and navigation
- [x] Rich text editor implementation
- [x] Database setup with MongoDB Atlas
- [x] User authentication system
- [x] Question posting functionality with backend
- [x] Answer system with rich text support
- [x] Voting mechanism for questions and answers
- [x] Answer acceptance system
- [x] Reputation tracking and user statistics
- [x] Responsive UI with loading states
- [x] Search functionality with full-text search
- [x] Advanced search filters and sorting
- [x] Tag system with flexible validation
- [x] Global search integration
- [x] User profile pages with activity tracking
- [x] User directory with search and filtering
- [x] Notification system with real-time updates
- [X] Admin moderation tools

## Database Schema

The application uses MongoDB with the following models:

### User Model
- Authentication (username, email, password)
- Profile information (avatar, bio, reputation)
- User statistics (questions asked, answers given, votes received)
- Preferences and settings

### Question Model
- Content (title, description, tags)
- Metadata (author, creation date, views, votes)
- Relationships (answers, accepted answer)
- Status flags (resolved, pinned, locked)

### Answer Model
- Content and author information
- Vote tracking (upvotes, downvotes)
- Acceptance status
- Edit history

### Tag Model
- Tag information (name, description, color)
- Usage statistics (question count)
- Moderation flags

### Notification Model
- User notifications for various events
- Types: answers, comments, mentions, votes, system messages

## Rich Text Editor Features

The editor supports:
- **Text Formatting**: Bold, italic, strikethrough
- **Lists**: Bullet and numbered lists
- **Links**: Insert hyperlinks with custom text
- **Images**: Upload and embed images
- **Emojis**: Quick emoji picker with common emojis
- **Alignment**: Left, center, right text alignment
- **History**: Undo/redo functionality
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.)

Visit `/editor-demo` to test all editor features.

## Environment Setup

1. Copy `.env.local` and update the MongoDB connection string:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@stackit-cluster.gzwvmu1.mongodb.net/stackit?retryWrites=true&w=majority&appName=StackIt-Cluster
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get questions with pagination and filtering
- `POST /api/questions` - Create new question (authenticated)
- `GET /api/questions/[id]` - Get single question by ID
- `POST /api/questions/[id]/vote` - Vote on question (authenticated)

### Answers
- `GET /api/questions/[id]/answers` - Get answers for a question
- `POST /api/questions/[id]/answers` - Create new answer (authenticated)
- `POST /api/answers/[id]/vote` - Vote on answer (authenticated)
- `POST /api/answers/[id]/accept` - Accept answer (question author only)
- `DELETE /api/answers/[id]/accept` - Unaccept answer (question author only)

### Search
- `GET /api/search` - Search across questions, users, and tags with filtering and sorting

### Users
- `GET /api/users` - Get all users with pagination and sorting
- `GET /api/users/[username]` - Get user profile with activity data

### Notifications
- `GET /api/notifications` - Get user's notifications with pagination and filtering
- `POST /api/notifications` - Mark all notifications as read (authenticated)
- `PATCH /api/notifications/[id]` - Mark specific notification as read (authenticated)
- `DELETE /api/notifications/[id]` - Delete specific notification (authenticated)
