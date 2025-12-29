# BuilderMate - Copilot Instructions

## Project Overview

BuilderMate is a construction-focused estimating and project management application built with modern web technologies. It provides contractors and estimators with tools for creating project estimates, managing jobs, and tracking project details.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (utility-first approach)
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **AI Integration**: Google Gemini API for AI-assisted estimating
- **PDF Processing**: pdfjs-dist for document handling
- **Icons**: lucide-react

## Development Setup

### Prerequisites
- Node.js (with npm)
- Environment variables in `.env` file

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file with:
```
VITE_GEMINI_API_KEY=your_key_here
```

## Project Structure

```
src/
  components/       # Reusable UI components
    project/       # Project-specific components
    takeoff/       # Takeoff canvas components
    ui/            # Generic UI components (buttons, modals, etc.)
  hooks/           # Custom React hooks
  pages/           # Page-level components (used by router)
  router/          # Routing configuration
  store/           # Zustand state management
  lib/             # Utility functions and type definitions
  data/            # Seed data and constants
  legacy/          # Legacy code preserved for reference
  styles/          # Global styles
  App.tsx          # Root application component
  main.tsx         # Application entry point
```

## Coding Conventions

### TypeScript Usage
- **Always use TypeScript** for new files
- Define explicit types for component props
- Use type aliases from `lib/types.ts` for domain models
- Prefer `type` over `interface` for object shapes
- Use strict TypeScript settings (enabled in tsconfig.json)

### Component Patterns
- **Functional components only** - use function declarations
- **Props typing**: Define a `Props` type for each component
- **Export pattern**: Use named exports for components
- **Hooks**: Custom hooks should be in the `hooks/` directory and prefixed with `use`

Example component structure:
```typescript
import React from 'react';
import type { SomeType } from '../lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
};

export function ComponentName({ isOpen, onClose, isDarkMode }: Props) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management
- **Global state**: Use Zustand stores in `store/` directory
- **Local state**: Use React's `useState` for component-specific state
- **Derived state**: Use `useMemo` for computed values
- **Side effects**: Use `useEffect` with proper dependency arrays

#### Zustand Store Pattern
```typescript
import React from 'react';

