# BuilderMate

BuilderMate is a construction-focused estimating and project management UI built with:

- React + TypeScript
- Vite
- Tailwind-style utility classes
- Modular hooks + components
- AI-assisted estimating (Gemini)

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```
VITE_GEMINI_API_KEY=your_key_here
```

## Project Structure

```
src/
  components/
  hooks/
  data/
  lib/
  legacy/
  styles/
  App.tsx
  main.tsx
```

Legacy code is preserved in `src/legacy/App.legacy.tsx`.
