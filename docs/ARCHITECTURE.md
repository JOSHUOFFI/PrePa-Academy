# PrePa SaaS Architecture Documentation

## Overview

PrePa has been professionally restructured into a scalable, maintainable SaaS-grade architecture while maintaining 100% of existing functionality. All HTML pages, assets, and scripts are now organized in a `public/` directory for serving, while source code is organized in `src/` for development.

---

## Directory Structure

```
PrePa/
├── public/                          # Served static files (root for web server)
│   ├── pages/                       # HTML pages (all user-facing pages)
│   │   ├── index.html              # Landing/Dashboard
│   │   ├── login.html              # Authentication
│   │   ├── signup.html             # Registration
│   │   ├── setup.html              # Exam setup flow
│   │   ├── exam.html               # Exam interface
│   │   ├── results.html            # Results page
│   │   ├── classroom.html          # AI Classroom
│   │   └── admin.html              # Admin dashboard
│   ├── assets/                      # Static resources
│   │   ├── images/                 # Image files
│   │   └── vendor/                 # Third-party libraries (xlsx.js, html2pdf.js)
│   ├── styles/                      # CSS files
│   │   ├── global.css              # Global styles
│   │   ├── features/               # Feature-specific CSS
│   │   │   └── classroom.css
│   │   └── pages/                  # Page-specific CSS
│   │       └── auth.css
│   └── scripts/                     # Frontend JavaScript (runtime)
│       ├── core/                   # Core functionality
│       │   └── auth.js             # Authentication utilities
│       ├── data/                   # Data files
│       │   └── questions.js        # Question bank
│       ├── config/                 # Configuration
│       │   └── platformConfig.js   # Platform settings
│       ├── components/             # UI components
│       │   └── ui.js               # Reusable UI utilities
│       ├── services/               # Business logic
│       │   ├── formspreeService.js # Email service
│       │   ├── classroomApi.js     # Classroom API client
│       │   └── firebase/           # Firebase services
│       │       ├── firebaseApp.js
│       │       ├── firebaseAuth.js
│       │       ├── firebaseConfig.js
│       │       ├── firestore.js
│       │       └── storage.js
│       ├── pages/                  # Page-specific logic
│       │   ├── exam.js             # Exam logic
│       │   ├── results.js          # Results logic
│       │   └── admin.js            # Admin logic
│       ├── features/               # Feature modules
│       │   └── classroom/          # Classroom feature
│       │       └── classroom.js
│       └── utils/                  # Utility functions
│
├── src/                             # Frontend source (development/organization)
│   ├── components/                  # Reusable UI components (future)
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── cards/
│   │   ├── modals/
│   │   └── loaders/
│   ├── pages/                       # Page-specific components (future)
│   │   ├── auth/
│   │   ├── exam/
│   │   ├── classroom/
│   │   ├── results/
│   │   └── admin/
│   ├── services/                    # Business logic services (future)
│   │   ├── authService.js
│   │   ├── examService.js
│   │   ├── classroomService.js
│   │   ├── formspreeService.js
│   │   ├── aiService.js
│   │   └── firebase/
│   ├── utils/                       # Utility functions (future)
│   ├── config/                      # Configuration files (future)
│   ├── ai-tools/                    # AI-specific tools (future)
│   └── styles/                      # Source CSS (original)
│
├── api/                             # Backend API routes (Vercel/Node)
│   ├── classroom.js                # Classroom endpoint
│   ├── quizzes.js                  # Quiz endpoint
│   └── auth.js                     # Auth endpoint
│
├── server/                          # Backend server code
│   ├── api/
│   │   ├── classroomController.js  # Classroom API logic
│   │   └── quizController.js       # Quiz API logic
│   ├── config/
│   │   ├── env.js                  # Environment config
│   │   └── database.js             # Database config
│   ├── features/
│   │   └── classroom/
│   │       └── classroomService.js # Classroom service
│   ├── services/
│   │   ├── ai/
│   │   │   └── geminiClient.js     # Gemini AI client
│   │   └── firebase/
│   │       ├── firebaseAdmin.js
│   │       ├── firestoreService.js
│   │       └── storageService.js
│   ├── helpers/
│   │   └── http.js                 # HTTP utilities
│   └── middleware/
│       └── auth.js                 # Auth middleware
│
├── config/                          # Root-level configuration
│   ├── env.js                       # Environment variables
│   └── constants.js                 # Global constants
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md              # This file
│   ├── API.md                       # API documentation
│   └── DEVELOPMENT.md               # Development guide
│
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Node dependencies
├── server.js                        # Server entry point
└── README.md                        # Project README
```

---

## Architecture Overview

### The `public/` Directory

