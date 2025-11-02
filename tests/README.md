# دليل الاختبارات - Social Pro

## نظرة عامة

هذا الدليل يشرح كيفية تشغيل وإدارة نظام الاختبارات الشامل لمشروع Social Pro.

## محتويات

- [البدء السريع](#البدء-السريع)
- [أنواع الاختبارات](#أنواع-الاختبارات)
- [تشغيل الاختبارات](#تشغيل-الاختبارات)
- [الهيكل التنظيمي](#الهيكل-التنظيمي)
- [أدوات الاختبار](#أدوات-الاختبار)
- [المساهمة في الاختبارات](#المساهمة-في-الاختبارات)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## البدء السريع

### المتطلبات الأساسية

```bash
# تثبيت التبعيات
npm install

# التأكد من تشغيل بيئة الاختبار
cp .env.example .env.test

# إعداد قاعدة البيانات للاختبار
npm run db:migrate
npm run db:seed:test
```

### تشغيل جميع الاختبارات

```bash
# تشغيل جميع الاختبارات مع التغطية
npm run test:all

# أو تنفيذ المراحل تدريجياً
npm run test:unit          # اختبارات الوحدة
npm run test:integration   # اختبارات التكامل
npm run test:api          # اختبارات API
npm run test:e2e          # اختبارات E2E
npm run test:security     # اختبارات الأمان
npm run test:performance  # اختبارات الأداء
```

---

## أنواع الاختبارات

### 1. اختبارات الوحدة (Unit Tests)

**المسار**: `tests/components/`, `tests/hooks/`, `tests/lib/`

**الغرض**: اختبار المكونات الفردية بمعزل عن باقي النظام.

```bash
# تشغيل اختبارات المكونات
npm run test:components

# تشغيل اختبارات Hooks
npm run test:hooks

# تشغيل اختبارات المكتبات
npm run test:lib

# تشغيل وحدة محددة
npm test tests/components/Loading.test.tsx
```

**مثال على الاختبار**:
```typescript
// tests/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. اختبارات التكامل (Integration Tests)

**المسار**: `tests/api/`

**الغرض**: اختبار تفاعل المكونات مع بعضها البعض ومع الخدمات الخارجية.

```bash
# تشغيل جميع اختبارات التكامل
npm run test:integration

# تشغيل اختبارات API محددة
npm test tests/api/__tests__/api.integration.test.ts
```

### 3. اختبارات E2E (End-to-End)

**المسار**: `tests/e2e/`

**الغرض**: اختبار التدفق الكامل للتطبيق من منظور المستخدم.

```bash
# تشغيل جميع اختبارات E2E
npm run test:e2e

# تشغيل متصفح محدد
npm run test:e2e:chromium
npm run test:e2e:firefox

# تشغيل مع واجهة رسومية
npm run test:e2e:headed

# تشغيل في وضع debug
npm run test:e2e:debug

# اختبار الأجهزة المحمولة
npm run test:e2e:mobile
```

**مثال على الاختبار**:
```typescript
// tests/e2e/__tests__/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
});
```

### 4. اختبارات الأداء (Performance Tests)

**المسار**: `tests/performance/`

**الغرض**: التأكد من أن التطبيق يلبي متطلبات الأداء.

```bash
# تشغيل اختبارات الأداء
npm run test:performance

# تشغيل اختبارات الحمولة
npm run test:load

# تشغيل اختبارات الضغط
npm run test:stress
```

### 5. اختبارات الأمان (Security Tests)

**المسار**: `tests/security/`

**الغرض**: التأكد من حماية التطبيق من الثغرات الأمنية.

```bash
# تشغيل اختبارات الأمان
npm run test:security

# فحص أمني شامل
npm run security:scan
```

### 6. API Testing Suite

**المسار**: `tests/api-suite/`

**الغرض**: اختبار شامل لجميع نقاط النهاية في API.

```bash
# تشغيل مجموعة اختبارات API
npm run test:api:suite
```

---

## تشغيل الاختبارات

### أوامر مفيدة

```bash
# تشغيل في وضع المراقبة (Watch Mode)
npm run test:watch

# تشغيل اختبار محدد
npm test -- --testNamePattern="Button"

# تشغيل مع التغطية
npm run test:coverage

# تشغيل اختبار معين فقط
npm test tests/components/Loading.test.tsx

# تشغيل مع verbose output
npm test -- --verbose

# تشغيل بعدد محدد من العمليات
npm test -- --maxWorkers=2
```

### متغيرات البيئة للاختبار

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/socialpro_test
JWT_SECRET=test-jwt-secret
ENCRYPTION_KEY=test-encryption-key-32-chars
TELEGRAM_API_ID=test-api-id
TELEGRAM_API_HASH=test-api-hash
SUPABASE_URL=https://test.supabase.co
SUPABASE_ANON_KEY=test-anon-key
```

### إعداد Playwright

```bash
# تثبيت متصفحات Playwright
npx playwright install

# تثبيت جميع التبعيات المطلوبة
npx playwright install --with-deps

# فحص حالة التثبيت
npx playwright install --dry-run
```

---

## الهيكل التنظيمي

```
tests/
├── components/           # اختبارات مكونات React
│   ├── __tests__/        # اختبارات الوحدة والتكامل
│   │   ├── components.unit.test.tsx
│   │   └── components.integration.test.tsx
│   ├── __mocks__/        # ملفات المحاكاة
│   └── fixtures/         # بيانات اختبار ثابتة
├── hooks/               # اختبارات Custom Hooks
│   └── __tests__/
├── lib/                 # اختبارات المكتبات والوظائف
│   ├── __tests__/
│   └── __mocks__/
├── api/                 # اختبارات API routes
│   ├── __tests__/
│   └── __mocks__/
├── api-suite/           # مجموعة اختبارات API شاملة
│   └── __tests__/
├── e2e/                 # اختبارات End-to-End
│   ├── __tests__/
│   ├── global-setup.ts  # إعداد عام قبل الاختبارات
│   └── global-teardown.ts # تنظيف عام بعد الاختبارات
├── performance/         # اختبارات الأداء
│   └── __tests__/
├── security/            # اختبارات الأمان
│   └── __tests__/
├── accessibility/       # اختبارات إمكانية الوصول
│   └── __tests__/
├── utils/               # أدوات مساعدة للاختبار
│   ├── test-utils.ts
│   ├── mocks/
│   └── fixtures/
└── config/              # ملفات التكوين
    ├── jest.config.js
    ├── playwright.config.ts
    └── test-environment.js
```

---

## أدوات الاختبار

### Jest - إطار عمل الاختبارات

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright - اختبار E2E

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// أفضل الممارسات
const setup = (jsx: React.ReactElement) => {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
};
```

---

## المساهمة في الاختبارات

### كتابة اختبار جديد

1. **اختر النوع المناسب** من الاختبارات حسب ما تريد اختباره
2. **اتبع التسمية القياسية** للملفات
3. **استخدم Data Test IDs** للعناصر التفاعلية
4. **اكتب اختبارات واضحة ومفهومة**
5. **تأكد من التغطية الشاملة**

### مثال: إضافة اختبار لمكون جديد

```typescript
// 1. إنشاء الملف
// tests/components/__tests__/NewComponent.test.tsx

import { render, screen } from '@testing-library/react';
import { NewComponent } from '@/components/NewComponent';

describe('NewComponent', () => {
  test('renders correctly', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const { user } = setup(<NewComponent />);
    const button = screen.getByTestId('action-button');
    
    await user.click(button);
    expect(screen.getByText('Action performed')).toBeInTheDocument();
  });
});
```

### مثال: إضافة اختبار E2E

```typescript
// 2. إنشاء ملف E2E
// tests/e2e/__tests__/new-feature.spec.ts

import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('user can access new feature', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('[data-testid="new-feature-link"]');
    await expect(page).toHaveURL('/new-feature');
    
    await expect(page.locator('[data-testid="feature-title"]')).toBeVisible();
  });
});
```

### إضافة بيانات اختبار

```typescript
// 3. إضافة fixtures في tests/utils/fixtures/
export const mockUser = {
  id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
};

