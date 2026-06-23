# Constitution Rules Specification

## Overview

Constitution rules are enforceable engineering guidelines that AI-generated code must comply with before approval. These rules ensure code quality, security, and consistency across projects.

## Rule Categories

### Language

Rules related to programming language usage and syntax.

**Examples:**
- TypeScript First: All code must be TypeScript. No .js files in source directories.
- Type Safety: No `any` types without explicit justification.
- Strict Mode: Enable strict TypeScript compiler options.

### Security

Rules related to security best practices.

**Examples:**
- No Secrets in Repository: API keys, tokens, and credentials must never be committed to source. Use environment variables.
- No Hardcoded Configuration: Configuration must be loaded from environment variables, never hardcoded.
- Input Validation: All user inputs must be validated before processing.
- SQL Injection Prevention: Use parameterized queries only.

### Structure

Rules related to code structure and organization.

**Examples:**
- Build Validation Required: Every change must pass `tsc --noEmit` and `npm run build` before approval.
- Consistent Project Structure: Follow established folder conventions: `src/`, `lib/`, `components/`, `services/`.
- File Naming: Use kebab-case for file names, PascalCase for components.
- Import Order: Organize imports: external, internal, relative.

### Git

Rules related to Git workflow and commit practices.

**Examples:**
- Repository Standards Enforcement: PRs must include updated documentation for any public API changes.
- Commit Message Format: Use conventional commits format.
- Branch Naming: Use feature/, bugfix/, hotfix/ prefixes.
- No Merge Commits: Use rebase or squash merge.

### Testing

Rules related to testing practices.

**Examples:**
- Test Coverage: New features must have at least 80% test coverage.
- Test Naming: Test files must end with `.test.ts` or `.spec.ts`.
- No Test Code in Production: Test utilities must not be imported in production code.
- Integration Tests: Critical paths must have integration tests.

### Architecture

Rules related to architectural decisions and patterns.

**Examples:**
- Dependency Direction: Dependencies must flow from higher-level to lower-level modules.
- Circular Dependencies: Circular dependencies are forbidden.
- Interface Segregation: Prefer small, focused interfaces over large ones.
- Single Responsibility: Each module should have one reason to change.

## Enforcement Levels

### Block

The change is automatically rejected. Cannot proceed without fixing.

**Use for:**
- Security vulnerabilities
- Breaking architectural principles
- Type errors that would prevent build
- Hardcoded secrets

### Warn

The change is flagged with a warning but can proceed with explicit approval.

**Use for:**
- Style violations
- Missing documentation
- Test coverage below threshold
- Non-critical code smells

### Info

The change is noted for informational purposes only.

**Use for:**
- Performance suggestions
- Best practice recommendations
- Deprecation notices
- Alternative approaches

## Rule Schema

```typescript
interface ConstitutionRule {
  id: number;
  category: 'language' | 'security' | 'structure' | 'git' | 'testing' | 'architecture';
  title: string;
  description: string;
  enforcement: 'block' | 'warn' | 'info';
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
```

## Default Rules

The system initializes with a set of default rules:

1. **TypeScript First** (language, block)
2. **No Secrets in Repository** (security, block)
3. **Build Validation Required** (structure, block)
4. **Consistent Project Structure** (structure, warn)
5. **No Hardcoded Configuration** (security, warn)
6. **Repository Standards Enforcement** (git, warn)

## Rule Evaluation

When AI generates code changes:

1. Parse the generated code
2. Apply all enabled rules
3. Collect violations
4. For each violation:
   - Block: Stop and require fix
   - Warn: Show warning, allow override
   - Info: Log for review
5. Return evaluation result

## Rule Management

### Adding Rules

Rules can be added via:
- Settings UI in Forge web app
- Direct database insertion
- API endpoint

### Modifying Rules

Rules can be modified:
- Change enforcement level
- Update description
- Enable/disable rule

### Removing Rules

Rules can be removed but:
- Default rules cannot be deleted
- Custom rules can be deleted
- Deletion is logged in audit trail

## Audit Trail

All rule changes are logged:
- Who made the change
- What was changed
- When it was changed
- Previous value

## Implementation Notes

- Rules are evaluated server-side
- Evaluation happens before code is applied
- Results are cached for performance
- Rule evaluation is deterministic
