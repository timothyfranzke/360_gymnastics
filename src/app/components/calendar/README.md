# Calendar Component

A beautiful, responsive Angular calendar component that displays events from the Jackrabbit Class calendar API.

## Features

- 📅 Monthly calendar view with navigation
- 🎯 Event filtering (Open, Closed, Camps, etc.)
- 📱 Fully responsive design
- 🎨 Color-coded events by type
- 🔄 Auto-refresh and manual refresh
- 📋 Event registration links
- 🎛️ Compact mode for smaller spaces
- ⚡ Loading and error states
- 🎪 Event type legend

## Usage

### Basic Usage

```html
<app-calendar></app-calendar>
```

### With Options

```html
<app-calendar 
  [showHeader]="true"
  [compact]="false" 
  [maxEventsPerDay]="5">
</app-calendar>
```

### Compact Mode (for sidebars, widgets)

```html
<app-calendar 
  [compact]="true" 
  [maxEventsPerDay]="3"
  [showHeader]="false">
</app-calendar>
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showHeader` | boolean | `true` | Show/hide the calendar header with navigation |
| `compact` | boolean | `false` | Enable compact mode for smaller spaces |
| `maxEventsPerDay` | number | `3` | Maximum events to show per day (in compact mode) |

## Event Types & Colors

The calendar automatically categorizes and color-codes events:

- 🟢 **Open Gym** - Green
- 🟠 **Camps** - Orange  
- 🟣 **Clinics** - Purple
- 🔵 **Parties** - Blue
- 🔴 **Closed** - Red
- ⚪ **Other** - Gray

## API Integration

The component uses the `CalendarService` which connects to:
- **Endpoint**: `/api/calendar`
- **Parameters**: `month`, `year`, `status`
- **Response**: Structured calendar data with events

## Responsive Behavior

- **Desktop**: Full calendar with all features
- **Tablet**: Simplified layout, smaller text
- **Mobile**: Stacked header, condensed events

## Event Interaction

- **Click any event** → Opens registration popup
- **Hover events** → Shows tooltip with details
- **Filter events** → Use dropdown to filter by type

## Example Integration

```typescript
// In your component
import { CalendarComponent } from './components/calendar/calendar';

@Component({
  imports: [CalendarComponent],
  template: `
    <div class="calendar-section">
      <h2>Upcoming Events</h2>
      <app-calendar [compact]="false"></app-calendar>
    </div>
  `
})
export class MyComponent {}
```

## Customization

The component uses CSS custom properties for easy theming:

```scss
app-calendar {
  --calendar-primary-color: #667eea;
  --calendar-background: white;
  --calendar-text-color: #495057;
  --calendar-border-radius: 12px;
}
```

## Dependencies

- `CalendarService` - For API calls
- `CalendarResponse`, `CalendarEvent` - TypeScript interfaces
- Angular Common Module, Forms Module