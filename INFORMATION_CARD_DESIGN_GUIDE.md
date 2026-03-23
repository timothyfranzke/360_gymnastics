# 360 Gymnastics Information Card Design System

## Overview
Comprehensive information card system designed to create cohesive, engaging, and conversion-optimized card experiences throughout the 360 Gymnastics platform. This system standardizes card design patterns while maintaining the professional yet energetic brand feel that builds parent trust and encourages enrollment decisions.

## Design Philosophy
Based on analysis of existing card implementations and expert design consultation, prioritizing:
- **Conversion optimization** for parent decision-making journeys
- **Visual hierarchy** that guides attention to key information
- **Trust and professionalism** for financial decisions
- **Energetic brand personality** aligned with youth gymnastics
- **Accessibility** and mobile-first responsive design
- **Consistency** across all card implementations

## Current Card Pattern Analysis

### **Existing Card Types**

#### 1. **Why Choose Us Cards** (Basic Information Cards)
- **Structure:** White background, colored icon circles, simple shadows
- **Content:** Icon + Title + Description
- **Style:** Clean, professional, subtle hover effects
- **Use Case:** Feature highlights, benefits, simple information

#### 2. **Featured Classes Cards** (Navigation Cards)
- **Structure:** Colored backgrounds with white icon circles
- **Content:** Icon + Class Name + Age Range
- **Style:** Bold, navigational, click-focused
- **Use Case:** Category navigation, class selection

#### 3. **Main Activities Cards** (Advanced Feature Cards)
- **Structure:** Dark backgrounds with glow effects and animations
- **Content:** Icon + Title + Description + Hover effects
- **Style:** Premium, interactive, sophisticated
- **Use Case:** Primary features, detailed explanations

## Unified Card Hierarchy

### **Primary Cards** (Hero-level Features)
**Purpose:** Critical enrollment decisions and primary features
```scss
.card-primary
```

**Visual Characteristics:**
- Background: White or `bg-indigo-800` with 50% opacity
- Enhanced shadows: `0 20px 25px -5px rgba(0, 0, 0, 0.3)`
- Strong hover lift: `translateY(-8px)`
- Glow effects and gradient overlays
- Premium animations and interactions

**Use Cases:**
- Enrollment CTAs
- Primary class features
- Major selling points
- Hero section cards

#### **Implementation Example:**
```html
<div class="card-primary bg-white p-8 rounded-xl group relative overflow-hidden">
  <!-- Card glow effect -->
  <div class="card-glow absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"></div>
  
  <div class="relative z-10">
    <div class="icon-container w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
      <svg class="h-8 w-8 text-white"><!-- icon --></svg>
    </div>
    <h3 class="text-xl font-bold mb-4 group-hover:text-cyan-600">Title</h3>
    <p class="text-gray-600 group-hover:text-gray-800">Description</p>
  </div>
  
  <!-- Hover indicator -->
  <div class="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-500"></div>
</div>
```

### **Secondary Cards** (Supporting Information)
**Purpose:** Supporting features and detailed information
```scss
.card-secondary
```

**Visual Characteristics:**
- Background: White with subtle colored accents
- Medium shadows: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- Moderate hover lift: `translateY(-4px)`
- Colored icon backgrounds
- Clean, professional appearance

**Use Cases:**
- Feature lists
- Benefits and advantages
- Secondary information
- Support content

#### **Implementation Example:**
```html
<div class="card-secondary bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
  <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
    <svg class="h-6 w-6 text-white"><!-- icon --></svg>
  </div>
  <h3 class="text-lg font-bold mb-2">Title</h3>
  <p class="text-gray-600">Description</p>
</div>
```

### **Tertiary Cards** (Navigational/Simple)
**Purpose:** Navigation, categories, and simple selections
```scss
.card-tertiary
```

**Visual Characteristics:**
- Background: Colored with brand blue system
- Light shadows: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- Subtle hover lift: `translateY(-2px)`
- White icon circles on colored backgrounds
- Focused on navigation

