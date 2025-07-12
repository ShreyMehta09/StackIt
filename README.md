# StackIt - Q&A Forum

A minimal question-and-answer forum web app built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **User Roles**: Guest (view content), User (post questions/answers, vote), Admin (moderate content)
- **Ask Questions**: Post questions with title, rich-text description, and tags
- **Rich Text Editor**: Support for formatting, lists, emoji, hyperlinks, images, and text alignment
- **Answering**: Users can post answers with rich text formatting
- **Voting System**: Upvote/downvote answers and mark accepted answers
- **Tagging**: Organize questions with relevant tags for filtering and search
- **Notifications**: Get notified for replies, comments, and @mentions

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
- **Authentication**: (To be implemented)
- **Database**: (To be implemented)

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── ask/            # Ask question page
│   ├── login/          # Login page
│   ├── questions/      # Questions listing
│   ├── register/       # Registration page
│   ├── tags/           # Tags page
│   ├── users/          # Users page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
└── components/         # Reusable components
    └── Header.tsx      # Navigation header
```

## Development Roadmap

- [x] Basic project setup and navigation
- [x] Rich text editor implementation
- [x] Database setup with MongoDB Atlas
- [x] User authentication system
- [ ] Question posting functionality with backend
- [ ] Answer system
- [ ] Voting mechanism
- [ ] Notification system
- [ ] Search functionality
- [ ] Admin moderation tools

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

More endpoints will be added as features are implemented.