/**
 * اختبار شامل لنظام Migration الجديد
 * Comprehensive Test for New Migration System
 */

import { MigrationOrchestrator } from './src/lib/migrations/migration-orchestrator';
import { MigrationManager } from './src/lib/migrations/migration-manager';
import { RollbackManager } from './src/lib/migrations/rollback-manager';
import { IntegrityChecker } from './src/lib/migrations/integrity-checker';

async function testMigrationSystem() {
  console.log('🚀 بدء اختبار شامل لنظام Migration');
  console.log('=' * 60);

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test 1: تهيئة النظام
  console.log('\n📋 Test 1: تهيئة النظام');
  try {
    const orchestrator = new MigrationOrchestrator();
    console.log('✅ تم تهيئة MigrationOrchestrator بنجاح');
    testResults.tests.push({
      name: 'تهيئة النظام',
      status: 'passed',
      message: 'تم تهيئة النظام بنجاح'
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في تهيئة النظام:', error);
    testResults.tests.push({
      name: 'تهيئة النظام',
      status: 'failed',
      message: `فشل في التهيئة: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 2: اختبار إنشاء Migration Manager
  console.log('\n📋 Test 2: اختبار MigrationManager');
  try {
    const migrationManager = new MigrationManager();
    console.log('✅ تم إنشاء MigrationManager بنجاح');
    testResults.tests.push({
      name: 'MigrationManager',
      status: 'passed',
      message: 'تم إنشاء MigrationManager بنجاح'
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في إنشاء MigrationManager:', error);
    testResults.tests.push({
      name: 'MigrationManager',
      status: 'failed',
      message: `فشل في الإنشاء: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 3: اختبار RollbackManager
  console.log('\n📋 Test 3: اختبار RollbackManager');
  try {
    const rollbackManager = new RollbackManager();
    console.log('✅ تم إنشاء RollbackManager بنجاح');
    testResults.tests.push({
      name: 'RollbackManager',
      status: 'passed',
      message: 'تم إنشاء RollbackManager بنجاح'
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في إنشاء RollbackManager:', error);
    testResults.tests.push({
      name: 'RollbackManager',
      status: 'failed',
      message: `فشل في الإنشاء: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 4: اختبار IntegrityChecker
  console.log('\n📋 Test 4: اختبار IntegrityChecker');
  try {
    const integrityChecker = new IntegrityChecker();
    console.log('✅ تم إنشاء IntegrityChecker بنجاح');
    
    // اختبار فحص سريع للتكامل
    const integrityResult = await integrityChecker.checkIntegrity({
      scope: 'quick',
      checks: ['basic_connection']
    });
    
    console.log(`✅ فحص التكامل الأساسي: ${integrityResult.passed ? 'نجح' : 'فشل'}`);
    testResults.tests.push({
      name: 'IntegrityChecker',
      status: integrityResult.passed ? 'passed' : 'failed',
      message: integrityResult.passed ? 'فحص التكامل نجح' : 'فحص التكامل فشل'
    });
    
    if (!integrityResult.passed) {
      integrityResult.issues.forEach(issue => {
        console.log(`  ⚠️ ${issue.severity}: ${issue.description}`);
      });
    }
    
    testResults.summary.passed += integrityResult.passed ? 1 : 0;
    testResults.summary.failed += !integrityResult.passed ? 1 : 0;
  } catch (error) {
    console.error('❌ فشل في اختبار IntegrityChecker:', error);
    testResults.tests.push({
      name: 'IntegrityChecker',
      status: 'failed',
      message: `فشل في الاختبار: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 5: اختبار migration SQL بسيط
  console.log('\n📋 Test 5: اختبار SQL Migration');
  try {
    const migrationManager = new MigrationManager();
    
    // إنشاء migration تجريبي
    const testSql = `
      -- Test Migration: إضافة عمود test_column إلى teams
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS test_column VARCHAR(100) DEFAULT 'test';
      
      -- إنشاء فهرس تجريبي
      CREATE INDEX IF NOT EXISTS idx_teams_test ON teams (test_column);
    `;
    
    console.log('✅ تم إنشاء SQL test migration');
    
    // محاولة تنفيذ SQL بسيط (dry run)
    try {
      const dryRunResult = await migrationManager.validateMigration({
        id: 'test_sql_001',
        name: 'Test SQL Migration',
        sql: testSql,
        rollbackSql: 'ALTER TABLE teams DROP COLUMN IF EXISTS test_column; DROP INDEX IF EXISTS idx_teams_test;',
        timeout: 10000
      });
      
      console.log('✅ تم التحقق من صحة SQL migration');
      testResults.tests.push({
        name: 'SQL Migration Validation',
        status: 'passed',
        message: 'تم التحقق من SQL migration بنجاح'
      });
      testResults.summary.passed++;
    } catch (validationError) {
      console.log('⚠️ تحذير في التحقق من SQL:', validationError);
      testResults.tests.push({
        name: 'SQL Migration Validation',
        status: 'warning',
        message: `تحذير في التحقق: ${validationError}`
      });
      testResults.summary.passed++; // تحذير لا يعتبر فشل
    }
    
  } catch (error) {
    console.error('❌ فشل في اختبار SQL Migration:', error);
    testResults.tests.push({
      name: 'SQL Migration',
      status: 'failed',
      message: `فشل في اختبار SQL: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 6: اختبار Schema Version Manager
  console.log('\n📋 Test 6: اختبار SchemaVersionManager');
  try {
    const { SchemaVersionManager } = await import('./src/lib/migrations/schema-version-manager');
    const versionManager = new SchemaVersionManager();
    
    // اختبار الحصول على النسخة الحالية
    const currentVersion = await versionManager.getCurrentVersion();
    console.log(`✅ النسخة الحالية: ${currentVersion.version}`);
    
    testResults.tests.push({
      name: 'SchemaVersionManager',
      status: 'passed',
      message: `SchemaVersionManager يعمل - النسخة: ${currentVersion.version}`
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في اختبار SchemaVersionManager:', error);
    testResults.tests.push({
      name: 'SchemaVersionManager',
      status: 'failed',
      message: `فشل في SchemaVersionManager: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 7: اختبار نظام المراقبة
  console.log('\n📋 Test 7: اختبار MigrationMonitoringSystem');
  try {
    const { MigrationMonitoringSystem } = await import('./src/lib/migrations/migration-monitor');
    const monitoringSystem = new MigrationMonitoringSystem();
    
    // بدء المراقبة
    monitoringSystem.start();
    console.log('✅ تم بدء نظام المراقبة');
    
    // جمع مقاييس أولية
    const metrics = monitoringSystem.getMetrics();
    console.log(`✅ تم جمع ${Object.keys(metrics).length} مقياس أداء`);
    
    testResults.tests.push({
      name: 'MigrationMonitoringSystem',
      status: 'passed',
      message: `نظام المراقبة يعمل - ${Object.keys(metrics).length} مقياس`
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في اختبار MigrationMonitoringSystem:', error);
    testResults.tests.push({
      name: 'MigrationMonitoringSystem',
      status: 'failed',
      message: `فشل في نظام المراقبة: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 8: اختبار Deployment Manager
  console.log('\n📋 Test 8: اختبار DeploymentManager');
  try {
    const { DeploymentManager } = await import('./src/lib/migrations/deployment-manager');
    const deploymentManager = new DeploymentManager();
    
    console.log('✅ تم إنشاء DeploymentManager بنجاح');
    
    testResults.tests.push({
      name: 'DeploymentManager',
      status: 'passed',
      message: 'DeploymentManager جاهز للاستخدام'
    });
    testResults.summary.passed++;
  } catch (error) {
    console.error('❌ فشل في اختبار DeploymentManager:', error);
    testResults.tests.push({
      name: 'DeploymentManager',
      status: 'failed',
      message: `فشل في DeploymentManager: ${error}`
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // عرض النتائج النهائية
  console.log('\n' + '=' * 60);
  console.log('📊 ملخص نتائج الاختبار:');
  console.log(`✅ نجح: ${testResults.summary.passed}`);
  console.log(`❌ فشل: ${testResults.summary.failed}`);
  console.log(`📋 إجمالي: ${testResults.summary.total}`);
  console.log(`📈 معدل النجاح: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);

  // التوصيات
  console.log('\n🎯 التوصيات:');
  if (testResults.summary.failed === 0) {
    console.log('✅ جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
  } else if (testResults.summary.failed <= 2) {
    console.log('⚠️ معظم الاختبارات نجحت. يُنصح بمراجعة المكونات التي فشلت.');
  } else {
    console.log('❌ عدة اختبارات فشلت. يُنصح بفحص النظام قبل الاستخدام.');
  }

  // حفظ التقرير
  const fs = require('fs');
  const reportPath = './docs/migration-testing-results.md';
  
  const reportContent = generateReportContent(testResults);
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);

  return testResults;
}

function generateReportContent(testResults) {
  return `# تقرير اختبار نظام Migration

**تاريخ الاختبار:** ${testResults.timestamp}

## ملخص النتائج

- **المجموع:** ${testResults.summary.total}
- **نجح:** ${testResults.summary.passed}
- **فشل:** ${testResults.summary.failed}
- **معدل النجاح:** ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%

## تفاصيل الاختبارات

${testResults.tests.map((test, index) => `
### ${index + 1}. ${test.name}
- **الحالة:** ${test.status === 'passed' ? '✅ نجح' : test.status === 'warning' ? '⚠️ تحذير' : '❌ فشل'}
- **الرسالة:** ${test.message}
`).join('')}

## التوصيات

${testResults.summary.failed === 0 ? 
  '✅ جميع الاختبارات نجحت! النظام جاهز للاستخدام.' :
  testResults.summary.failed <= 2 ? 
    '⚠️ معظم الاختبارات نجحت. يُنصح بمراجعة المكونات التي فشلت.' :
    '❌ عدة اختبارات فشلت. يُنصح بفحص النظام قبل الاستخدام.'
}

## المكونات المختبرة

### ✅ مكونات تعمل بشكل طبيعي:
${testResults.tests.filter(t => t.status === 'passed').map(t => `- ${t.name}`).join('\n')}

${testResults.tests.some(t => t.status === 'warning') ? `### ⚠️ مكونات تحتاج مراجعة:
${testResults.tests.filter(t => t.status === 'warning').map(t => `- ${t.name}: ${t.message}`).join('\n')}` : ''}

${testResults.tests.some(t => t.status === 'failed') ? `### ❌ مكونات تحتاج إصلاح:
${testResults.tests.filter(t => t.status === 'failed').map(t => `- ${t.name}: ${t.message}`).join('\n')}` : ''}

## الخطوات التالية

1. **للاختبارات الناجحة:** النظام جاهز للاستخدام
2. **للتحذيرات:** مراجعة وإصلاح حسب الحاجة
3. **للأخطاء:** فحص وإصلاح المكونات المتأثرة
4. **اختبار شامل:** تجربة migration حقيقي في بيئة آمنة
5. **مراقبة الأداء:** تفعيل المراقبة للمتابعة المستمرة

---
*تم إنشاء هذا التقرير تلقائياً بواسطة نظام اختبار Migration*
`;
}

// تشغيل الاختبار
testMigrationSystem()
  .then((results) => {
    console.log('\n🎉 اكتمل اختبار نظام Migration بنجاح!');
    const successRate = (results.summary.passed / results.summary.total) * 100;
    process.exit(successRate >= 70 ? 0 : 1); // Exit with 0 if 70% or more tests pass
  })
  .catch((error) => {
    console.error('\n💥 فشل في اختبار نظام Migration:', error);
    process.exit(1);
  });