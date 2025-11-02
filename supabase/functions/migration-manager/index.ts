/**
 * Edge Function لإدارة الميجريشن المحسن
 * Enhanced Migration Management Edge Function
 */

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        console.log(`Migration API: ${method} ${path}`);

        let response;

        switch (true) {
            case path === '/api/migrations' && method === 'GET':
                response = await getMigrations(url.searchParams);
                break;
            
            case path.startsWith('/api/migrations/') && method === 'GET':
                const migrationId = path.split('/').pop();
                response = await getMigration(migrationId);
                break;
            
            case path === '/api/migrations' && method === 'POST':
                const createData = await req.json();
                response = await createMigration(createData);
                break;
            
            case path.startsWith('/api/migrations/execute/') && method === 'POST':
                const executeMigrationId = path.split('/').pop();
                const executeData = await req.json();
                response = await executeMigration(executeMigrationId, executeData);
                break;
            
            case path === '/api/migrations/batch' && method === 'POST':
                const batchData = await req.json();
                response = await executeBatchMigration(batchData);
                break;
            
            case path === '/api/migrations/rollback' && method === 'POST':
                const rollbackData = await req.json();
                response = await rollbackMigration(rollbackData);
                break;
            
            case path === '/api/migrations/validate' && method === 'POST':
                const validateData = await req.json();
                response = await validateMigrations(validateData);
                break;
            
            case path === '/api/migrations/health' && method === 'GET':
                response = await getSystemHealth();
                break;
            
            case path === '/api/migrations/report' && method === 'GET':
                response = await generateReport(url.searchParams);
                break;
            
            case path === '/api/migrations/cleanup' && method === 'POST':
                const cleanupData = await req.json();
                response = await cleanupSystem(cleanupData);
                break;
            
            default:
                response = {
                    error: {
                        code: 'ENDPOINT_NOT_FOUND',
                        message: `Endpoint not found: ${method} ${path}`
                    }
                };
        }

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Migration API Error:', error);

        const errorResponse = {
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message,
                details: error.stack
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

/**
 * الحصول على قائمة الميجريشن
 */
async function getMigrations(searchParams: URLSearchParams) {
    try {
        const client = createSupabaseClient();
        
        let query = client
            .from('registered_migrations')
            .select('*')
            .order('created_at', { ascending: false });

        // تطبيق الفلاتر
        const batch = searchParams.get('batch');
        const riskLevel = searchParams.get('risk_level');
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');

        if (batch) {
            query = query.eq('batch', batch);
        }

        if (riskLevel) {
            query = query.eq('risk_level', riskLevel);
        }

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;

        if (error) throw error;

        // تطبيق فلتر status بناءً على executions
        let filteredData = data || [];

        if (status) {
            const { data: executions } = await client
                .from('migration_executions')
                .select('migration_id, status')
                .in('migration_id', data?.map(m => m.id) || []);

            const statusMap = new Map();
            executions?.forEach(exec => {
                statusMap.set(exec.migration_id, exec.status);
            });

            filteredData = filteredData.filter(migration => {
                const latestStatus = statusMap.get(migration.id);
                return latestStatus === status;
            });
        }

        return {
            data: filteredData,
            count: filteredData.length,
            filters: {
                batch,
                risk_level: riskLevel,
                status,
                limit: limit ? parseInt(limit) : null
            }
        };

    } catch (error) {
        throw new Error(`Failed to get migrations: ${error.message}`);
    }
}

/**
 * الحصول على تفاصيل ميجريشن واحد
 */
async function getMigration(migrationId: string | undefined) {
    if (!migrationId) {
        throw new Error('Migration ID is required');
    }

    try {
        const client = createSupabaseClient();

        // جلب الميجريشن
        const { data: migration, error: migrationError } = await client
            .from('registered_migrations')
            .select('*')
            .eq('id', migrationId)
            .single();

        if (migrationError) throw migrationError;

        // جلب executions
        const { data: executions } = await client
            .from('migration_executions')
            .select('*')
            .eq('migration_id', migrationId)
            .order('start_time', { ascending: false });

        // جلب schema version
        const { data: schemaVersion } = await client
            .from('schema_versions')
            .select('*')
            .eq('migration_id', migrationId)
            .order('applied_at', { ascending: false })
            .limit(1)
            .single();

        // جلب الاختبارات
        const { data: tests } = await client
            .from('migration_tests')
            .select('*')
            .eq('migration_id', migrationId);

        return {
            migration,
            executions: executions || [],
            schema_version: schemaVersion || null,
            tests: tests || [],
            statistics: {
                total_executions: executions?.length || 0,
                successful_executions: executions?.filter(e => e.status === 'completed').length || 0,
                failed_executions: executions?.filter(e => e.status === 'failed').length || 0,
                last_execution: executions?.[0]?.start_time || null
            }
        };

    } catch (error) {
        throw new Error(`Failed to get migration: ${error.message}`);
    }
}

/**
 * إنشاء ميجريشن جديد
 */
async function createMigration(createData: any) {
    try {
        const client = createSupabaseClient();

        // التحقق من صحة البيانات
        validateMigrationData(createData);

        // التحقق من عدم وجود migration بنفس ID
        const { data: existing } = await client
            .from('registered_migrations')
            .select('id')
            .eq('id', createData.id)
            .single();

        if (existing) {
            throw new Error(`Migration with ID ${createData.id} already exists`);
        }

        // حفظ الميجريشن
        const { data: migration, error } = await client
            .from('registered_migrations')
            .insert({
                id: createData.id,
                name: createData.name,
                version: createData.version,
                description: createData.description,
                up_sql: createData.up_sql,
                down_sql: createData.down_sql || null,
                dependencies: createData.dependencies || [],
                batch: createData.batch,
                tags: createData.tags || [],
                estimated_duration: createData.estimated_duration,
                risk_level: createData.risk_level,
                requires_rollback: createData.requires_rollback !== false,
                metadata: createData.metadata || {},
                author: createData.author
            })
            .select()
            .single();

        if (error) throw error;

        // إنشاء اختبارات تلقائية إذا طلب ذلك
        if (createData.create_tests) {
            await createDefaultTests(client, migration.id);
        }

        return {
            migration,
            message: 'Migration created successfully'
        };

    } catch (error) {
        throw new Error(`Failed to create migration: ${error.message}`);
    }
}

/**
 * تنفيذ ميجريشن
 */
async function executeMigration(migrationId: string | undefined, executeData: any) {
    if (!migrationId) {
        throw new Error('Migration ID is required');
    }

    try {
        const client = createSupabaseClient();

        // التحقق من وجود الميجريشن
        const { data: migration } = await client
            .from('registered_migrations')
            .select('*')
            .eq('id', migrationId)
            .single();

        if (!migration) {
            throw new Error(`Migration not found: ${migrationId}`);
        }

        // التحقق من عدم وجود execution نشط
        const { data: activeExecution } = await client
            .from('migration_executions')
            .select('id')
            .eq('migration_id', migrationId)
            .in('status', ['pending', 'running'])
            .limit(1)
            .single();

        if (activeExecution && !executeData.force) {
            throw new Error(`Migration is already running: ${migrationId}`);
        }

        // إنشاء execution record
        const { data: execution, error: executionError } = await client
            .from('migration_executions')
            .insert({
                migration_id: migrationId,
                start_time: new Date().toISOString(),
                status: 'running',
                executor: executeData.executor || 'api',
                environment: executeData.environment || 'development'
            })
            .select()
            .single();

        if (executionError) throw executionError;

        try {
            // تنفيذ الميجريشن
            const startTime = Date.now();
            
            // تنفيذ SQL
            const { data: sqlResult, error: sqlError } = await client
                .rpc('execute_migration_sql', {
                    migration_sql: migration.up_sql,
                    timeout_seconds: executeData.timeout || 300
                });

            if (sqlError) throw sqlError;

            const endTime = Date.now();
            const duration = endTime - startTime;

            // تحديث حالة execution
            await client
                .from('migration_executions')
                .update({
                    end_time: new Date().toISOString(),
                    status: 'completed',
                    result: {
                        duration,
                        rows_affected: sqlResult?.rows_affected || 0,
                        success: true,
                        timestamp: new Date().toISOString()
                    }
                })
                .eq('id', execution.id);

            // إنشاء schema version
            await client
                .from('schema_versions')
                .insert({
                    version: migrationId,
                    description: migration.description,
                    applied_at: new Date().toISOString(),
                    checksum: calculateChecksum(migration.up_sql),
                    migration_id: migrationId,
                    status: 'current'
                });

            // إهمال الإصدارات السابقة
            await client
                .from('schema_versions')
                .update({ status: 'deprecated' })
                .neq('migration_id', migrationId)
                .eq('status', 'current');

            return {
                execution_id: execution.id,
                migration_id: migrationId,
                status: 'completed',
                duration,
                result: sqlResult,
                message: 'Migration executed successfully'
            };

        } catch (error) {
            // تحديث حالة execution بالفشل
            await client
                .from('migration_executions')
                .update({
                    end_time: new Date().toISOString(),
                    status: 'failed',
                    error_message: error.message
                })
                .eq('id', execution.id);

            throw error;
        }

    } catch (error) {
        throw new Error(`Failed to execute migration: ${error.message}`);
    }
}

/**
 * تنفيذ مجموعة من الميجريشن
 */
async function executeBatchMigration(batchData: any) {
    try {
        const { migrationIds, options = {} } = batchData;

        if (!migrationIds || !Array.isArray(migrationIds) || migrationIds.length === 0) {
            throw new Error('Migration IDs array is required');
        }

        const client = createSupabaseClient();

        const results = [];
        const failedMigrations = [];

        for (const migrationId of migrationIds) {
            try {
                const result = await executeMigration(migrationId, options);
                results.push(result);
            } catch (error) {
                failedMigrations.push({
                    migration_id: migrationId,
                    error: error.message
                });
            }
        }

        return {
            total_migrations: migrationIds.length,
            successful_migrations: results.length,
            failed_migrations: failedMigrations.length,
            results,
            failed_migration_details: failedMigrations,
            batch_status: failedMigrations.length === 0 ? 'completed' : 'partial_failure'
        };

    } catch (error) {
        throw new Error(`Failed to execute batch migration: ${error.message}`);
    }
}

/**
 * استعادة ميجريشن
 */
async function rollbackMigration(rollbackData: any) {
    try {
        const { migrationId, reason, executedBy } = rollbackData;

        if (!migrationId) {
            throw new Error('Migration ID is required');
        }

        const client = createSupabaseClient();

        // التحقق من وجود migration execution
        const { data: execution } = await client
            .from('migration_executions')
            .select('*')
            .eq('migration_id', migrationId)
            .eq('status', 'completed')
            .order('start_time', { ascending: false })
            .limit(1)
            .single();

        if (!execution) {
            throw new Error(`No completed execution found for migration: ${migrationId}`);
        }

        // التحقق من وجود rollback point
        const { data: rollbackPoint } = await client
            .from('rollback_points')
            .select('*')
            .eq('migration_execution_id', execution.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!rollbackPoint) {
            throw new Error(`No rollback point found for migration: ${migrationId}`);
        }

        // إنشاء rollback operation
        const { data: rollbackOperation, error: rollbackError } = await client
            .from('rollback_operations')
            .insert({
                id: generateId('rollback'),
                original_migration_id: execution.id,
                start_time: new Date().toISOString(),
                status: 'running',
                progress: 0,
                executed_by: executedBy || 'api',
                reason: reason || 'Manual rollback'
            })
            .select()
            .single();

        if (rollbackError) throw rollbackError;

        try {
            // تنفيذ rollback SQL إذا كان متوفراً
            const migration = await client
                .from('registered_migrations')
                .select('down_sql')
                .eq('id', migrationId)
                .single();

            if (migration.data?.down_sql) {
                await client
                    .from('migration_executions')
                    .execute_sql(migration.data.down_sql);
            }

            // تحديث حالة rollback
            await client
                .from('rollback_operations')
                .update({
                    end_time: new Date().toISOString(),
                    status: 'completed',
                    progress: 100
                })
                .eq('id', rollbackOperation.id);

            // تحديث حالة execution
            await client
                .from('migration_executions')
                .update({ status: 'rolled_back' })
                .eq('id', execution.id);

            return {
                rollback_operation_id: rollbackOperation.id,
                migration_id: migrationId,
                status: 'completed',
                message: 'Migration rolled back successfully'
            };

        } catch (error) {
            // تحديث حالة rollback بالفشل
            await client
                .from('rollback_operations')
                .update({
                    end_time: new Date().toISOString(),
                    status: 'failed'
                })
                .eq('id', rollbackOperation.id);

            throw error;
        }

    } catch (error) {
        throw new Error(`Failed to rollback migration: ${error.message}`);
    }
}

/**
 * التحقق من صحة الميجريشن
 */
async function validateMigrations(validateData: any) {
    try {
        const { migrationIds, checks } = validateData;

        if (!migrationIds || !Array.isArray(migrationIds)) {
            throw new Error('Migration IDs array is required');
        }

        const client = createSupabaseClient();

        const validationResults = [];

        for (const migrationId of migrationIds) {
            try {
                // التحقق من وجود الميجريشن
                const { data: migration } = await client
                    .from('registered_migrations')
                    .select('*')
                    .eq('id', migrationId)
                    .single();

                if (!migration) {
                    validationResults.push({
                        migration_id: migrationId,
                        valid: false,
                        errors: ['Migration not found']
                    });
                    continue;
                }

                // التحقق من dependencies
                const dependencyErrors = [];
                if (migration.dependencies) {
                    for (const depId of migration.dependencies) {
                        const { data: depMigration } = await client
                            .from('registered_migrations')
                            .select('id')
                            .eq('id', depId)
                            .single();

                        if (!depMigration) {
                            dependencyErrors.push(`Dependency not found: ${depId}`);
                        }
                    }
                }

                // التحقق من صحة SQL
                const sqlErrors = [];
                if (!migration.up_sql || migration.up_sql.trim().length === 0) {
                    sqlErrors.push('UP SQL is required');
                }

                if (dependencyErrors.length > 0 || sqlErrors.length > 0) {
                    validationResults.push({
                        migration_id: migrationId,
                        valid: false,
                        errors: [...dependencyErrors, ...sqlErrors]
                    });
                } else {
                    validationResults.push({
                        migration_id: migrationId,
                        valid: true,
                        errors: []
                    });
                }

            } catch (error) {
                validationResults.push({
                    migration_id: migrationId,
                    valid: false,
                    errors: [error.message]
                });
            }
        }

        const allValid = validationResults.every(r => r.valid);

        return {
            valid: allValid,
            total_validations: migrationIds.length,
            valid_count: validationResults.filter(r => r.valid).length,
            invalid_count: validationResults.filter(r => !r.valid).length,
            results: validationResults
        };

    } catch (error) {
        throw new Error(`Failed to validate migrations: ${error.message}`);
    }
}

/**
 * الحصول على صحة النظام
 */
async function getSystemHealth() {
    try {
        const client = createSupabaseClient();

        // فحص قاعدة البيانات
        const { data: dbHealth } = await client
            .rpc('check_database_health');

        // إحصائيات الميجريشن
        const { data: migrationStats } = await client
            .rpc('get_migration_statistics', { days_param: 7 });

        // فحص العمليات النشطة
        const { data: activeExecutions } = await client
            .from('migration_executions')
            .select('id, status, start_time')
            .in('status', ['pending', 'running']);

        // فحص التنبيهات
        const { data: alerts } = await client
            .from('migration_alerts')
            .select('id, severity, message, created_at')
            .eq('acknowledged', false)
            .order('created_at', { ascending: false })
            .limit(10);

        // حساب النقاط الصحية
        let healthScore = 100;
        const issues = [];

        if (!dbHealth?.connected) {
            healthScore -= 30;
            issues.push('Database connection failed');
        }

        if (migrationStats?.success_rate < 95) {
            healthScore -= 20;
            issues.push(`Low migration success rate: ${migrationStats.success_rate}%`);
        }

        const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;
        if (criticalAlerts > 0) {
            healthScore -= 25;
            issues.push(`${criticalAlerts} critical alerts`);
        }

        healthScore = Math.max(healthScore, 0);

        return {
            health_score: healthScore,
            status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'critical',
            database: dbHealth,
            migrations: migrationStats,
            active_operations: activeExecutions?.length || 0,
            alerts: alerts || [],
            issues,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        throw new Error(`Failed to get system health: ${error.message}`);
    }
}

/**
 * إنشاء تقرير
 */
async function generateReport(searchParams: URLSearchParams) {
    try {
        const period = searchParams.get('period') || '7d';
        const format = searchParams.get('format') || 'json';
        
        let startDate = new Date();
        const periodDays = parseInt(period.replace('d', ''));
        startDate.setDate(startDate.getDate() - periodDays);

        const client = createSupabaseClient();

        // جمع البيانات
        const [migrations, executions, tests, deployments] = await Promise.all([
            client.from('registered_migrations').select('*'),
            client.from('migration_executions').select('*').gte('start_time', startDate.toISOString()),
            client.from('test_results').select('*').gte('created_at', startDate.toISOString()),
            client.from('deployment_executions').select('*').gte('start_time', startDate.toISOString())
        ]);

        // تحليل البيانات
        const analysis = {
            period: periodDays,
            start_date: startDate.toISOString(),
            migrations: {
                total: migrations.data?.length || 0,
                recent: executions.data?.length || 0,
                success_rate: calculateSuccessRate(executions.data || [])
            },
            executions: {
                total: executions.data?.length || 0,
                completed: executions.data?.filter(e => e.status === 'completed').length || 0,
                failed: executions.data?.filter(e => e.status === 'failed').length || 0,
                running: executions.data?.filter(e => e.status === 'running').length || 0
            },
            tests: {
                total: tests.data?.length || 0,
                passed: tests.data?.filter(t => t.success).length || 0,
                failed: tests.data?.filter(t => !t.success).length || 0,
                success_rate: calculateSuccessRate(tests.data || [])
            },
            deployments: {
                total: deployments.data?.length || 0,
                successful: deployments.data?.filter(d => d.status === 'completed').length || 0,
                failed: deployments.data?.filter(d => d.status === 'failed').length || 0,
                success_rate: calculateSuccessRate(deployments.data || [])
            }
        };

        if (format === 'html') {
            return generateHTMLReport(analysis);
        }

        return analysis;

    } catch (error) {
        throw new Error(`Failed to generate report: ${error.message}`);
    }
}

/**
 * تنظيف النظام
 */
async function cleanupSystem(cleanupData: any) {
    try {
        const { 
            remove_old_executions = true,
            remove_orphan_rollback_points = true,
            cleanup_days = 30,
            remove_failed_migrations = false
        } = cleanupData;

        const client = createSupabaseClient();
        const results = {};

        if (remove_old_executions) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - cleanup_days);

            const { data: deletedExecutions, error: execError } = await client
                .from('migration_executions')
                .delete()
                .lt('created_at', cutoffDate.toISOString())
                .eq('status', 'completed');

            if (!execError) {
                results.old_executions_removed = deletedExecutions?.length || 0;
            }
        }

        if (remove_orphan_rollback_points) {
            const { data: deletedRollbackPoints, error: rollbackError } = await client
                .from('rollback_points')
                .delete()
                .not('migration_execution_id', 'in', `(${client.from('migration_executions').select('id').toString()})`);

            if (!rollbackError) {
                results.orphan_rollback_points_removed = deletedRollbackPoints?.length || 0;
            }
        }

        return {
            cleaned: true,
            results,
            message: 'System cleanup completed successfully'
        };

    } catch (error) {
        throw new Error(`Failed to cleanup system: ${error.message}`);
    }
}

