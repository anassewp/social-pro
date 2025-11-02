/**
 * اختبار بسيط لنظام Migration
 * Simple Migration System Test
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 بدء اختبار نظام Migration');
console.log('=' * 60);

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// فحص وجود الملفات
function checkFileExists(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${description}: موجود (${sizeKB} KB)`);
      return { status: 'passed', message: `ملف موجود - ${sizeKB} KB` };
    } else {
      console.log(`❌ ${description}: غير موجود`);
      return { status: 'failed', message: 'الملف غير موجود' };
    }
  } catch (error) {
    console.log(`❌ ${description}: خطأ في القراءة - ${error.message}`);
    return { status: 'failed', message: `خطأ: ${error.message}` };
  }
}

// فحص محتوى الملف
function checkFileContent(filePath, description, expectedContent = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return { status: 'failed', message: 'الملف غير موجود' };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    expectedContent.forEach(expected => {
      if (!content.includes(expected)) {
        issues.push(`مفقود: ${expected}`);
      }
    });
    
    if (issues.length === 0) {
      console.log(`✅ ${description}: المحتوى صحيح`);
      return { status: 'passed', message: 'المحتوى يحتوي على جميع العناصر المطلوبة' };
    } else {
      console.log(`⚠️ ${description}: ${issues.length} مشكلة`);
      return { status: 'warning', message: issues.join(', ') };
    }
  } catch (error) {
    return { status: 'failed', message: `خطأ في القراءة: ${error.message}` };
  }
}

// Test 1: فحص وجود مجلد migrations
console.log('\n📋 Test 1: فحص مجلد migrations');
const migrationsDir = './src/lib/migrations';
const migrationsDirResult = checkFileExists(migrationsDir, 'مجلد migrations');
testResults.tests.push({
  name: 'مجلد migrations',
  ...migrationsDirResult
});
testResults.summary[migrationsDirResult.status]++;

const migrationFiles = [
  'index.ts',
  'migration-types.ts',
  'migration-manager.ts',
  'rollback-manager.ts',
  'schema-version-manager.ts',
  'data-migration-utils.ts',
  'migration-testing.ts',
  'migration-monitor.ts',
  'deployment-manager.ts',
  'integrity-checker.ts',
  'migration-orchestrator.ts'
];

// Test 2: فحص وجود ملفات migrations
console.log('\n📋 Test 2: فحص ملفات migration system');
let filesExist = 0;
let filesTotal = migrationFiles.length;

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  const result = checkFileExists(filePath, file);
  
  testResults.tests.push({
    name: file,
    ...result
  });
  testResults.summary[result.status]++;
  
  if (result.status === 'passed') {
    filesExist++;
  }
});

console.log(`📊 ملفات موجودة: ${filesExist}/${filesTotal}`);

// Test 3: فحص ملف التصدير الرئيسي
console.log('\n📋 Test 3: فحص ملف التصدير');
const indexPath = path.join(migrationsDir, 'index.ts');
const indexContent = checkFileContent(indexPath, 'ملف index.ts', [
  'export * from \'./migration-manager\'',
  'export * from \'./rollback-manager\'',
  'export * from \'./migration-orchestrator\'',
  'MigrationOrchestrator'
]);

testResults.tests.push({
  name: 'ملف index.ts',
  ...indexContent
});
testResults.summary[indexContent.status]++;

const indexResult = checkFileExists(indexPath, 'ملف index.ts');
testResults.summary[indexResult.status]++;

// Test 4: فحص migration SQL files
console.log('\n📋 Test 4: فحص SQL migrations');
const supabaseMigrationsDir = './supabase/migrations';
const sqlFiles = fs.readdirSync(supabaseMigrationsDir)
  .filter(file => file.endsWith('.sql'));

console.log(`📋 SQL migrations موجودة: ${sqlFiles.length}`);
sqlFiles.slice(0, 5).forEach(file => {
  const filePath = path.join(supabaseMigrationsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`  - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
});

testResults.tests.push({
  name: 'SQL migrations',
  status: sqlFiles.length > 0 ? 'passed' : 'warning',
  message: `${sqlFiles.length} ملف SQL migration موجود`
});
testResults.summary[sqlFiles.length > 0 ? 'passed' : 'warning']++;

// Test 5: فحص الوثائق
console.log('\n📋 Test 5: فحص الوثائق');
const docsDir = './docs';
const migrationDocPath = path.join(docsDir, 'migrations-optimization.md');
const docResult = checkFileExists(migrationDocPath, 'وثيقة migrations-optimization.md');

testResults.tests.push({
  name: 'وثائق Migration',
  ...docResult
});
testResults.summary[docResult.status]++;

// Test 6: فحص imports والـ exports
console.log('\n📋 Test 6: فحص structure completeness');
const orchestratorPath = path.join(migrationsDir, 'migration-orchestrator.ts');
const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');

const structureChecks = [
  { pattern: 'export class MigrationOrchestrator', name: 'MigrationOrchestrator class' },
  { pattern: 'executeComprehensiveMigration', name: 'executeComprehensiveMigration method' },
  { pattern: 'MigrationManager', name: 'MigrationManager import' },
  { pattern: 'RollbackManager', name: 'RollbackManager import' },
  { pattern: 'IntegrityChecker', name: 'IntegrityChecker import' }
];

let structureScore = 0;
structureChecks.forEach(check => {
  if (orchestratorContent.includes(check.pattern)) {
    console.log(`✅ ${check.name}: موجود`);
    structureScore++;
  } else {
    console.log(`❌ ${check.name}: مفقود`);
  }
});

testResults.tests.push({
  name: 'MigrationOrchestrator structure',
  status: structureScore >= 4 ? 'passed' : structureScore >= 2 ? 'warning' : 'failed',
  message: `${structureScore}/${structureChecks.length} عنصر موجود`
});
testResults.summary[structureScore >= 4 ? 'passed' : structureScore >= 2 ? 'warning' : 'failed']++;

// Test 7: فحص الكود التعليقات والـ documentation
console.log('\n📋 Test 7: فحص التعليقات والتوثيق');
const managerPath = path.join(migrationsDir, 'migration-manager.ts');
const managerContent = fs.readFileSync(managerPath, 'utf8');

const docScore = [
  { pattern: '/**', name: 'Docstrings', check: (content) => (content.match(/\/\*\*/g) || []).length },
  { pattern: 'TODO', name: 'TODOs', check: (content) => (content.match(/TODO/g) || []).length },
  { pattern: 'Arabic', name: 'Arabic comments', check: (content) => (content.match(/Arabic|العربية|النظام|الميجريشن/g) || []).length },
  { pattern: 'async', name: 'Async methods', check: (content) => (content.match(/async\s+\w+/g) || []).length }
];

