import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface AuditSection {
    title: string;
    items: { name: string; status: '✅' | '⚠️' | '❌' | 'ℹ️'; details: string }[];
}

const audit: AuditSection[] = [];

function addSection(title: string) {
    audit.push({ title, items: [] });
}

function addItem(name: string, status: '✅' | '⚠️' | '❌' | 'ℹ️', details: string) {
    audit[audit.length - 1].items.push({ name, status, details });
}

function countFiles(dir: string, ext: string): number {
    try {
        const result = execSync(`Get-ChildItem -Path "${dir}" -Recurse -Include "*${ext}" -ErrorAction SilentlyContinue | Measure-Object`, { encoding: 'utf8', shell: 'powershell.exe' });
        const match = result.match(/Count\s*:\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    } catch {
        return 0;
    }
}

function checkFileExists(filepath: string): boolean {
    return fs.existsSync(path.join(process.cwd(), filepath));
}

console.log('╔═══════════════════════════════════════╗');
console.log('║   FULL PROJECT AUDIT                  ║');
console.log('╚═══════════════════════════════════════╝\n');

// ====================
// SECTION 1: Project Structure
// ====================
addSection('📁 Project Structure');

const srcFiles = countFiles('./src', '.tsx') + countFiles('./src', '.ts');
addItem('Source Files', 'ℹ️', `${srcFiles} TypeScript/TSX files in src/`);

const hasAppRouter = checkFileExists('src/app');
addItem('Next.js App Router', hasAppRouter ? '✅' : '❌', hasAppRouter ? 'Using App Router' : 'Not found');

const hasComponents = checkFileExists('src/components');
addItem('Components Directory', hasComponents ? '✅' : '⚠️', hasComponents ? 'Organized component structure' : 'Missing');

const hasLib = checkFileExists('src/lib');
addItem('Lib Directory', hasLib ? '✅' : '⚠️', hasLib ? 'Utilities and services organized' : 'Missing');

const hasTypes = checkFileExists('src/types');
addItem('Types Directory', hasTypes ? '✅' : '⚠️', hasTypes ? 'TypeScript types organized' : 'Missing');

const hasHooks = checkFileExists('src/hooks');
addItem('Hooks Directory', hasHooks ? '✅' : '⚠️', hasHooks ? 'Custom hooks organized' : 'Missing');

// Check for root-level JS files (should be minimal)
const rootJsFiles = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('.')).length;
addItem('Root JS Files', rootJsFiles > 10 ? '⚠️' : '✅', `${rootJsFiles} JS files in root (test/config files)`);

// ====================
// SECTION 2: Code Quality
// ====================
addSection('🔍 Code Quality');

// TypeScript config
const hasTsConfig = checkFileExists('tsconfig.json');
addItem('TypeScript Config', hasTsConfig ? '✅' : '❌', hasTsConfig ? 'tsconfig.json present' : 'Missing');

// ESLint config
const hasEslint = checkFileExists('eslint.config.mjs') || checkFileExists('.eslintrc.json');
addItem('ESLint Config', hasEslint ? '✅' : '⚠️', hasEslint ? 'ESLint configured' : 'Missing');

// Package.json scripts
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasLintScript = !!pkg.scripts?.lint;
const hasBuildScript = !!pkg.scripts?.build;
addItem('Build Script', hasBuildScript ? '✅' : '❌', hasBuildScript ? 'npm run build available' : 'Missing');
addItem('Lint Script', hasLintScript ? '✅' : '❌', hasLintScript ? 'npm run lint available' : 'Missing');

// ====================
// SECTION 3: Appwrite Integration
// ====================
addSection('🔐 Appwrite Integration');

const hasAppwriteConfig = checkFileExists('src/lib/appwrite/config.ts');
addItem('Appwrite Config', hasAppwriteConfig ? '✅' : '❌', hasAppwriteConfig ? 'Configuration file exists' : 'Missing');