export function useStoreName() {
  const [state, setState] = React.useState(initialValue);
  
  const action = React.useCallback((params) => {
    // Action logic
  }, [dependencies]);
  
  return { state, setState, action };
}
```

### Styling
- **Utility-first approach**: Use Tailwind CSS utility classes
- **Dark mode support**: Components should accept `isDarkMode` prop when relevant
- **Conditional classes**: Use template literals for dynamic classes
- **Common pattern**: 
  ```typescript
  className={`base-classes ${isDarkMode ? 'dark-classes' : 'light-classes'}`}
  ```
- **Colors**: Primary brand color is orange-600
- **Spacing**: Use Tailwind's spacing scale consistently

### File Organization
- **One component per file**
- **Group related components** in subdirectories (e.g., `components/project/`)
- **Shared utilities** go in `lib/`
- **Types** are defined in `lib/types.ts`
- **Storage keys** are centralized in `store/storageKeys.ts`

### Hooks Best Practices
- Custom hooks must start with `use` prefix
- Place hooks in the `hooks/` directory
- Export hooks as named exports
- Return object with descriptive property names
- Use callbacks for methods to maintain referential equality

Example hook pattern:
```typescript
export function useFeatureName(config: Config) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const action = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      // Logic
      setLoading(false);
      return result;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, [dependencies]);
  
  return { state, action, loading, error };
}
```

### Error Handling
- **Graceful degradation**: Handle errors without crashing the app
- **User feedback**: Set error states that can be displayed to users
- **Try-catch blocks**: Use for async operations and JSON parsing
- **Default values**: Provide sensible defaults when data is missing

### Storage and Persistence
- **LocalStorage**: Use for persisting user data and projects
- **Storage keys**: Import from `store/storageKeys.ts`
- **Cross-tab sync**: Listen to storage events for multi-tab synchronization
- **Error handling**: Wrap localStorage operations in try-catch

### Code Style
- **Indentation**: 2 spaces
- **Semicolons**: Not required (omit them)
- **Quotes**: Single quotes for strings
- **Comments**: Use JSDoc-style comments for complex logic
- **Variable naming**: 
  - camelCase for variables and functions
  - PascalCase for components and types
  - SCREAMING_SNAKE_CASE for constants

### Comments
- Add comments for:
  - Complex business logic
  - Non-obvious workarounds
  - Important architectural decisions
- Keep comments concise and up-to-date
- Avoid obvious comments that restate the code

### Testing
- No test infrastructure currently exists in the repository
- Manual testing is required for changes
- Test in development mode with `npm run dev`

## Common Patterns

### Modal Components
- Accept `isOpen`, `onClose`, `isDarkMode` props
- Use the `Modal` component from `components/ui/Modal`
- Reset internal state on close

### Form Inputs
- Controlled components with local state
- Validate on submit, not on every keystroke
- Provide clear placeholder text
- Style consistently with dark mode support

### API Calls
- Use hooks like `useGemini` for external API calls
- Handle loading, error, and success states
- Provide timeout configuration
- Clamp input lengths to prevent API errors

### Data Models
- Core types: `Project`, `EstimateItem`, `User`
- Status enums: `ProjectStatus`, `UserRole`, `EstimateItemType`
- Always import types from `lib/types.ts`

## Key Features

### Project Management
- Create, edit, and view construction projects
- Track project status (Active, Lead, Closed)
- Manage project budgets and completion percentages
- Store project metadata (client, next activity, etc.)

### Estimating
- Build itemized estimates with materials, labor, and other costs
- Calculate totals automatically
- Export estimates to CSV
- AI-assisted estimate generation via Gemini API

### User Management
- Basic authentication (login/signup)
- User profiles with roles (Admin, Estimator, Viewer)
- Profile customization

### UI Features
- Dark mode toggle
- Responsive design
- Modal dialogs for forms
- Voice/TTS integration (experimental)

## Important Notes

### Legacy Code
- Legacy implementation preserved in `src/legacy/App.legacy.tsx`
- Do not modify legacy code unless specifically required
- Current app uses modular architecture with routing

### Environment Considerations
- API keys must be in `.env` file (never commit to git)
- Vite uses `VITE_` prefix for exposed environment variables
- Development server runs on default Vite port

### Dependencies
- Prefer using existing dependencies over adding new ones
- Check `package.json` before adding new packages
- Keep dependencies up to date but test thoroughly

## Working with AI Features

### Gemini Integration
- Custom hook: `useGemini` in `hooks/useGemini.ts`
- Requires API key configuration
- Handles timeouts and error states
- Supports JSON and text responses
- Input is automatically clamped to prevent API errors

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/router/routes.ts`
3. Update router configuration in `src/router/AppRouter.tsx` or `AppRouter.integrated.tsx`

### Adding a New Component
1. Create file in appropriate `components/` subdirectory
2. Define Props type
3. Export as named export
4. Follow styling conventions with dark mode support

### Adding a New Hook
1. Create file in `hooks/` with `use` prefix
2. Return object with clear property names
3. Handle loading and error states for async operations
4. Use React.useCallback for methods

### Modifying State Management
1. Locate or create Zustand store in `store/`
2. Follow existing patterns for actions and selectors
3. Update types in `store/storeTypes.ts` if needed
4. Persist important data to localStorage

## Best Practices for Contributions

1. **Understand context first**: Review related files before making changes
2. **Follow existing patterns**: Match the style and structure of surrounding code
3. **Minimal changes**: Make the smallest change that solves the problem
4. **Type safety**: Leverage TypeScript to catch errors early
5. **Test manually**: Run the dev server and verify changes work as expected
6. **Consider dark mode**: Ensure UI changes work in both light and dark modes
7. **Document complex logic**: Add comments for non-obvious implementations
8. **Handle errors gracefully**: Don't let errors crash the application

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router Docs](https://reactrouter.com/)