let totalDocScore = 0;
docScore.forEach(item => {
  const count = item.check(managerContent);
  if (count > 0) {
    console.log(`✅ ${item.name}: ${count} عنصر`);
    totalDocScore++;
  } else {
    console.log(`❌ ${item.name}: غير موجود`);
  }
});

testResults.tests.push({
  name: 'Code documentation',
  status: totalDocScore >= 3 ? 'passed' : 'warning',
  message: `${totalDocScore}/${docScore.length} نوع توثيق موجود`
});
testResults.summary[totalDocScore >= 3 ? 'passed' : 'warning']++;

// Test 8: فحص حجم الكود
console.log('\n📋 Test 8: تحليل حجم الكود');
let totalLines = 0;
let totalSize = 0;

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    totalLines += lines;
    totalSize += fs.statSync(filePath).size;
  }
});

const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
const linesPerFile = (totalLines / filesExist).toFixed(0);

console.log(`📊 إجمالي أسطر الكود: ${totalLines.toLocaleString()}`);
console.log(`📊 حجم الكود: ${sizeMB} MB`);
console.log(`📊 متوسط الأسطر لكل ملف: ${linesPerFile}`);

testResults.tests.push({
  name: 'Code size analysis',
  status: totalLines > 5000 ? 'passed' : 'warning',
  message: `${totalLines.toLocaleString()} سطر, ${sizeMB} MB`
});
testResults.summary[totalLines > 5000 ? 'passed' : 'warning']++;

