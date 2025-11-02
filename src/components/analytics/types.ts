/**
 * Analytics Types
 * تعريف جميع الأنواع المستخدمة في نظام التحليلات
 */

// Analytics Metrics
export interface AnalyticsMetrics {
  total_visits: number
  total_users: number
  active_campaigns: number
  performance_score: number
  conversion_rate: number
  bounce_rate: number
  session_duration: number
  page_views: number
  unique_visitors: number
  returning_visitors: number
}

// Time Series Data
export interface TimeSeriesData {
  timestamp: string
  value: number
  label?: string
  category?: string
}

// Campaign Analytics
export interface CampaignAnalytics {
  campaign_id: string
  campaign_name: string
  status: 'active' | 'paused' | 'completed'
  metrics: {
    sent_messages: number
    delivered_messages: number
    failed_messages: number
    response_rate: number
    click_rate: number
    conversion_rate: number
  }
  performance: {
    hourly: TimeSeriesData[]
    daily: TimeSeriesData[]
    weekly: TimeSeriesData[]
  }
}

// User Behavior Data
export interface UserBehaviorData {
  page_url: string
  visits: number
  unique_visitors: number
  avg_duration: number
  bounce_rate: number
  heatmap_data: {
    x: number
    y: number
    intensity: number
    timestamp: string
  }[]
}

// Performance Metrics
export interface PerformanceMetrics {
  cpu_usage: number
  memory_usage: number
  response_time: number
  error_rate: number
  uptime: number
  active_connections: number
}

// Alert System
export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  resolved: boolean
  metadata?: Record<string, any>
}

// Chart Configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar'
  dataKey: string
  color: string
  name: string
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
}

// Heatmap Configuration
export interface HeatmapConfig {
  gridSize: number
  intensity: number
  colorScheme: 'red' | 'blue' | 'green' | 'purple'
  showGrid?: boolean
  showTooltip?: boolean
}

// Analytics Filter
export interface AnalyticsFilter {
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d'
  metric: string
  campaign?: string
  group?: string
  search?: string
}

// Dashboard Layout
export interface DashboardLayout {
  columns: number
  rows: number
  components: DashboardComponent[]
}

export interface DashboardComponent {
  id: string
  type: 'chart' | 'metric' | 'heatmap' | 'table' | 'alert'
  position: { x: number; y: number; width: number; height: number }
  config: Record<string, any>
  visible: boolean
}

// Export Options
export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx'
  timeframe: string
  metrics: string[]
  includeCharts: boolean
  filename?: string
}

// Notification Settings
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  thresholds: {
    error_rate: number
    response_time: number
    cpu_usage: number
    memory_usage: number
  }
}

// Real-time Update
export interface RealtimeUpdate {
  type: 'metric' | 'alert' | 'campaign' | 'user'
  data: any
  timestamp: string
  source: string
}

// Analytics Query
export interface AnalyticsQuery {
  metrics: string[]
  filters: AnalyticsFilter
  groupBy?: string[]
  orderBy?: string
  limit?: number
  offset?: number
}

// Comparison Data
export interface ComparisonData {
  current: AnalyticsMetrics
  previous: AnalyticsMetrics
  change: {
    absolute: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
}

// User Session
export interface UserSession {
  session_id: string
  user_id?: string
  start_time: string
  end_time?: string
  duration?: number
  page_views: number
  events: UserEvent[]
  source: string
  device: string
  location?: string
}

export interface UserEvent {
  timestamp: string
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'purchase'
  element?: string
  value?: number
  metadata?: Record<string, any>
}

// Performance Benchmark
export interface PerformanceBenchmark {
  metric: string
  value: number
  unit: string
  percentile_25: number
  percentile_50: number
  percentile_75: number
  percentile_95: number
  percentile_99: number
}

// Custom Metric
export interface CustomMetric {
  id: string
  name: string
  description: string
  formula: string
  unit: string
  color: string
  chart_type: 'line' | 'bar' | 'area' | 'gauge'
  visible: boolean
  targets?: {
    good: number
    warning: number
    critical: number
  }
}

// Dashboard Theme
export interface DashboardTheme {
  primary_color: string
  secondary_color: string
  background_color: string
  text_color: string
  grid_color: string
  chart_colors: string[]
  dark_mode: boolean
  font_family: string
  border_radius: number
}

// Analytics Goal
export interface AnalyticsGoal {
  id: string
  name: string
  description: string
  metric: string
  target_value: number
  current_value: number
  deadline?: string
  status: 'active' | 'achieved' | 'missed' | 'paused'
  progress: number
}

// User Cohort
export interface UserCohort {
  cohort_id: string
  name: string
  size: number
  retention_rates: { day: number; rate: number }[]
  characteristics: Record<string, any>
  created_at: string
}

// Attribution Model
export interface AttributionModel {
  id: string
  name: string
  type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based'
  config: Record<string, any>
  conversions: AttributionConversion[]
}

export interface AttributionConversion {
  conversion_id: string
  timestamp: string
  value: number
  touchpoints: AttributionTouchpoint[]
}

export interface AttributionTouchpoint {
  timestamp: string
  channel: string
  campaign?: string
  weight: number
}

// A/B Test Results
export interface ABTestResults {
  test_id: string
  name: string
  variants: ABTestVariant[]
  metrics: ABTestMetric[]
  significance_level: number
  power: number
  status: 'running' | 'completed' | 'stopped'
}

export interface ABTestVariant {
  name: string
  traffic_allocation: number
  conversions: number
  visitors: number
  conversion_rate: number
  confidence_interval: [number, number]
}

export interface ABTestMetric {
  name: string
  variants: { [variant_name: string]: number }
  p_value: number
  significant: boolean
}