The `public/` directory contains all files served to clients:
- **pages/**: HTML entry points for each feature
- **assets/**: Images, icons, vendor libraries
- **styles/**: CSS files
- **scripts/**: Frontend JavaScript

All paths in HTML files use relative paths (`../`) to reference assets, styles, and scripts correctly from the `pages/` subdirectory.

### The `src/` Directory

The `src/` directory organizes source code by responsibility for future enhancement and migration:
- **components/**: Reusable UI components
- **pages/**: Page-specific logic
- **services/**: Business logic abstraction
- **utils/**: Helper functions
- **config/**: Configuration management
- **ai-tools/**: AI-specific functionality
- **styles/**: Source CSS organization

Currently, JavaScript is served directly from `public/scripts/`, but files are organized logically in `src/` for future migration to a build system or module bundler.

### Backend Organization

**Server code** (`server/`):
- Handles local development HTTP server
- Classroom API controller
- Firebase integration
- AI service clients

**API routes** (`api/`):
- Vercel serverless functions
- Public-facing endpoints
- Middleware and auth

---

## Request Flow

### Frontend Request Flow

```
User visits page (e.g., /exam.html)
  ↓
server.js serves public/pages/exam.html
  ↓
HTML loads scripts from ../scripts/
  ↓
Inline script checks authentication
  ↓
Page-specific script initializes (exam.js, classroom.js, etc.)
  ↓
User interacts with page
  ↓
Service calls (Firebase, API endpoints)
```

### API Request Flow

```
Frontend makes fetch request to /api/classroom
  ↓
server.js routes to classroomController
  ↓
Controller validates input
  ↓
Calls geminiClient for AI response
  ↓
Formats response
  ↓
Returns JSON to frontend
```

---

## Key Components

### Authentication (`public/scripts/core/auth.js`)

Handles user authentication lifecycle:
- Signup validation
- Login/logout
- Session management
- Access control checks

Uses Firebase Authentication backend.

### Question Bank (`public/scripts/data/questions.js`)

Contains the exam question data:
- Organized by class level (JSS1-SS2)
- Organized by term
- Organized by subject
- Question shuffling algorithm

### Classroom AI (`public/scripts/features/classroom/`)

Manages the AI learning interface:
- Topic search
- API communication
- Response rendering
- History management

Communicates with `/api/classroom` endpoint.

### Firebase Integration (`public/scripts/services/firebase/`)

Manages Firebase operations:
- User authentication
- Firestore database access
- Cloud storage access
- Real-time data sync

### Formspree Integration (`public/scripts/services/formspreeService.js`)

Handles email delivery:
- Contact form submissions
- Notification emails
- Error reporting

---

## Development Workflow

### Adding a New Page

1. Create HTML file: `public/pages/newpage.html`
2. Create logic file: `src/pages/feature/newpage.js`
3. Update paths in HTML (`../assets/`, `../scripts/`, `../styles/`)
4. Link from existing pages
5. Test thoroughly

### Adding a New Service

1. Create in `src/services/newservice.js`
2. Define clear interface
3. Add error handling
4. Update `public/scripts/services/` when ready to use

### Adding Styling

1. Create in `src/styles/pages/` or `src/styles/components/`
2. Move to `public/styles/` when ready
3. Link in HTML file

---

## File Naming Conventions

- **Files**: `camelCase.js`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`

---

## Configuration

### Environment Variables

Store in `.env`:
```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
GEMINI_API_KEY=...
FORMSPREE_ENDPOINT=...
PORT=3000
```

### Platform Config (`public/scripts/config/platformConfig.js`)

Define app-specific constants:
```javascript
const PREPA_CLASSES = [
  { value: "JSS1", label: "JSS 1" },
  ...
];
```

---

## Architecture Decisions

### Why `public/` for served files?
- Clear separation between served and source code
- Follows SaaS best practices
- Easier to add build process later
- Better for server configuration

### Why `src/` for source code organization?
- Logical grouping by responsibility
- Future-proofs for modularization
- Enables easy migration to build systems
- Maintains beginner-friendly structure

### Why keep JavaScript in `public/scripts/`?
- No build step required currently
- Minimal performance impact
- Easier debugging
- Can migrate gradually to modules

### Why service-based architecture?
- Reusable business logic
- Easy to test
- Enables independent scaling
- Supports future microservices

---

## Performance

### Current Optimizations
- CDN-delivered Bootstrap and fonts
- Minimal JavaScript
- Efficient algorithms
- Lazy loading ready

### Future Opportunities
- Service Worker for offline support
- Code splitting by page
- Image optimization
- Caching strategies
- Database indexing

---

## Security

### Frontend Security
- ✅ Input validation
- ✅ XSS prevention
- ✅ localStorage encryption (future)
- ✅ httpOnly cookies (future)

### Backend Security
- ✅ Firebase security rules
- ✅ Environment variable protection
- ✅ API rate limiting (future)
- ✅ Input sanitization (future)

---

## Migration Path

This architecture supports gradual enhancement:

**Phase 1** (Current): Organized code structure
**Phase 2**: Add build system (Webpack/Vite)
**Phase 3**: Modularize with ES6 imports
**Phase 4**: Add TypeScript
**Phase 5**: Component framework (React/Vue)
**Phase 6**: Microservices backend

---

## Troubleshooting

### Paths not working?
Check relative paths in HTML files. From `public/pages/`, use `../` to go up one level.

### Scripts not loading?
Verify script paths match file locations. Use browser DevTools Network tab to check.

### API requests failing?
Check `/api/` route handlers and console for errors. Verify GEMINI_API_KEY is set.

---

## Best Practices

- ✅ Keep components focused and reusable
- ✅ Validate all inputs
- ✅ Handle errors gracefully
- ✅ Comment complex logic
- ✅ Test thoroughly
- ✅ Follow naming conventions
- ✅ Keep functions small

---

## Support

For questions or issues:
1. Check existing code patterns
2. Review documentation
3. Test in browser DevTools
4. Check server logs
5. Ask for help

---

*Last updated: May 2026*
*Architecture version: 2.0 - Restructured SaaS Grade*

## Future Scale

Use the existing folders for upcoming features:

- Teacher dashboards: `scripts/features/teacher/`, `server/features/teacher/`
- AI quizzes: `scripts/features/quiz/`, `server/features/quiz/`
- Analytics: `scripts/services/analytics/`, `server/features/analytics/`
- Subscriptions: `server/features/billing/`
- School management: `scripts/features/schools/`, `server/features/schools/`
