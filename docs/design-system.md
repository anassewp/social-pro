# Enhanced Design System Documentation
# توثيق نظام التصميم المتقدم

## نظرة عامة | Overview

تم تطوير نظام تصميم متقدم وشامل للواجهات يتضمن:

- **Design System موحد** باستخدام Tailwind CSS
- **مكونات UI محسنة** مع خصائص متقدمة
- **Animation و Micro-interactions** لتحسين تجربة المستخدم
- **Responsive Grid System** متجاوب لجميع الشاشات
- **Accessibility** متقدم للامتثال لمعايير إمكانية الوصول
- **Glass Morphism** و**Dark Mode** support

---

## 🎨 Design System | نظام التصميم

### الألوان | Colors

#### الألوان الأساسية
```css
--primary: hsl(217, 91%, 60%)        /* الأزرق الأساسي */
--secondary: hsl(240, 4.8%, 95.9%)   /* الرمادي الفاتح */
--background: hsl(0, 0%, 100%)       /* الخلفية البيضاء */
--foreground: hsl(222.2, 84%, 4.9%)  /* نص داكن */
```

#### ألوان الحالات
```css
--success: hsl(142, 76%, 36%)        /* أخضر - النجاح */
--warning: hsl(38, 92%, 50%)         /* برتقالي - التحذير */
--error: hsl(0, 84%, 60%)            /* أحمر - الخطأ */
--info: hsl(199, 89%, 48%)           /* أزرق فاتح - المعلومات */
```

#### التدرجات | Gradients
```css
--gradient-primary: linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 70%) 100%);
--gradient-secondary: linear-gradient(135deg, hsl(240, 4.8%, 95.9%) 0%, hsl(240, 4.8%, 90%) 100%);
--gradient-success: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 46%) 100%);
--gradient-warning: linear-gradient(135deg, hsl(38, 92%, 50%) 0%, hsl(38, 92%, 60%) 100%);
--gradient-error: linear-gradient(135deg, hsl(0, 84%, 60%) 0%, hsl(0, 84%, 70%) 100%);
```

### الخطوط | Typography

#### أحجام الخطوط
```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */
--font-size-5xl: 3rem       /* 48px */
```

#### العائلات | Font Families
```css
--font-sans: 'Cairo', 'Inter', 'ui-sans-serif', 'system-ui', sans-serif
--font-mono: 'Inter', 'JetBrains Mono', 'ui-monospace', 'monospace'
--font-display: 'Cairo', 'Inter', 'system-ui', 'sans-serif'
```

### المسافات | Spacing

```css
--space-0: 0
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### الانحناءات | Border Radius

```css
--radius-sm: 0.125rem     /* 2px */
--radius-md: 0.375rem     /* 6px */
--radius-lg: 0.5rem       /* 8px */
--radius-xl: 0.75rem      /* 12px */
--radius-2xl: 1rem        /* 16px */
--radius-3xl: 1.5rem      /* 24px */
--radius-full: 9999px     /* دائرة كاملة */
```

---

## 🧩 Enhanced Components | المكونات المحسنة

### Button Enhanced | زر محسن

```tsx
import { Button } from '@/components/ui/button-enhanced'

// الأنواع المختلفة
<Button variant="default">زر عادي</Button>
<Button variant="gradient">زر متدرج</Button>
<Button variant="glass">زر زجاجي</Button>
<Button variant="glow">زر مضيء</Button>
<Button variant="soft">زر ناعم</Button>

// أحجام مختلفة
<Button size="sm">صغير</Button>
<Button size="default">عادي</Button>
<Button size="lg">كبير</Button>
<Button size="xl">كبير جداً</Button>

// مع أيقونات
<Button leftIcon={<Icon />}>مع أيقونة يسار</Button>
<Button rightIcon={<Icon />}>مع أيقونة يمين</Button>

// حالة التحميل
<Button loading loadingText="جاري التحميل...">
  تحميل
</Button>