const hasAppwriteServer = checkFileExists('src/lib/appwrite/server.ts');
addItem('Server Client', hasAppwriteServer ? '✅' : '❌', hasAppwriteServer ? 'Server-side client configured' : 'Missing');

const hasActions = checkFileExists('src/lib/actions');
addItem('Server Actions', hasActions ? '✅' : '⚠️', hasActions ? 'Server actions directory exists' : 'Missing');

const hasRealtimeHooks = checkFileExists('src/hooks/useAppwriteRealtime.ts');
addItem('Realtime Hooks', hasRealtimeHooks ? '✅' : '⚠️', hasRealtimeHooks ? 'Realtime subscriptions implemented' : 'Not implemented');

// ====================
// SECTION 4: Frontend Features
// ====================
addSection('🎨 Frontend Features');

const hasAiChat = checkFileExists('src/components/ai-chat');
addItem('AI Chat Component', hasAiChat ? '✅' : 'ℹ️', hasAiChat ? 'AI chat feature implemented' : 'Not found');

const hasDashboard = checkFileExists('src/app/dashboard');
addItem('Dashboard', hasDashboard ? '✅' : 'ℹ️', hasDashboard ? 'Dashboard pages exist' : 'Not found');

const hasAuth = checkFileExists('src/app/(auth)') || checkFileExists('src/app/auth');
addItem('Authentication Pages', hasAuth ? '✅' : '⚠️', hasAuth ? 'Auth pages exist' : 'Missing');

const hasProperties = checkFileExists('src/app/properties');
addItem('Properties Pages', hasProperties ? '✅' : '⚠️', hasProperties ? 'Property listing pages exist' : 'Missing');

const hasMiddleware = checkFileExists('src/middleware.ts');
addItem('Middleware', hasMiddleware ? '✅' : '⚠️', hasMiddleware ? 'Next.js middleware configured' : 'Missing');

// ====================
// SECTION 5: Documentation
// ====================
addSection('📚 Documentation');

const hasReadme = checkFileExists('README.md');
addItem('README', hasReadme ? '✅' : '❌', hasReadme ? 'Project README exists' : 'Missing');

const hasAppwriteGuide = checkFileExists('APPWRITE_SETUP_GUIDE.md');
addItem('Appwrite Guide', hasAppwriteGuide ? '✅' : 'ℹ️', hasAppwriteGuide ? 'Setup guide available' : 'Not found');

const hasDocsDir = checkFileExists('docs');
addItem('Docs Directory', hasDocsDir ? '✅' : 'ℹ️', hasDocsDir ? 'Documentation folder exists' : 'Not found');

// ====================
// SECTION 6: Environment & Config
// ====================
addSection('⚙️ Environment & Config');

const hasEnvLocal = checkFileExists('.env.local');
addItem('Local ENV', hasEnvLocal ? '✅' : '⚠️', hasEnvLocal ? '.env.local exists' : 'Missing');

const hasEnvProduction = checkFileExists('.env.production');
addItem('Production ENV', hasEnvProduction ? '✅' : 'ℹ️', hasEnvProduction ? '.env.production exists' : 'Not found');

const hasNextConfig = checkFileExists('next.config.ts') || checkFileExists('next.config.js');
addItem('Next.js Config', hasNextConfig ? '✅' : '⚠️', hasNextConfig ? 'next.config configured' : 'Missing');

const hasDockerfile = checkFileExists('Dockerfile');
addItem('Docker Support', hasDockerfile ? '✅' : 'ℹ️', hasDockerfile ? 'Dockerfile exists' : 'Not configured');

const hasGitignore = checkFileExists('.gitignore');
addItem('Gitignore', hasGitignore ? '✅' : '⚠️', hasGitignore ? '.gitignore exists' : 'Missing');

// ====================
// SECTION 7: Testing
// ====================
addSection('🧪 Testing');

