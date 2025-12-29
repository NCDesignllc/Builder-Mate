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

## GitHub Copilot Agents

This repository includes custom GitHub Copilot agents to enhance development workflow:

### Testing Specialist (`@testing-specialist`)

A specialized agent focused on test coverage, test quality, and testing best practices. This agent can help you:

- Write comprehensive unit, integration, and component tests
- Improve existing test coverage and quality
- Review tests for best practices and maintainability
- Configure testing frameworks (Vitest, React Testing Library)
- Create mock data and mock implementations

**Usage**: Mention `@testing-specialist` in GitHub issues, pull requests, or Copilot chat to get testing-specific assistance.

**Limitations**: The testing specialist is restricted to test-related files only and cannot modify production code, ensuring safe collaboration on test improvements.

For more details, see [.github/agents/testing-specialist.md](.github/agents/testing-specialist.md).