**Use Cases:**
- Class categories
- Navigation elements
- Simple selections
- Quick actions

#### **Implementation Example:**
```html
<div class="card-tertiary bg-blue-500 hover:bg-blue-600 rounded-xl p-6 text-center transition-all duration-300 text-white">
  <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
    <svg class="h-8 w-8 text-blue-500"><!-- icon --></svg>
  </div>
  <h3 class="text-xl font-bold mb-2">Class Name</h3>
  <p class="text-sm opacity-90">Age Range</p>
</div>
```

## Interactive States System

### **Hover States**
All cards include enhanced hover interactions:

#### **Primary Cards:**
```scss
&:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  
  .card-glow {
    opacity: 1;
  }
  
  .icon-container {
    transform: scale(1.1);
  }
  
  .hover-indicator {
    width: 100%;
  }
}
```

#### **Secondary Cards:**
```scss
&:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

#### **Tertiary Cards:**
```scss
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

### **Focus States**
Accessibility-focused keyboard navigation:
```scss
.card-primary:focus-within,
.card-secondary:focus-within,
.card-tertiary:focus-within {
  outline: 2px solid #0226ff;
  outline-offset: 2px;
  transform: translateY(-2px);
}
```

### **Active States**
Feedback for click interactions:
```scss
.card-primary:active,
.card-secondary:active,
.card-tertiary:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
```

### **Loading States**
For cards with dynamic content:
```scss
.card-loading {
  opacity: 0.7;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border: 2px solid #3b82f6;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    transform: translate(-50%, -50%);
  }
}
```

## Color System Integration

### **Using the Established Blue System**

#### **Primary Blue Implementation** (`#0226ff`)
```scss
// For trust-focused primary cards
.card-primary-blue {
  border-top: 4px solid #0226ff;
  
  .icon-container {
    background: linear-gradient(135deg, #0226ff 0%, #0119b3 100%);
  }
  
  &:hover {
    border-top-color: #0119b3;
  }
}
```

#### **Light Blue Implementation** (`#3b82f6`)
```scss
// For balanced, versatile cards
.card-light-blue {
  .icon-container {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  
  &:hover .title {
    color: #3b82f6;
  }
}
```

#### **Cyan Implementation** (`#06b6d4`)
```scss
// For modern, fresh features
.card-cyan {
  .icon-container {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  }
  
  .hover-indicator {
    background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
  }
}
```

#### **Blue-to-Blue Gradients** (From Color System)
```scss
// Featured classes gradient
.card-gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

// Energetic primary gradient
.card-gradient-energetic {
  background: linear-gradient(135deg, #3b82f6 0%, #0226ff 100%);
}

// Soft highlight gradient
.card-gradient-soft {
  background: linear-gradient(135deg, #0226ff 0%, rgba(66, 133, 244, 0.8) 100%);
}
```

### **Orange Accent Usage** (Following 80/15/5 Rule)
```scss
// 5% orange for critical CTAs only
.card-cta-accent {
  .cta-button {
    background: #fc7900;
    
    &:hover {
      background: #e66a00;
    }
  }
}
```

## Typography System

### **Card Headings**
```scss
.card-title-primary {
  font-size: 1.25rem; // text-xl
  font-weight: 700;   // font-bold
  line-height: 1.2;
  margin-bottom: 1rem;
}

.card-title-secondary {
  font-size: 1.125rem; // text-lg
  font-weight: 700;    // font-bold
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.card-title-tertiary {
  font-size: 1rem;     // text-base
  font-weight: 600;    // font-semibold
  line-height: 1.4;
  margin-bottom: 0.5rem;
}
```

### **Card Descriptions**
```scss
.card-description {
  color: #6b7280;      // text-gray-500
  font-size: 0.875rem; // text-sm
  line-height: 1.5;
  margin-bottom: 0;
}

.card-description-light {
  color: #9ca3af;      // text-gray-400 (for dark backgrounds)
}
```

## Spacing and Layout