// حركات تفاعلية
<Button animation="bounce">مع حركة الارتداد</Button>
<Button animation="pulse">مع حركة النبض</Button>
<Button animation="spin">مع حركة الدوران</Button>
```

#### مكونات الأزرار المتقدمة

```tsx
import { ButtonGroup, FAB, IconButton } from '@/components/ui/button-enhanced'

// مجموعة أزرار
<ButtonGroup>
  <Button>الأول</Button>
  <Button>الثاني</Button>
  <Button>الثالث</Button>
</ButtonGroup>

// زر عائم
<FAB icon={<PlusIcon />} onClick={handleClick} />

// زر أيقونة
<IconButton icon={<SettingsIcon />} tooltip="الإعدادات" />
```

### Card Enhanced | بطاقة محسنة

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardActions, CardImage, CardBadge, CardStats, InteractiveCard } from '@/components/ui/card-enhanced'

// أنواع البطاقات
<Card variant="default">بطاقة عادية</Card>
<Card variant="elevated">بطاقة مرتفعة</Card>
<Card variant="glass">بطاقة زجاجية</Card>
<Card variant="gradient">بطاقة متدرجة</Card>
<Card variant="soft">بطاقة ناعمة</Card>

// مع صور
<Card>
  <CardImage src="/image.jpg" alt="صورة" overlay />
  <CardContent>
    <CardTitle level={2}>عنوان البطاقة</CardTitle>
    <CardDescription>وصف البطاقة</CardDescription>
  </CardContent>
</Card>

// مع شارات
<Card>
  <CardBadge variant="success" position="top-right">جديد</CardBadge>
  <CardContent>
    <CardTitle>بطاقة مع شارة</CardTitle>
  </CardContent>
</Card>

// مع إحصائيات
<Card>
  <CardHeader>
    <CardTitle>الإحصائيات</CardTitle>
  </CardHeader>
  <CardContent>
    <CardStats stats={[
      { label: "المستخدمين", value: "1,234", icon: <UsersIcon /> },
      { label: "المبيعات", value: "5,678", icon: <SalesIcon /> },
      { label: "الزيارات", value: "9,012", icon: <VisitsIcon /> },
      { label: "المعدل", value: "85%", change: { value: 12, type: "increase" } }
    ]} />
  </CardContent>
</Card>

// بطاقة تفاعلية
<InteractiveCard onClick={handleClick}>
  <CardContent>
    <CardTitle>بطاقة قابلة للنقر</CardTitle>
    <CardDescription>انقر للانتقال</CardDescription>
  </CardContent>
</InteractiveCard>
```

### Input Enhanced | إدخال محسن

```tsx
import { Input, Textarea, SearchInput, InputGroup } from '@/components/ui/input-enhanced'

// أنواع مختلفة
<Input variant="default" label="الاسم" placeholder="أدخل اسمك" />
<Input variant="filled" label="البريد الإلكتروني" />
<Input variant="glass" label="كلمة المرور" type="password" />
<Input variant="underline" label="رقم الهاتف" />

// حالات التحقق
<Input 
  state="error" 
  errorText="هذا الحقل مطلوب"
  label="اسم المستخدم"
/>
<Input 
  state="success" 
  successText="متوفر"
  label="اسم المستخدم"
/>

// مع أيقونات
<Input 
  leftIcon={<UserIcon />} 
  label="الاسم" 
/>
<Input 
  rightIcon={<SearchIcon />} 
  placeholder="بحث..."
/>

// قابل للمحو
<Input 
  clearable 
  label="البحث" 
  placeholder="أدخل نص البحث"
/>

// مع أزرار
<InputGroup>
  <Input placeholder="أدخل النص" />
  <Button icon={<SearchIcon />} />
</InputGroup>

// منطقة نص
<Textarea 
  label="الوصف" 
  placeholder="أدخل الوصف..." 
  rows={4} 
  resize="vertical"
/>

// بحث متقدم
<SearchInput 
  suggestions={["اقتراح 1", "اقتراح 2", "اقتراح 3"]}
  onSelectSuggestion={handleSelect}
  placeholder="ابحث..."
/>
```

