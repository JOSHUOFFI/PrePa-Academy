# PrePa - Professional AI-Powered EdTech Platform

PrePa is a modern, professionally-architected AI-powered EdTech platform for Computer-Based Testing (CBT), student results management, admin uploads, and Gemini-powered classroom lessons.

## 🎯 Overview

PrePa helps secondary school students practice exams with:
- Class, term, and subject-based CBT practice
- Timed exam sessions with instant results
- AI-powered Classroom for learning topics
- Admin dashboard for question management
- Export capabilities (PDF, Excel)

**Latest Update**: PrePa has been restructured into a professional SaaS-grade architecture while maintaining 100% functionality. See [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md) for details.

## ✨ Features

### Student Features
- 📚 **Signup/Login** - Secure account management with Formspree tracking
- 📝 **Class-Based CBT** - Practice exams for JSS 1 - SS 2
- ⏱️ **Timed Sessions** - Real exam experience with countdown timer
- 📊 **Instant Results** - Score, grade, and detailed performance breakdown
- 💾 **Export Results** - Download as PDF or Excel for records
- 🤖 **Classroom AI** - Learn any topic with AI tutor powered by Gemini

### Admin Features
- 📤 **Question Uploads** - Import from Word documents (.docx)
- 📋 **Result Management** - View, filter, and manage exam records
- 📈 **Analytics** - Track student performance and trends
- 🔐 **Admin Dashboard** - Secure interface for platform management

## 📁 Project Structure

### New SaaS Architecture (v2.0)

```
PrePa/
├── public/                    # Served static files
│   ├── pages/                # HTML pages (users navigate here)
│   ├── scripts/              # Frontend JavaScript
│   ├── styles/               # CSS files
│   └── assets/               # Images and vendor libraries
│
├── src/                       # Source code organization
│   ├── components/            # Reusable UI components (future)
│   ├── pages/                 # Page-specific logic (future)
│   ├── services/              # Business logic services (future)
│   ├── ai-tools/              # AI integration tools (future)
│   ├── config/                # Configuration management
│   └── utils/                 # Utility functions
│
├── server/                    # Backend logic
│   ├── api/                   # API controllers
│   ├── services/              # Business services (AI, Firebase)
│   └── config/                # Environment and database config
│
├── api/                       # Vercel API routes
│   └── classroom.js           # Classroom AI endpoint
│
└── docs/                      # Documentation
    ├── ARCHITECTURE.md        # Complete architecture guide
    └── API.md                 # API documentation
```

For detailed explanation, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🚀 Quick Start

### Local Development

1. **Clone and install**:
```bash
git clone https://github.com/yourusername/prepa.git
cd prepa
npm install
```

2. **Setup environment**:
```bash
cp .env.example .env
# Edit .env and add your credentials
```

3. **Start server**:
```bash
npm start
# Server runs on http://localhost:3000
```

4. **Access the app**:
- Landing page: `http://localhost:3000/pages/index.html`
- Login: `http://localhost:3000/pages/login.html`
- Classroom: `http://localhost:3000/pages/classroom.html`
- Admin: `http://localhost:3000/pages/admin.html`

### Environment Variables

Create `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Formspree (Email)
FORMSPREE_ENDPOINT=your_formspree_endpoint

# Server
PORT=3000
NODE_ENV=development
```

## 🤖 Classroom AI Setup

The Classroom AI uses Google's Gemini API to provide intelligent explanations:

1. **Get API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Click "Get API Key"
   - Create new API key or use existing

2. **Add to `.env`**:
```bash
GEMINI_API_KEY=your_key_here
```

3. **Access**:
```
http://localhost:3000/pages/classroom.html
```

4. **How it works**:
   - Student enters a topic (e.g., "Photosynthesis")
   - Request sent to `/api/classroom`
   - Gemini API generates explanation
   - Response displayed in classroom interface
   - Student can ask follow-up questions

**Security Note**: API keys are stored in `.env` and processed server-side only. Never expose keys in frontend code.

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub
   - Select your PrePa repository

3. **Set Environment Variables**:
   - Add all `.env` variables in Vercel dashboard
   - Redeploy