### **Card Padding System**
```scss
.card-padding-sm {
  padding: 1rem;       // p-4
}

.card-padding-md {
  padding: 1.5rem;     // p-6 (standard)
}

.card-padding-lg {
  padding: 2rem;       // p-8
}
```

### **Grid Layouts**
```scss
// Mobile-first responsive grids
.cards-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.cards-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.cards-grid-4 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Animation System

### **Entrance Animations**
```scss
// Staggered card animations
.card-entrance {
  opacity: 0;
  transform: translateY(30px);
  animation: cardFadeInUp 0.6s ease-out forwards;
}

@keyframes cardFadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Stagger delays
.card-entrance:nth-child(1) { animation-delay: 0ms; }
.card-entrance:nth-child(2) { animation-delay: 100ms; }
.card-entrance:nth-child(3) { animation-delay: 200ms; }
.card-entrance:nth-child(4) { animation-delay: 300ms; }
```

### **Enhanced Effects**
```scss
// Card glow effect for primary cards
.card-glow {
  background: radial-gradient(circle at center, rgba(34, 211, 238, 0.15), transparent 70%);
  filter: blur(20px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

// Icon shimmer effect
.icon-shimmer::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-primary:hover .icon-shimmer::before {
  opacity: 1;
}
```

## Accessibility Features

### **Keyboard Navigation**
```scss
.card-interactive {
  cursor: pointer;
  
  &:focus {
    outline: 2px solid #0226ff;
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
}
```

### **Screen Reader Support**
```html
<!-- Proper semantic structure -->
<div class="card-primary" role="article" tabindex="0">
  <h3 class="card-title" id="card-title-1">Card Title</h3>
  <p class="card-description" aria-describedby="card-title-1">Description</p>
</div>

<!-- For navigational cards -->
<a class="card-tertiary" href="/classes" aria-label="View Beginner Preschool classes for ages 4-5.99 years">
  <div class="card-content">
    <h3>Beginner Preschool</h3>
    <p>Ages 4-5.99yrs</p>
  </div>
</a>
```

### **Reduced Motion Support**
```scss
@media (prefers-reduced-motion: reduce) {
  .card-primary,
  .card-secondary,
  .card-tertiary {
    transition: none;
    animation: none;
    
    &:hover {
      transform: none;
    }
  }
  
  .card-glow,
  .floating-shapes,
  .decorative-bubbles {
    animation: none;
    display: none;
  }
}
```

## Mobile Optimization

### **Touch Targets**
```scss
.card-interactive {
  min-height: 48px; // Minimum touch target
  touch-action: manipulation;
}

.card-primary {
  min-height: 120px; // Adequate touch area for primary actions
}
```

### **Mobile-Specific Adjustments**
```scss
@media (max-width: 768px) {
  .card-primary {
    padding: 1.5rem; // Reduced padding on mobile
    
    &:hover {
      transform: translateY(-4px); // Reduced hover lift
    }
  }
  
  .card-glow,
  .floating-shapes {
    display: none; // Remove complex effects on mobile
  }
  
  .cards-grid-4 {
    grid-template-columns: 1fr; // Single column on mobile
    gap: 1rem;
  }
}
```

## Reusable Card Variants

### **1. Feature Highlight Card**
```html
<div class="card-secondary feature-highlight">
  <div class="icon-container w-12 h-12 rounded-full bg-blue-500 mb-4">
    <svg class="h-6 w-6 text-white"><!-- icon --></svg>
  </div>
  <h3 class="text-lg font-bold mb-2">Safe Environment</h3>
  <p class="text-gray-600">Fully supervised with certified instructors</p>
</div>
```

### **2. Class Navigation Card**
```html
<a href="/classes/beginner-preschool" class="card-tertiary bg-blue-500 hover:bg-blue-600 text-white">
  <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
    <svg class="h-8 w-8 text-blue-500"><!-- icon --></svg>
  </div>
  <h3 class="text-xl font-bold mb-2">Beginner Preschool</h3>
  <p class="text-sm opacity-90">Ages 4-5.99yrs</p>
</a>
```

### **3. Premium Feature Card**
```html
<div class="card-primary bg-indigo-800 bg-opacity-50 text-white group">
  <div class="card-glow absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"></div>
  
  <div class="relative z-10">
    <div class="icon-container w-10 h-10 rounded-lg bg-white bg-opacity-10 mb-4">
      <svg class="h-6 w-6 text-cyan-400"><!-- icon --></svg>
    </div>
    <h4 class="text-lg font-bold mb-4 group-hover:text-cyan-300">Expert Instruction</h4>
    <p class="text-gray-300 group-hover:text-white">Professional coaches with years of experience</p>
  </div>
  
  <div class="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-500"></div>
</div>
```

### **4. Information Summary Card**
```html
<div class="card-secondary bg-white border border-gray-200">
  <div class="flex items-start space-x-4">
    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <svg class="h-4 w-4 text-white"><!-- checkmark --></svg>
    </div>
    <div>
      <h4 class="font-semibold mb-1">Age-Appropriate Classes</h4>
      <p class="text-sm text-gray-600">Classes designed specifically for each developmental stage</p>
    </div>
  </div>
</div>
```

### **5. Call-to-Action Card**
```html
<div class="card-primary bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-center">
  <div class="mb-6">
    <svg class="h-12 w-12 mx-auto mb-4 text-white"><!-- icon --></svg>
    <h3 class="text-xl font-bold mb-2">Ready to Start?</h3>
    <p class="opacity-90">Join hundreds of satisfied families</p>
  </div>
  <a href="/enroll" class="btn-primary bg-white text-blue-600 hover:bg-gray-50">
    <span class="btn-text">Enroll Today</span>
  </a>
</div>
```

## Implementation Guidelines

### **CSS Architecture**
```scss
// Base card styles
.card-base {
  border-radius: 0.75rem; // rounded-xl
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

// Card hierarchy extends base
.card-primary {
  @extend .card-base;
  // Primary specific styles
}

.card-secondary {
  @extend .card-base;
  // Secondary specific styles
}

.card-tertiary {
  @extend .card-base;
  // Tertiary specific styles
}
```

### **Component Structure**
```typescript
// Angular component interface
interface CardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor?: string;
  type: 'primary' | 'secondary' | 'tertiary';
  link?: string;
  ctaText?: string;
}
```

### **Best Practices**

#### **Do:**
- Use consistent spacing throughout all cards
- Maintain proper contrast ratios for accessibility
- Include hover and focus states for all interactive cards
- Implement staggered animations for card groups
- Use semantic HTML structure
- Follow the established blue color system
- Test on mobile devices for touch interactions

#### **Don't:**
- Mix different card styles within the same section
- Use orange except for critical enrollment CTAs (5% rule)
- Forget to include loading states for dynamic content
- Overcomplicate animations on mobile devices
- Skip accessibility testing
- Use conflicting gradients or color combinations

### **Testing Recommendations**
1. **A/B Test Card Variants:** Compare different card styles for conversion rates
2. **Mobile Usability:** Test touch interactions and responsive behavior
3. **Accessibility Audit:** Screen reader compatibility and keyboard navigation
4. **Performance:** Monitor animation performance on lower-end devices
5. **Color Contrast:** Verify all text meets WCAG guidelines

## Migration Strategy

### **Phase 1: Standardize Existing Cards**
1. Update why-choose-us component to use secondary card system
2. Enhance feature-classes with tertiary card standards
3. Refine main-activities with primary card guidelines

### **Phase 2: Implement New Variants**
1. Create reusable card components
2. Build shared SCSS classes
3. Update documentation and examples

### **Phase 3: Optimize and Test**
1. A/B test new card designs
2. Gather user feedback
3. Refine based on conversion data

This information card design system provides a comprehensive framework for creating cohesive, conversion-optimized card experiences that build parent trust and encourage enrollment decisions while maintaining the energetic gymnastics brand personality.