### Badge Enhanced | شارة محسنة

```tsx
import { Badge, StatusBadge, NotificationBadge, RatingBadge, ProgressBadge, BadgeGroup } from '@/components/ui/badge-enhanced'

// أنواع الشارات
<Badge variant="default">عادي</Badge>
<Badge variant="success">نجاح</Badge>
<Badge variant="warning">تحذير</Badge>
<Badge variant="error">خطأ</Badge>
<Badge variant="info">معلومات</Badge>
<Badge variant="gradient">متدرج</Badge>
<Badge variant="glass">زجاجي</Badge>
<Badge variant="glow">مضيء</Badge>

// أحجام مختلفة
<Badge size="xs">XS</Badge>
<Badge size="sm">SM</Badge>
<Badge size="default">DEFAULT</Badge>
<Badge size="lg">LG</Badge>
<Badge size="xl">XL</Badge>

// شارات الحالة
<StatusBadge status="online" />
<StatusBadge status="offline" />
<StatusBadge status="away" />
<StatusBadge status="busy" />

// شارات الإشعارات
<NotificationBadge count={5} />
<NotificationBadge count={100} max={99} />

// شارات التقييم
<RatingBadge rating={4.5} showStars />
<RatingBadge rating={3.2} />

// شارات التقدم
<ProgressBadge progress={75} showPercentage />
<ProgressBadge progress={100} />

// مجموعة شارات
<BadgeGroup max={3} spacing="sm">
  <Badge>علامة 1</Badge>
  <Badge>علامة 2</Badge>
  <Badge>علامة 3</Badge>
  <Badge>علامة 4</Badge>
</BadgeGroup>
```

---

## 📐 Layout System | نظام التخطيط

### Grid System | نظام الشبكة

```tsx
import { Grid, ResponsiveGrid } from '@/components/ui/layout-system'

// شبكة عادية
<Grid cols={3} gap="lg">
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
  <div>عنصر 4</div>
  <div>عنصر 5</div>
  <div>عنصر 6</div>
</Grid>

// شبكة متجاوبة
<ResponsiveGrid 
  cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="md"
  minItemWidth="250px"
>
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
  <div>عنصر 4</div>
</ResponsiveGrid>

// شبكة تلقائية
<Grid cols="auto" gap="xl" minItemWidth="300px">
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Grid>
```

### Flex System | نظام المرونة

```tsx
import { Flex } from '@/components/ui/layout-system'

// تخطيط مرن أساسي
<Flex direction="row" justify="between" align="center" gap="lg">
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Flex>

// تخطيط عمودي
<Flex direction="col" gap="md">
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Flex>

// متجاوب
<Flex direction="row" responsive gap="md">
  <div className="flex-1">عنصر مرن</div>
  <div className="flex-1">عنصر مرن</div>
</Flex>
```

### Container System | نظام الحاويات

```tsx
import { Container, Stack, PageHeader, ContentArea } from '@/components/ui/layout-system'

// حاوية عادية
<Container size="lg">
  <div>محتوى الحاوية</div>
</Container>

// حاوية مملوءة
<Container size="fluid">
  <div>محتوى مملوء</div>
</Container>

// تخطيط متدرج
<Stack direction="vertical" gap="lg">
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Stack>

// رأس الصفحة
<PageHeader 
  title="عنوان الصفحة"
  description="وصف الصفحة"
  actions={<Button>إجراء</Button>}
  breadcrumb={<Breadcrumb />}
/>

// منطقة المحتوى
<ContentArea maxWidth="lg" padding="lg" center>
  <div>محتوى مركز</div>
</ContentArea>
```

---

## 🎬 Animation System | نظام الحركة

### Animation Components | مكونات الحركة