const hasVitest = checkFileExists('vitest.config.ts');
addItem('Vitest Config', hasVitest ? '✅' : 'ℹ️', hasVitest ? 'Vitest configured' : 'Not configured');

const hasTestDir = checkFileExists('src/__tests__');
addItem('Test Directory', hasTestDir ? '✅' : 'ℹ️', hasTestDir ? 'Tests directory exists' : 'Not found');

// ====================
// Generate Report
// ====================
console.log('Generating comprehensive report...\n');

let report = '# 🔍 Full Project Audit Report\n\n';
report += `**Generated**: ${new Date().toLocaleString()}\n`;
report += `**Project**: LandSale.lk\n`;
report += `**Framework**: Next.js with Appwrite\n\n`;
report += '---\n\n';

// Summary
let totalItems = 0;
let passed = 0;
let warnings = 0;
let failed = 0;

for (const section of audit) {
    for (const item of section.items) {
        totalItems++;
        if (item.status === '✅') passed++;
        else if (item.status === '⚠️') warnings++;
        else if (item.status === '❌') failed++;
    }
}

const score = Math.round((passed / (passed + warnings + failed)) * 100);

report += '## 📊 Executive Summary\n\n';
report += `| Metric | Value |\n`;
report += `|--------|-------|\n`;
report += `| **Overall Score** | ${score}% |\n`;
report += `| ✅ Passed | ${passed} |\n`;
report += `| ⚠️ Warnings | ${warnings} |\n`;
report += `| ❌ Failed | ${failed} |\n`;
report += `| ℹ️ Info | ${totalItems - passed - warnings - failed} |\n\n`;

// Status indicator
if (score >= 90) {
    report += '> [!TIP]\n> **EXCELLENT** - Project is well-structured and production-ready!\n\n';
} else if (score >= 70) {
    report += '> [!NOTE]\n> **GOOD** - Project is in good shape with minor improvements needed.\n\n';
} else if (score >= 50) {
    report += '> [!WARNING]\n> **NEEDS ATTENTION** - Several areas need improvement.\n\n';
} else {
    report += '> [!CAUTION]\n> **CRITICAL** - Major issues need to be addressed.\n\n';
}

report += '---\n\n';

// Detailed sections
for (const section of audit) {
    report += `## ${section.title}\n\n`;
    report += '| Status | Item | Details |\n';
    report += '|--------|------|--------|\n';

    for (const item of section.items) {
        report += `| ${item.status} | ${item.name} | ${item.details} |\n`;
    }
    report += '\n';
}

// Recommendations
report += '---\n\n';
report += '## 🎯 Recommendations\n\n';

const issues: { priority: string; issue: string; fix: string }[] = [];

// Collect issues
for (const section of audit) {
    for (const item of section.items) {
        if (item.status === '❌') {
            issues.push({ priority: '🔴 Critical', issue: item.name, fix: item.details });
        } else if (item.status === '⚠️') {
            issues.push({ priority: '🟡 Medium', issue: item.name, fix: item.details });
        }
    }
}

if (issues.length > 0) {
    report += '| Priority | Issue | Status |\n';
    report += '|----------|-------|--------|\n';
    for (const issue of issues) {
        report += `| ${issue.priority} | ${issue.issue} | ${issue.fix} |\n`;
    }
} else {
    report += '✅ No critical issues found!\n';
}

report += '\n---\n\n';
report += '*Report generated by Full Project Audit Tool*\n';

// Save report
const reportPath = path.join(process.cwd(), 'docs/FULL_PROJECT_AUDIT.md');
fs.writeFileSync(reportPath, report);

console.log('═'.repeat(50));
console.log(`📊 SCORE: ${score}%`);
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️ Warnings: ${warnings}`);
console.log(`❌ Failed: ${failed}`);
console.log('═'.repeat(50));
console.log(`\n📄 Report saved to: docs/FULL_PROJECT_AUDIT.md`);