4. **Access Live**:
```
https://your-prepa-app.vercel.app
```

### Local Docker (Optional)

```bash
# Build image
docker build -t prepa .

# Run container
docker run -p 3000:3000 --env-file .env prepa
```

## 📊 Data Structure

### Questions Format

Questions are stored in `public/scripts/data/questions.js`:

```javascript
{
  "SS1": {           // Class level
    "First Term": {  // Term
      "Mathematics": [  // Subject
        {
          question: "What is 2+2?",
          options: ["3", "4", "5", "6"],
          correctIndex: 1,
          explanation: "2+2 equals 4"
        }
      ]
    }
  }
}
```

### Results Storage

Results are stored in Firebase Firestore:

```javascript
{
  studentName: "John Doe",
  email: "john@example.com",
  subject: "Mathematics",
  classLevel: "SS1",
  term: "First Term",
  score: 15,
  totalQuestions: 20,
  percentage: 75,
  grade: "B",
  timestamp: "2024-05-12T10:30:00Z",
  answers: [...]
}
```

## 🧪 Testing Checklist

Before deploying, verify:

### Authentication
- [ ] Sign up new account
- [ ] Login with credentials
- [ ] Logout successfully
- [ ] Access control working

### Exams
- [ ] Navigate exam setup
- [ ] Select class/term/subject
- [ ] Complete exam
- [ ] Submit answers
- [ ] View results

### Classroom
- [ ] Search topic
- [ ] Receive AI explanation
- [ ] Ask follow-up questions
- [ ] View history

### Admin
- [ ] Login to admin panel
- [ ] Upload questions
- [ ] View results
- [ ] Export data

## 🛠️ Development

### Tech Stack

**Frontend**:
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 for UI
- Firebase Auth for authentication
- LocalStorage for session management

**Backend**:
- Node.js with Express
- Firebase (Firestore, Authentication)
- Google Gemini API
- Formspree for emails

**Deployment**:
- Vercel for hosting
- GitHub for version control
- Firebase for backend services

### Adding Features

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed guide on:
- Adding new pages
- Creating services
- Extending API endpoints
- Database operations

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test
```

## 📚 Documentation

- **[RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md)** - Overview of new architecture
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Complete architecture guide
- **[docs/API.md](./docs/API.md)** - API endpoint documentation
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guide (coming soon)

## 🐛 Troubleshooting

### Pages not loading
- Check if server is running: `npm start`
- Verify port 3000 is available
- Check browser console for errors

### API errors
- Verify GEMINI_API_KEY is set in `.env`
- Check server logs for detailed errors
- Ensure Firebase credentials are valid

### Images not displaying
- Confirm `public/assets/` folder exists
- Check browser Network tab for 404 errors
- Verify file paths in HTML

### Style issues
- Clear browser cache
- Verify CSS paths: `../styles/`
- Check Bootstrap CDN is loading

For more help, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) troubleshooting section.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

UNLICENSED - Built for PrePa Platform

## 👨‍💻 Author

**David Joshua**
- PrePa Platform Lead Developer
- AI-Powered EdTech Specialist

## 🎓 Educational Focus

PrePa serves secondary school students in Nigeria and beyond:
- **JSS 1 - SS 2** students
- **Core subjects**: Mathematics, English, Science
- **Subject diversity**: 13+ subjects covered
- **Exam preparation**: Class-based, term-based, and practice exams
- **AI Learning**: Topic explanations and follow-up support

## 🌟 Key Achievements

✅ **100% Functionality Preserved** - All existing features work perfectly  
✅ **Professional Architecture** - SaaS-grade organization  
✅ **Scalable Design** - Ready for growth and new features  
✅ **Well Documented** - Complete guides for developers  
✅ **Production Ready** - Deployed and tested  

## 📞 Support

For issues, questions, or suggestions:
1. Check documentation in `docs/`
2. Review [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md)
3. Create an issue on GitHub
4. Contact the development team

---

**PrePa v2.0** - Professional SaaS-Grade AI-Powered EdTech Platform  
*Last Updated: May 2026*
