import { MigrationOrchestrator } from './src/lib/migrations/migration-orchestrator';
import { createClient } from '@supabase/supabase-js';

// إعداد العميل للاختبار
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function runTestMigration() {
  console.log('🚀 بدء اختبار نظام الـ Migration');
  console.log('=' .repeat(60));

  try {
    const orchestrator = new MigrationOrchestrator(supabase);

    // إنشاء Migration تجريبي
    const testMigration = {
      id: '015_test_migration',
      name: 'إضافة إعدادات الفريق',
      description: 'إضافة عمود settings إلى جدول teams',
      version: '1.0.0',
      dependencies: [],
      priority: 'high' as const,
      steps: [
        {
          id: 'add_settings_column',
          type: 'schema' as const,
          description: 'إضافة عمود settings إلى جدول teams',
          sql: `
            -- إضافة عمود settings إلى جدول teams
            ALTER TABLE teams 
            ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
            
            -- إضافة تعليقات وصفية
            COMMENT ON COLUMN teams.settings IS 'إعدادات تخصيص الفريق';
            
            -- إنشاء فهرس للأداء
            CREATE INDEX IF NOT EXISTS idx_teams_settings 
            ON teams USING GIN (settings);
          `,
          timeout: 30000,
          rollbackSql: `
            -- حذف العمود والإعدادات
            DROP INDEX IF EXISTS idx_teams_settings;
            ALTER TABLE teams DROP COLUMN IF EXISTS settings;
          `
        },
        {
          id: 'update_existing_teams',
          type: 'data' as const,
          description: 'تحديث الفرق الموجودة بإعدادات افتراضية',
          sql: `
            -- تحديث جميع الفرق الموجودة بإعدادات افتراضية
            UPDATE teams 
            SET settings = jsonb_build_object(
              'theme', 'default',
              'notifications_enabled', true,
              'auto_backup', false,
              'max_members', 100
            )
            WHERE settings IS NULL OR settings = '{}'::jsonb;
            
            -- التحقق من عدد السجلات المحدثة
            DO $$
            DECLARE
              updated_count INTEGER;
            BEGIN
              GET DIAGNOSTICS updated_count = ROW_COUNT;
              RAISE NOTICE 'تم تحديث % سجل', updated_count;
            END $$;
          `,
          timeout: 15000,
          rollbackSql: `
            -- إعادة تعيين الإعدادات للفرق الموجودة
            UPDATE teams 
            SET settings = '{}'::jsonb
            WHERE settings IS NOT NULL;
          `
        }
      ],
      rollbackStrategy: 'snapshot' as const,
      testingConfig: {
        runInSandbox: true,
        validateIntegrity: true,
        performanceTest: true
      },
      deploymentConfig: {
        strategy: 'canary' as const,
        healthCheckTimeout: 10000,
        rollbackOnFailure: true
      }
    };

    console.log('📝 تم إنشاء Migration تجريبي:', testMigration.id);
    console.log('📋 خطوات الـ Migration:', testMigration.steps.length);

    // تنفيذ الـ Migration
    console.log('\n🔄 تنفيذ الـ Migration...');
    const startTime = Date.now();
    
    const result = await orchestrator.executeMigrationPipeline({
      migration: testMigration,
      options: {
        dryRun: false,
        validateOnly: false,
        forceExecution: false
      }
    });

    const executionTime = Date.now() - startTime;

    // عرض النتائج
    console.log('\n✅ نتائج تنفيذ الـ Migration:');
    console.log('=' .repeat(60));
    console.log(`📊 الحالة: ${result.success ? 'نجح' : 'فشل'}`);
    console.log(`⏱️  الوقت المستغرق: ${executionTime}ms`);
    console.log(`📈 الخطوات المنجزة: ${result.completedSteps.length}/${testMigration.steps.length}`);
    console.log(`⚠️  الخطوات الفاشلة: ${result.failedSteps.length}`);
    
    if (result.metrics) {
      console.log('\n📊 مقاييس الأداء:');
      console.log(`• البيانات المعالجة: ${result.metrics.dataProcessed || 0} سجل`);
      console.log(`• الفهارس المنشأة: ${result.metrics.indexesCreated || 0}`);
      console.log(`• استخدام الذاكرة: ${result.metrics.memoryUsage || 'غير محدد'}`);
    }

    // التحقق من integrity
    console.log('\n🔍 تشغيل فحوصات التكامل...');
    const integrityResult = await orchestrator.integrityChecker.checkIntegrity({
      scope: 'tables',
      tables: ['teams'],
      checks: ['foreign_keys', 'constraints', 'data_types', 'indexes']
    });

    console.log(`✅ فحوصات التكامل: ${integrityResult.passed ? 'نجحت' : 'فشلت'}`);
    if (!integrityResult.passed) {
      console.log('⚠️  مشاكل مكتشفة:', integrityResult.issues.length);
      integrityResult.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.severity}: ${issue.description}`);
      });
    }

    // اختبار Rollback
    console.log('\n🔄 اختبار آلية Rollback...');
    const rollbackStartTime = Date.now();
    
    const rollbackResult = await orchestrator.rollbackManager.rollbackMigration({
      migrationId: testMigration.id,
      reason: 'اختبار Rollback',
      confirmRollback: true
    });

    const rollbackTime = Date.now() - rollbackStartTime;

    console.log(`📊 نتائج Rollback: ${rollbackResult.success ? 'نجح' : 'فشل'}`);
    console.log(`⏱️  وقت Rollback: ${rollbackTime}ms`);
    
    if (rollbackResult.snapshots) {
      console.log(`📸 نقاط الاستعادة: ${rollbackResult.snapshots.length}`);
    }

    // التحقق النهائي
    console.log('\n🔍 التحقق النهائي من حالة الجدول...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('teams')
      .select('id, name, settings')
      .limit(1);

    if (!tableError) {
      console.log('✅ الجدول متاح ويعمل بشكل طبيعي');
      console.log(`📊 عدد الأعمدة: ${tableCheck ? Object.keys(tableCheck[0] || {}).length : 0}`);
    } else {
      console.log('⚠️  تحذير: مشكلة في الوصول للجدول');
    }

    // إنشاء التقرير النهائي
    const testReport = {
      testName: 'اختبار Migration System',
      timestamp: new Date().toISOString(),
      migrationId: testMigration.id,
      results: {
        migrationExecution: {
          success: result.success,
          executionTime,
          stepsCompleted: result.completedSteps.length,
          stepsFailed: result.failedSteps.length
        },
        integrityChecks: {
          success: integrityResult.passed,
          issuesFound: integrityResult.issues.length
        },
        rollbackTest: {
          success: rollbackResult.success,
          executionTime: rollbackTime,
          snapshots: rollbackResult.snapshots?.length || 0
        }
      },
      recommendations: [
        result.success ? 'نظام الـ Migration يعمل بشكل طبيعي' : 'يحتاج إصلاح',
        integrityResult.passed ? 'فحوصات التكامل سليم' : 'يحتاج مراجعة',
        rollbackResult.success ? 'آلية Rollback فعالة' : 'تحسين آلية Rollback مطلوب'
      ]
    };

    console.log('\n📋 التقرير النهائي:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(testReport, null, 2));

    return testReport;

  } catch (error) {
    console.error('❌ خطأ في اختبار الـ Migration:', error);
    throw error;
  }
}

// تشغيل الاختبار
runTestMigration()
  .then((report) => {
    console.log('\n🎉 اكتمل اختبار نظام الـ Migration بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشل في اختبار نظام الـ Migration:', error);
    process.exit(1);
  });