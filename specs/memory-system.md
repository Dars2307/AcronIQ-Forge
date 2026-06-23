# Memory System Specification

## Overview

The Engineering Memory system stores project-specific patterns, conventions, and preferences that Forge learns from codebases. This memory is used to generate code that matches the team's established patterns.

## Memory Categories

### Architecture

High-level architectural decisions and patterns.

**Examples:**
- Preferred state management approach (Redux, Zustand, Context)
- API layer structure (services, hooks, utilities)
- Component organization (atoms, molecules, organisms)
- Data flow patterns (unidirectional, event-driven)

### Fix

Common fixes and solutions to recurring problems.

**Examples:**
- Typical error handling patterns
- Common bug fixes
- Performance optimization patterns
- Compatibility workarounds

### Convention

Coding conventions and style preferences.

**Examples:**
- Naming conventions (camelCase, PascalCase, kebab-case)
- File naming patterns
- Comment style and documentation standards
- Code formatting preferences

### Preference

Team preferences and opinions.

**Examples:**
- Preferred libraries for specific tasks
- Tool preferences (linting, formatting, testing)
- Development workflow preferences
- IDE or editor configurations

### Workflow

Development workflow and process patterns.

**Examples:**
- Branch naming conventions
- Commit message formats
- PR review processes
- Deployment procedures

## Memory Entry Schema

```typescript
interface MemoryEntry {
  id: number;
  project_id: number;
  category: 'architecture' | 'fix' | 'convention' | 'preference' | 'workflow';
  key: string;
  value: string;
  source: 'manual' | 'automatic';
  created_at: Date;
  updated_at: Date;
}
```

## Entry Sources

### Manual

Entries added by users via the Forge web UI.

**Process:**
1. User navigates to Settings → Engineering Memory
2. Clicks "Add Entry"
3. Selects category
4. Enters key and value
5. Entry is saved to database

### Automatic

Entries extracted from codebase by Forge agents.

**Process:**
1. Agent analyzes codebase
2. Identifies patterns
3. Extracts relevant information
4. Creates memory entry with source: 'automatic'
5. Entry is saved to database

## Memory Extraction

### Pattern Recognition

Agents use pattern recognition to extract memory:

- **Repeated patterns**: Code that appears frequently
- **Explicit conventions**: Config files, linter rules, formatter configs
- **Comments and documentation**: TODOs, FIXMEs, inline documentation
- **File structure**: Folder organization, file naming patterns

### Confidence Scoring

Automatic entries include confidence scores:

- **High**: Explicitly defined (config files, documentation)
- **Medium**: Strong pattern match (repeated occurrences)
- **Low**: Weak pattern match (few occurrences, ambiguous)

### Validation

Automatic entries are validated:
- Check for conflicts with existing entries
- Verify category appropriateness
- Ensure value is meaningful
- Flag for review if confidence is low

## Memory Usage

### Code Generation

When generating code:

1. Retrieve relevant memory entries for the project
2. Filter by category and key
3. Apply patterns to generated code
4. Ensure consistency with stored conventions

### Conflict Resolution

When conflicts occur:

1. Prefer manual entries over automatic
2. Prefer higher confidence scores
3. Prefer more recent entries
4. Flag for user review if uncertain

## Memory Management

### Adding Entries

**Manual:**
- Via Settings UI
- Requires category, key, value
- Source set to 'manual'

**Automatic:**
- By agents during code analysis
- Requires pattern match
- Source set to 'automatic'

### Updating Entries

- Manual entries can be updated by users
- Automatic entries can be promoted to manual
- Updates are logged in audit trail
- Previous values are preserved

### Deleting Entries

- Manual entries can be deleted
- Automatic entries can be deleted or hidden
- Deletion is logged in audit trail
- Soft delete recommended for audit purposes

### Merging Entries

When similar entries exist:

1. Detect duplicates or near-duplicates
2. Merge values if compatible
3. Keep most recent timestamp
4. Log merge operation

## Memory Queries

### By Project

Retrieve all memory entries for a project:

```sql
SELECT * FROM memory_entries WHERE project_id = ? ORDER BY category, key;
```

### By Category

Retrieve entries for a specific category:

```sql
SELECT * FROM memory_entries WHERE project_id = ? AND category = ?;
```

### By Key

Retrieve entries matching a key pattern:

```sql
SELECT * FROM memory_entries WHERE project_id = ? AND key ILIKE ?;
```

## Memory Export/Import

### Export Format

JSON format for portability:

```json
{
  "project_id": 1,
  "entries": [
    {
      "category": "convention",
      "key": "naming",
      "value": "Use camelCase for variables, PascalCase for components",
      "source": "manual"
    }
  ]
}
```

### Import Process

1. Validate JSON structure
2. Check for conflicts
3. Merge with existing entries
4. Log import operation
5. Report conflicts and resolutions

## Memory Analytics

### Usage Tracking

Track how often entries are used:
- Reference count in generated code
- Last used timestamp
- User feedback (helpful/not helpful)

### Quality Metrics

Assess memory quality:
- Entry age (stale entries)
- Conflict rate
- User satisfaction
- Pattern strength

### Recommendations

Suggest improvements:
- Add missing conventions
- Update stale entries
- Resolve conflicts
- Remove unused entries

## Security Considerations

- Memory entries are project-scoped
- No cross-project memory sharing
- Audit trail for all changes
- Sensitive patterns are filtered
- User can review all automatic entries

## Performance Considerations

- Indexed by project_id and category
- Cached in memory for frequent access
- Lazy loading for large memory sets
- Query optimization for common patterns