```tsx
import { AnimatedDiv, StaggerContainer } from '@/components/ui/animation-system'

// مكون متحرك
<AnimatedDiv variant="slideUp" transition="bounce" delay={0.2}>
  <Card>محتوى متحرك</Card>
</AnimatedDiv>

// قائمة متحركة
<StaggerContainer staggerDelay={0.1}>
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</StaggerContainer>

// فئات CSS للحركة
<div className="animate-fade-in animate-delay-300">
  محتوى مع حركة تأخير
</div>

<div className="hover-lift hover-glow">
  عنصر مع حركات تمرير
</div>
```

### Animation Variants | أنواع الحركة

```tsx
// أنواع الحركة المتاحة
const variants = {
  fade: "تلاشي",
  slideUp: "انزلاق لأعلى",
  slideDown: "انزلاق لأسفل", 
  slideLeft: "انزلاق لليسار",
  slideRight: "انزلاق لليمين",
  scale: "تكبير",
  bounceIn: "ارتداد دخول",
  flipIn: "قلب دخول",
  modalBackdrop: "خلفية نافذة",
  modalContent: "محتوى نافذة",
}
```

---

## 🎨 Glass Morphism | تأثير الزجاج

### Glass Effects | تأثيرات الزجاج

```tsx
<div className="glass-effect">
  <Card variant="glass">
    <CardContent>
      <CardTitle>تأثير الزجاج</CardTitle>
      <CardDescription>محتوى مع تأثير زجاجي</CardDescription>
    </CardContent>
  </Card>
</div>

// شدة مختلفة
<div className="glass-card">
  محتوى مع تأثير زجاجي قوي
</div>
```

---

## 🌙 Dark Mode | الوضع المظلم

النظام يدعم الوضع المظلم تلقائياً باستخدام class `"dark"` في HTML:

```css
.dark {
  --gradient-primary: linear-gradient(135deg, hsl(217, 91%, 65%) 0%, hsl(217, 91%, 75%) 100%);
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.3);
  /* المزيد من المتغيرات المظلمة */
}
```

---

## ♿ Accessibility | إمكانية الوصول

### المعايير المدعومة
- WCAG 2.1 AA compliance
- Focus indicators محسنة
- Color contrast ratios مضمونة
- Screen reader support
- Reduced motion support
- High contrast mode support

### الاستخدام
```tsx
<div className="sr-only">
  نص مخفي قارئ الشاشة فقط
</div>

<Button className="focus-ring">
  زر مع focus محسن
</Button>

<div className="hover-lift hover-scale">
  عنصر تفاعلي
</div>
```

---

## 📱 Responsive Design | التصميم المتجاوب

### نقاط التوقف
```css
sm: 640px   /* الهاتف */
md: 768px   /* الجهاز اللوحي */
lg: 1024px  /* الكمبيوتر المحمول */
xl: 1280px  /* الكمبيوتر المكتبي */
2xl: 1536px /* شاشة كبيرة */
```

### استخدام Grid المتجاوب
```tsx
<ResponsiveGrid 
  cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="md"
  minItemWidth="280px"
>
  {/* العناصر */}
</ResponsiveGrid>
```

### Typography المتجاوب
```tsx
<div className="text-fluid-base">
  نص يتكيف مع حجم الشاشة
</div>

<h1 className="heading-responsive">
  عنوان متجاوب
</h1>
```

---

## 🛠️ Utility Classes | الفئات المساعدة

### Hover Effects | تأثيرات التمرير
```css
.hover-lift      /* رفع عند التمرير */
.hover-scale     /* تكبير عند التمرير */
.hover-glow      /* إضاءة عند التمرير */
.hover-rotate    /* دوران عند التمرير */
```

### Animation Classes | فئات الحركة
```css
.animate-fade-in       /* دخول بتلاشي */
.animate-slide-up      /* دخول بانزلاق لأعلى */
.animate-scale-in      /* دخول بتكبير */
.animate-bounce-in     /* دخول بارتداد */
.animate-pulse         /* نبض مستمر */
.animate-spin          /* دوران مستمر */
```