// Helper functions

function createSupabaseClient() {
    // هذه الدالة تهيئة supabase client
    // في البيئة الحقيقية، ستستخدم متغيرات البيئة الحقيقية
    return {
        from: (table: string) => ({
            select: (columns = '*') => ({
                eq: (column: string, value: any) => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                    limit: (count: number) => ({
                        order: (column: string, options: any) => ({
                            toString: () => `SELECT ${columns} FROM ${table}`
                        })
                    }),
                    order: (column: string, options: any) => ({
                        limit: (count: number) => ({
                            single: () => Promise.resolve({ data: null, error: null })
                        })
                    }),
                    toString: () => `SELECT ${columns} FROM ${table}`
                }),
                in: (column: string, values: any[]) => ({
                    order: (column: string, options: any) => ({
                        limit: (count: number) => ({
                            single: () => Promise.resolve({ data: null, error: null }),
                            toString: () => `SELECT ${columns} FROM ${table}`
                        })
                    }),
                    toString: () => `SELECT ${columns} FROM ${table}`
                }),
                toString: () => `SELECT ${columns} FROM ${table}`
            }),
            insert: (data: any) => ({
                select: (columns = '*') => ({
                    single: () => Promise.resolve({ data: null, error: null })
                })
            }),
            update: (data: any) => ({
                eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
            }),
            delete: () => ({
                eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
                lt: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
                not: (column: string, operator: string, value: any) => Promise.resolve({ data: null, error: null })
            })
        }),
        rpc: (functionName: string, params: any) => Promise.resolve({ data: null, error: null })
    };
}