export const mockCampaign = {
  id: 'campaign_123',
  name: 'Test Campaign',
  status: 'draft',
  budget: 1000,
};
```

---

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### خطأ "Cannot find module"

```bash
# تأكد من تكوين moduleNameMapping في Jest
# jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
};
```

#### مشاكل في اختبارات E2E

```bash
# تأكد من تشغيل التطبيق
npm run build
npm run start:test

# تحقق من تثبيت Playwright
npx playwright install --with-deps

# تشغيل مع debug
npm run test:e2e:debug
```

#### مشاكل في قاعدة البيانات

```bash
# إعادة إعداد قاعدة البيانات
npm run db:reset
npm run db:migrate

# التأكد من متغيرات البيئة
cp .env.example .env.test
```

### تسجيل الأخطاء

```typescript
// إضافة تسجيل مفصل للاختبارات
test('complex operation', async () => {
  console.log('Starting test...');
  
  try {
    // منطق الاختبار
    const result = await complexOperation();
    console.log('Operation completed', result);
    
    expect(result).toBeDefined();
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});
```

### تزايد سرعة الاختبارات

```bash
# تشغيل متوازي
npm test -- --maxWorkers=4

# تشغيل محدد
npm test -- --testNamePattern="fast"

# استخدام cache
npm test -- --cache
```

---

## معايير الجودة

### معايير التغطية

```bash
# فحص التغطية
npm run test:coverage

# التغطية المستهدفة
const COVERAGE_THRESHOLDS = {
  branches: 80,
  functions: 85,
  lines: 85,
  statements: 85,
};
```

### معايير الأداء

```typescript
const PERFORMANCE_THRESHOLDS = {
  apiResponse: 500,    // 500ms
  pageLoad: 3000,      // 3 seconds
  testExecution: 30000, // 30 seconds per test suite
};
```

### معايير الأمان

- لا توجد ثغرات عالية الخطورة
- جميع البيانات الحساسة مشفرة
- Rate limiting يعمل بشكل صحيح
- Headers الأمنية موجودة

---

## الدعم والمساعدة

### الروابط المفيدة

- [دليل Jest](https://jestjs.io/docs/getting-started)
- [دليل React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [دليل Playwright](https://playwright.dev/docs/intro)
- [أفضل ممارسات الاختبار](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### الحصول على المساعدة

- تحقق من هذا الدليل أولاً
- راجع ملف الاختبارات الموجود بالفعل
- اسأل في فريق التطوير
- أنشئ issue في GitHub للمشاكل التقنية

---

## تحديثات مستقبلية

### ميزات قادمة

- [ ] دعم للتطبيقات المتقدمة
- [ ] تحسين أداء الاختبارات
- [ ] إضافة اختبارات البصرية
- [ ] دمج أدوات مراقبة الأداء

### تحسينات مستمرة

- تحديث استراتيجية الاختبار حسب احتياجات المشروع
- إضافة اختبارات للميزات الجديدة
- تحسين سرعة وموثوقية الاختبارات
- تحديث التوثيق والأدوات

---

**ملاحظة**: هذا الدليل يتطور باستمرار. للمساهمة في تحسينه، قم بإنشاء Pull Request مع التحديثات المقترحة.