### Glass Effects | تأثيرات الزجاج
```css
.glass-effect         /* تأثير زجاجي عادي */
.glass-effect-dark    /* تأثير زجاجي للوضع المظلم */
.glass-card           /* بطاقة زجاجية */
```

### Focus & Accessibility | التركيز وإمكانية الوصول
```css
.focus-ring           /* حلقة تركيز محسنة */
.sr-only              /* نص مخفي قارئ الشاشة */
.safe-top             /* مساحة آمنة أعلى الشاشة */
.safe-bottom          /* مساحة آمنة أسفل الشاشة */
```

---

## 🚀 Performance | الأداء

### تحسينات GPU
```css
.gpu-layer           /* تسريع GPU */
.will-change-transform  /* تحسين التحولات */
```

### Container Queries
```css
@container (min-width: 768px) {
  .container-md\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 📋 Usage Examples | أمثلة الاستخدام

### صفحة رئيسية محسنة
```tsx
import { PageHeader, Container, Grid, Card, Button } from '@/components/ui'

export default function HomePage() {
  return (
    <>
      <PageHeader 
        title="مرحباً بك في النظام"
        description="نظام إدارة متقدم وشامل"
        actions={<Button variant="gradient">ابدأ الآن</Button>}
      />
      
      <Container size="lg">
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="lg">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} variant="elevated" hover="lift">
              <CardContent>
                <CardTitle level={3}>البطاقة {item}</CardTitle>
                <CardDescription>وصف البطاقة {item}</CardDescription>
              </CardContent>
              <CardActions>
                <Button variant="soft">تفاصيل</Button>
                <Button variant="default">تحرير</Button>
              </CardActions>
            </Card>
          ))}
        </Grid>
      </Container>
    </>
  )
}
```

### نموذج محسن
```tsx
import { Input, Button, Card, CardContent } from '@/components/ui'

export default function ContactForm() {
  return (
    <Container size="md">
      <Card variant="glass">
        <CardContent>
          <form className="space-y-6">
            <Input 
              label="الاسم الكامل"
              placeholder="أدخل اسمك الكامل"
              variant="filled"
              leftIcon={<UserIcon />}
              required
            />
            
            <Input 
              label="البريد الإلكتروني"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              variant="glass"
              leftIcon={<EmailIcon />}
              required
            />
            
            <Textarea 
              label="الرسالة"
              placeholder="اكتب رسالتك هنا..."
              rows={4}
              resize="vertical"
            />
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline">إلغاء</Button>
              <Button variant="gradient" loadingText="جاري الإرسال">
                إرسال الرسالة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}
```

---

## 📖 File Structure | بنية الملفات

```
src/
├── components/
│   └── ui/                 # مكونات UI المحسنة
│       ├── button-enhanced.tsx
│       ├── card-enhanced.tsx
│       ├── input-enhanced.tsx
│       ├── badge-enhanced.tsx
│       ├── layout-system.tsx
│       ├── animation-system.tsx
│       └── index.ts
└── styles/
    ├── design-system.ts    # متغيرات النظام
    ├── design-system.css   # CSS محسن
    ├── advanced.css        # تأثيرات متقدمة
    └── globals.css         # ملف CSS الرئيسي
```

---

## 🔧 Configuration | الإعداد

### Tailwind Config
```typescript
// tailwind.config.ts - محدث بدعم جميع التحسينات
const config: Config = {
  content: [...],
  theme: {
    extend: {
      colors: { /* نظام الألوان المحسن */ },
      animation: { /* الحركات الجديدة */ },
      // المزيد من التحسينات
    }
  },
  plugins: [
    // plugins مخصصة للحركات والتأثيرات
  ]
}
```

---

## 📚 Documentation | التوثيق

هذا النظام مصمم ليكون:
- **قابل للتخصيص** بسهولة
- **متوافق** مع جميع المتصفحات
- **مستجيب** لجميع الشاشات  
- **ممتثل** لمعايير إمكانية الوصول
- **محسن للأداء** مع تسريع GPU

للاستفسارات أو المساعدة، راجع الكود المصدري أو اطلب الدعم الفني.