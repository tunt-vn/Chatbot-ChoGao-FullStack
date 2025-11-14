# Chatbot ChoGao - Frontend Development Guide

## Overview

This is the frontend for the **Intelligent Virtual Assistant for School Management** project (Trợ lý ảo thông minh cho công tác điều hành nhà trường). The application provides a web-based interface for students, parents, teachers, and administrators to interact with an AI chatbot that answers FAQs, provides schedules, and manages administrative inquiries.

## Tech Stack

- **Framework**: React 19.2 + TypeScript
- **Build Tool**: Vite (rolldown-vite)
- **UI Library**: Material-UI (MUI) v5.14
- **Routing**: React Router v6
- **Styling**: Emotion (MUI's CSS-in-JS solution)

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx           # Main layout with AppBar, Drawer, and routing outlet
│   └── ChatWindow.tsx       # Chat interface component
├── pages/
│   ├── Home.tsx             # Landing page
│   ├── FAQ.tsx              # FAQ list page
│   ├── Schedule.tsx         # School schedule & events page
│   ├── Admin.tsx            # Admin dashboard (placeholder)
│   └── Chat.tsx             # Chat page (uses ChatWindow component)
├── App.tsx                  # Root component with BrowserRouter & ThemeProvider
├── theme.tsx                # MUI theme configuration
├── main.tsx                 # React DOM entry point
├── index.css                # Global styles
└── assets/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5174/` (or the next available port). Hot Module Replacement (HMR) is enabled for instant feedback on code changes.

### Build

Create a production build:

```bash
npm run build
```

The output will be in the `dist/` folder.

### Preview Production Build

```bash
npm preview
```

## Component Architecture

### Layout Component (`src/components/Layout.tsx`)

- Responsive design with AppBar, Drawer navigation, and main content area
- Mobile-friendly: toggleable drawer on small screens, permanent drawer on larger screens
- Navigation items linked to pages via React Router's `useNavigate` hook
- Uses MUI's responsive breakpoints (`xs`, `sm`, `md`, `lg`, `xl`)

### ChatWindow Component (`src/components/ChatWindow.tsx`)

- Displays chat history with user and assistant messages
- Simple message input with send button
- **TODO**: Integrate with backend API and OpenAI

### Pages

- **Home.tsx**: Overview and introduction
- **FAQ.tsx**: Static list of frequently asked questions
- **Schedule.tsx**: School events and important dates
- **Admin.tsx**: Placeholder for admin dashboard (requires auth)

## Styling

All styling is done through MUI's `sx` prop and theme configuration in `src/theme.tsx`. This ensures consistency and makes it easy to maintain a centralized design system.

## Theming

The app uses a custom MUI theme defined in `src/theme.tsx`. To customize colors and typography:

```tsx
// src/theme.tsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  // Add more customizations here
})
```

## Future Integrations

### 1. Backend API Integration

- **Endpoint**: Connect to backend for FAQ, schedule, and authentication
- **Location**: Create `src/services/api.ts` for API client
- **Example**:
  ```tsx
  const fetchFAQs = async () => {
    const response = await fetch('/api/faqs')
    return response.json()
  }
  ```

### 2. OpenAI Integration

- Integrate OpenAI API via backend (not directly from frontend for security)
- **Location**: Create `src/hooks/useChat.ts` for chat logic
- Send messages to backend endpoint that interfaces with OpenAI

### 3. Authentication

- Add login/logout pages
- Store JWT tokens securely (HttpOnly cookies recommended)
- **Location**: Create `src/pages/Login.tsx` and `src/services/auth.ts`
- Protect routes using a PrivateRoute wrapper

### 4. Multi-Channel Support

- **Zalo Integration**: Use Zalo's Web SDK for embedded chat
- **Messenger Integration**: Use Messenger SDK for bot integration
- **Location**: Create `src/integrations/` folder for channel-specific code

### 5. Admin Dashboard

- User management
- FAQ/content management
- Chat history and statistics
- **Location**: Expand `src/pages/Admin.tsx` with admin-specific components

## Best Practices

1. **Component Naming**: Use PascalCase for components (e.g., `ChatWindow.tsx`)
2. **File Organization**: Group related files in folders (pages, components, services)
3. **TypeScript**: Always type props and state for better DX
4. **Responsive Design**: Use MUI's `sx` prop with breakpoints
5. **Accessibility**: Use semantic HTML and ARIA attributes where needed
6. **Performance**: Lazy load pages with `React.lazy()` for larger apps

## Troubleshooting

### Port Already in Use

If port 5173/5174 is in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

### TypeScript Errors

Run `npm run build` to see all TypeScript errors in one place. Fix them before shipping.

### Module Not Found

Clear node_modules and reinstall:

```bash
rm -r node_modules package-lock.json
npm install
```

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_OPENAI_API_KEY=sk-...
```

Access in code with `import.meta.env.VITE_*`

## Resources

- [React 19 Documentation](https://react.dev)
- [MUI Documentation](https://mui.com)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Build and verify: `npm run build`
4. Commit and push to the branch
5. Open a pull request

## License

Specified by the school/organization (to be added).
