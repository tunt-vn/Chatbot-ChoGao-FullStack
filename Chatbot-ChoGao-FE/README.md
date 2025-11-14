# Chatbot ChoGao - Frontend

**Intelligent Virtual Assistant for School Management** - Frontend React Application

This project provides a web interface for an AI-powered chatbot that assists with school operations, FAQs, scheduling, and administrative support for students, parents, teachers, and school staff.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5174/`

## 📚 Documentation

For detailed development setup, architecture, component overview, and future integrations, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## 🎯 Features

- **Chat Interface**: AI-powered chatbot for instant Q&A
- **FAQ Management**: Centralized frequently asked questions
- **Schedule & Events**: View school calendar and important dates
- **Responsive Design**: Mobile-friendly MUI-based UI
- **Admin Dashboard**: Placeholder for admin management (future)
- **Multi-page Layout**: Modern navigation with AppBar and Drawer

## 🛠 Tech Stack

- React 19.2 + TypeScript
- Material-UI (MUI) v5
- React Router v6
- Vite (rolldown-vite)
- Emotion CSS-in-JS

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Home, FAQ, Schedule, etc.)
├── App.tsx         # Root component with routing
├── theme.tsx       # MUI theme configuration
└── main.tsx        # React DOM entry
```

## 🔗 Integration Points (Roadmap)

- [ ] OpenAI API integration for intelligent chat
- [ ] Backend API for FAQ, schedule, and user data
- [ ] User authentication (JWT)
- [ ] Zalo channel integration
- [ ] Admin dashboard with content management
- [ ] User analytics and chat statistics

## 📝 Notes

This is the frontend scaffold. The backend integration and OpenAI setup are detailed in the development guide.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
