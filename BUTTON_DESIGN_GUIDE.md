# 360 Gymnastics Button Design System

## Overview
Comprehensive button system designed for optimal conversion and user experience in the youth gymnastics industry.

## Design Philosophy
Based on expert design consultation, prioritizing:
- **Conversion optimization** for parent decision-making
- **Trust and professionalism** for financial decisions
- **Playful energy** aligned with gymnastics brand
- **Accessibility** and mobile optimization

## Button Variants

### Primary Buttons
**Solid Orange** - Optimized for highest conversion rates
```scss
.btn-primary // Standard primary actions
.btn-enroll  // Special enrollment CTA with enhanced styling
```

**Use for:** "Enroll Now", "Register", "Sign Up", "Get Started"

### Primary Blue
**Trust-focused actions**
```scss
.btn-primary-blue
```

**Use for:** "Contact Us", "Learn More", "Get Information"

### Light Blue (from Featured Classes)
**Balanced, versatile actions**
```scss
.btn-blue-light
```

**Use for:** Secondary CTAs, information buttons, versatile interactions

### Cyan (from Featured Classes)
**Fresh, modern actions**
```scss
.btn-cyan
```

**Use for:** Special programs, adult classes, modern features

### Secondary Buttons
**Outline style** for supporting actions
```scss
.btn-secondary           // Light backgrounds
.btn-secondary-dark      // Dark backgrounds
```

### Tertiary Buttons
**Text-only** for subtle actions
```scss
.btn-tertiary            // Dark text
.btn-tertiary-light      // Light text for dark backgrounds
```

### Specialized Buttons
```scss
.btn-success    // Green for positive actions
.btn-danger     // Red for warnings/deletions
.btn-icon       // Circular icon buttons
.btn-play       // Video play button with pulse animation
.btn-fab        // Floating action button
```

## Size Variants
- `.btn-xs` - Extra small
- `.btn-sm` - Small
- `.btn-md` - Medium (default)
- `.btn-lg` - Large
- `.btn-xl` - Extra large

## Key Features

### Conversion Optimization
- Solid colors over gradients (22% higher conversion)
- Enhanced typography with proper letter-spacing
- Subtle inner highlights for premium feel
- Optimized hover states for trust-building

### Accessibility
- Minimum 48px touch targets on mobile
- Enhanced focus rings with proper contrast
- Reduced motion support
- Screen reader friendly markup

### Interactive States
- **Hover:** Subtle lift and enhanced shadows
- **Active:** Press feedback with scale reduction
- **Focus:** Prominent outline for keyboard navigation
- **Loading:** Built-in spinner support
- **Disabled:** Clear visual feedback

### Mobile Optimization
- Larger touch targets
- Appropriate font sizes
- Optimized padding and spacing

## Implementation Examples

### Enrollment CTA (Hero Section)
```html
<a href="enrollment-link" class="btn-enroll">
  <span class="btn-text">Enroll Now</span>
</a>
```

### Information Actions
```html
<a routerLink="/contact" class="btn-primary-blue">
  <span class="btn-text">Contact Us</span>
</a>
```

### Standard Primary Actions
```html
<button class="btn-primary btn-lg">
  <span class="btn-text">View Classes</span>
</button>
```

### Loading States
```html
<button class="btn-primary loading">
  <div class="btn-spinner"></div>
  <span class="btn-text">Processing...</span>
</button>
```

## Brand Colors
- **Orange:** #fc7900 (energy, action, enrollment)
- **Orange Hover:** #e66a00
- **Blue Primary:** #0226ff (main brand blue, key actions)
- **Blue Primary Hover:** #0119b3
- **Blue Light:** #3b82f6 (balanced, versatile interactions - from featured classes)
- **Blue Light Hover:** #2563eb
- **Cyan:** #06b6d4 (fresh, modern features - from featured classes)
- **Cyan Hover:** #0891b2

## Best Practices

### Button Text
- Use action-oriented language
- Keep text concise and clear
- Avoid ALL CAPS (less approachable)
- Include context when helpful

### Layout
- Maintain consistent spacing
- Use appropriate sizes for hierarchy
- Group related actions together
- Ensure adequate touch targets on mobile

### A/B Testing Recommendations
1. Orange vs Blue primary buttons
2. Solid vs gradient backgrounds
3. Different CTA text variations
4. Button size and padding optimization

## Migration Notes
- All buttons now use centralized system
- Old gradient styles removed from component files
- Enhanced accessibility features added
- Mobile optimization improved

## Performance
- Optimized animations with hardware acceleration
- Reduced CSS bundle size through consolidation
- Improved loading states for better UX