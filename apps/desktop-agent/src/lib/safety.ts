// Safety checks for local AI model outputs
// Prevents harmful operations from being executed

export interface SafetyCheckResult {
  safe: boolean;
  violations: string[];
  severity: 'block' | 'warn' | 'info';
}

export interface CodeChange {
  filePath: string;
  content: string;
  operation: 'create' | 'modify' | 'delete';
}

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
  // File system operations outside project
  /\.\.\/\.\./g,
  // Shell command injection
  /eval\s*\(/g,
  /exec\s*\(/g,
  /system\s*\(/g,
  // Dangerous file operations
  /rm\s+-rf/g,
  /del\s+\/s/g,
  // Secret exposure patterns
  /password\s*=\s*["'][^"']+["']/gi,
  /api_key\s*=\s*["'][^"']+["']/gi,
  /secret\s*=\s*["'][^"']+["']/gi,
  // Network requests to unknown hosts
  /fetch\s*\(\s*["']http:\/\/(?!localhost|127\.0\.0\.1)/gi,
];

// File paths that should never be modified
const PROTECTED_PATHS = [
  '/etc/',
  '/usr/',
  '/bin/',
  '/sbin/',
  '/system/',
  'C:\\Windows\\',
  'C:\\Program Files\\',
  'C:\\ProgramData\\',
];

// Allowed file extensions for code changes
const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',
  '.py', '.rb', '.go', '.rs',
  '.java', '.kt', '.swift',
  '.css', '.scss', '.html',
  '.json', '.yaml', '.yml',
  '.md', '.txt',
];

export function checkCodeSafety(changes: CodeChange[]): SafetyCheckResult {
  const violations: string[] = [];
  let maxSeverity: 'block' | 'warn' | 'info' = 'info';

  for (const change of changes) {
    // Check file path safety
    const pathViolation = checkFilePath(change.filePath);
    if (pathViolation) {
      violations.push(pathViolation);
      maxSeverity = 'block';
    }

    // Check file extension
    const extViolation = checkFileExtension(change.filePath);
    if (extViolation) {
      violations.push(extViolation);
      maxSeverity = 'warn';
    }

    // Check content for dangerous patterns
    const contentViolations = checkContentSafety(change.content);
    violations.push(...contentViolations);
    if (contentViolations.length > 0) {
      maxSeverity = 'block';
    }
  }

  return {
    safe: maxSeverity !== 'block',
    violations,
    severity: maxSeverity,
  };
}

function checkFilePath(filePath: string): string | null {
  // Check for protected system paths
  for (const protectedPath of PROTECTED_PATHS) {
    if (filePath.startsWith(protectedPath)) {
      return `Attempted to modify protected system path: ${protectedPath}`;
    }
  }
  return null;
}

function checkFileExtension(filePath: string): string | null {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    return `File extension ${ext} is not in allowed list`;
  }
  return null;
}

function checkContentSafety(content: string): string[] {
  const violations: string[] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(`Dangerous pattern detected: ${matches[0]}`);
    }
  }

  return violations;
}

// Check if a model output is safe to execute
export function checkModelOutput(output: string): SafetyCheckResult {
  const violations: string[] = [];
  let maxSeverity: 'block' | 'warn' | 'info' = 'info';

  // Check for command injection
  if (/;|\||&|\$\(/.test(output)) {
    violations.push('Shell command injection detected');
    maxSeverity = 'block';
  }

  // Check for file operations outside context
  if (/\.\.\/\.\./.test(output)) {
    violations.push('Path traversal attempt detected');
    maxSeverity = 'block';
  }

  // Check for large data operations
  if (output.length > 100000) {
    violations.push('Output size exceeds safe limit (100KB)');
    maxSeverity = 'warn';
  }

  return {
    safe: maxSeverity !== 'block',
    violations,
    severity: maxSeverity,
  };
}

// Validate that a command is safe to execute
export function validateCommand(command: string): SafetyCheckResult {
  const violations: string[] = [];
  let maxSeverity: 'block' | 'warn' | 'info' = 'info';

  // Block dangerous commands
  const dangerousCommands = [
    'rm -rf /',
    'del /s /q',
    'format',
    'shutdown',
    'reboot',
    'sudo',
    'su',
  ];

  for (const dangerous of dangerousCommands) {
    if (command.toLowerCase().includes(dangerous)) {
      violations.push(`Dangerous command blocked: ${dangerous}`);
      maxSeverity = 'block';
    }
  }

  return {
    safe: maxSeverity !== 'block',
    violations,
    severity: maxSeverity,
  };
}