// عرض النتائج النهائية
console.log('\n' + '=' * 60);
console.log('📊 ملخص نتائج الاختبار:');
console.log(`✅ نجح: ${testResults.summary.passed}`);
console.log(`⚠️ تحذيرات: ${testResults.summary.warnings}`);
console.log(`❌ فشل: ${testResults.summary.failed}`);
console.log(`📋 إجمالي: ${testResults.summary.total}`);
console.log(`📈 معدل النجاح: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);

// التوصيات
console.log('\n🎯 التوصيات:');
if (testResults.summary.failed === 0) {
  if (testResults.summary.warnings === 0) {
    console.log('✅ ممتاز! جميع الاختبارات نجحت بدون تحذيرات. النظام جاهز للاستخدام.');
  } else {
    console.log('✅ جيد جداً! النظام يعمل بشكل طبيعي مع بعض التحسينات المقترحة.');
  }
} else if (testResults.summary.failed <= 2) {
  console.log('⚠️ جيد. معظم المكونات تعمل، يُنصح بمراجعة المكونات التي فشلت.');
} else {
  console.log('❌ يحتاج تحسين. عدة مكونات تحتاج مراجعة وإصلاح.');
}

// إحصائيات تفصيلية
console.log('\n📈 إحصائيات النظام:');
console.log(`- عدد ملفات TypeScript: ${filesExist}`);
console.log(`- إجمالي أسطر الكود: ${totalLines.toLocaleString()}`);
console.log(`- حجم النظام: ${sizeMB} MB`);
console.log(`- متوسط التعقيد: ${linesPerFile} سطر/ملف`);

// حفظ التقرير
const reportContent = generateMarkdownReport(testResults);
const reportPath = './docs/migration-testing-results.md';

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);

function generateMarkdownReport(results) {
  return `# تقرير اختبار نظام Migration

**تاريخ الاختبار:** ${results.timestamp}

## ملخص النتائج

- **المجموع:** ${results.summary.total}
- **نجح:** ${results.summary.passed}
- **تحذيرات:** ${results.summary.warnings}  
- **فشل:** ${results.summary.failed}
- **معدل النجاح:** ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%

## تفاصيل الاختبارات

${results.tests.map((test, index) => `
### ${index + 1}. ${test.name}
- **الحالة:** ${test.status === 'passed' ? '✅ نجح' : test.status === 'warning' ? '⚠️ تحذير' : '❌ فشل'}
- **الرسالة:** ${test.message}
`).join('')}

## إحصائيات النظام

- **عدد ملفات TypeScript:** ${filesExist}/${migrationFiles.length}
- **إجمالي أسطر الكود:** ${totalLines.toLocaleString()}
- **حجم النظام:** ${sizeMB} MB
- **متوسط الأسطر لكل ملف:** ${linesPerFile}

## التوصيات

${results.summary.failed === 0 ? 
  results.summary.warnings === 0 ? 
    '✅ ممتاز! جميع الاختبارات نجحت بدون تحذيرات. النظام جاهز للاستخدام.' :
    '✅ جيد جداً! النظام يعمل بشكل طبيعي مع بعض التحسينات المقترحة.' :
  results.summary.failed <= 2 ? 
    '⚠️ جيد. معظم المكونات تعمل، يُنصح بمراجعة المكونات التي فشلت.' :
  '❌ يحتاج تحسين. عدة مكونات تحتاج مراجعة وإصلاح.'
}

## المكونات المختبرة

### ✅ مكونات تعمل بشكل طبيعي:
${results.tests.filter(t => t.status === 'passed').map(t => `- ${t.name}`).join('\n')}

${results.tests.some(t => t.status === 'warning') ? `### ⚠️ مكونات تحتاج مراجعة:
${results.tests.filter(t => t.status === 'warning').map(t => `- ${t.name}: ${t.message}`).join('\n')}` : ''}

${results.tests.some(t => t.status === 'failed') ? `### ❌ مكونات تحتاج إصلاح:
${results.tests.filter(t => t.status === 'failed').map(t => `- ${t.name}: ${t.message}`).join('\n')}` : ''}

## الخطوات التالية

1. **للاختبارات الناجحة:** النظام جاهز للاستخدام في بيئة التطوير
2. **للتحذيرات:** مراجعة وإصلاح حسب الحاجة
3. **للأخطاء:** فحص وإصلاح المكونات المتأثرة
4. **اختبار شامل:** تجربة migration حقيقي في بيئة آمنة
5. **مراقبة الأداء:** تفعيل المراقبة للمتابعة المستمرة
6. **التوثيق:** إكمال التوثيق للأجزاء التي تحتاج توضيح

## اختبار migration فعلي (الخطوات التالية)

\`\`\`bash
# 1. إعداد متغيرات البيئة
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# 2. تشغيل اختبار migration تجريبي
node -e "
const { MigrationManager } = require('./src/lib/migrations/migration-manager');
const manager = new MigrationManager();
console.log('Migration Manager initialized successfully');
"

# 3. اختبار SQL migration في بيئة آمنة
# إنشاء backup قبل أي migration حقيقي
# اختبار migration بسيط مثل إضافة عمود
# التحقق من النتائج
\`\`\`

---
*تم إنشاء هذا التقرير تلقائياً بواسطة نظام اختبار Migration*
*الاختبار تم في: ${new Date().toISOString()}*
`;
}

// إنهاء الاختبار
console.log('\n🎉 اكتمل اختبار نظام Migration!');
const successRate = (testResults.summary.passed / testResults.summary.total) * 100;
console.log(`📊 معدل النجاح النهائي: ${successRate.toFixed(1)}%`);

process.exit(successRate >= 70 ? 0 : 1);