function validateMigrationData(data: any) {
    const required = ['id', 'name', 'version', 'description', 'up_sql', 'risk_level'];
    
    for (const field of required) {
        if (!data[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (!['low', 'medium', 'high', 'critical'].includes(data.risk_level)) {
        throw new Error('Invalid risk_level. Must be: low, medium, high, critical');
    }
}

function validateMigrationDataForExecution(data: any) {
    // إضافة validation logic هنا
}

function calculateChecksum(text: string): string {
    // حساب بسيط للchecksum
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // تحويل إلى 32bit integer
    }
    return Math.abs(hash).toString(16);
}

function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateSuccessRate(items: any[]): number {
    if (items.length === 0) return 100;
    
    const successful = items.filter(item => {
        if (item.status !== undefined) {
            return item.status === 'completed' || item.status === 'success';
        }
        if (item.success !== undefined) {
            return item.success === true;
        }
        return true; // افتراضي للنجاح
    }).length;

    return Math.round((successful / items.length) * 100 * 100) / 100;
}

function generateHTMLReport(analysis: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Migration Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .success { background-color: #d4edda; }
            .warning { background-color: #fff3cd; }
            .error { background-color: #f8d7da; }
        </style>
    </head>
    <body>
        <h1>Migration System Report</h1>
        <p>Period: Last ${analysis.period} days</p>
        
        <h2>Summary</h2>
        <div class="metric">
            <strong>Migrations:</strong> ${analysis.migrations.total} total, ${analysis.migrations.success_rate}% success rate
        </div>
        <div class="metric">
            <strong>Executions:</strong> ${analysis.executions.total} total, 
            ${analysis.executions.completed} completed, ${analysis.executions.failed} failed
        </div>
        <div class="metric">
            <strong>Tests:</strong> ${analysis.tests.success_rate}% success rate
        </div>
        <div class="metric">
            <strong>Deployments:</strong> ${analysis.deployments.success_rate}% success rate
        </div>
    </body>
    </html>
    `;
}

async function createDefaultTests(client: any, migrationId: string) {
    // إنشاء اختبارات افتراضية للميجريشن
    const tests = [
        {
            id: `migration_test_${migrationId}_${Date.now()}`,
            migration_id: migrationId,
            name: `Migration Execution Test: ${migrationId}`,
            type: 'integration',
            test_sql: `-- Test migration execution
                SELECT id FROM migration_executions 
                WHERE migration_id = '${migrationId}' 
                AND status = 'completed'`,
            expected_result: 'should_return_completed_migration',
            enabled: true,
            critical: true,
            timeout: 60000,
            retry_attempts: 3
        }
    ];

    await client
        .from('migration_tests')
        .insert(tests);
}