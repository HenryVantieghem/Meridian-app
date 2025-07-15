# Micro-Interactions

Delightful animations and interactions following Dieter Rams principles and calm technology design. Each component demonstrates purposeful design with smooth animations (300-500ms duration) and comprehensive accessibility support.

## Components

### 1. SwipeToDelegate

Physics-based swipe gestures with contextual delegate options and paper plane animations.

**Features:**

- Spring physics for natural movement
- Haptic feedback (when available)
- Orbit effect during drag
- Paper plane animation on delegation
- Contextual delegate options (Team, AI Assistant, Schedule, Archive)

**Usage:**

```tsx
import { SwipeToDelegate } from "@/components/micro-interactions";

<SwipeToDelegate onDelegate={(option) => console.log(option)}>
  <div className="p-4">{/* Email content */}</div>
</SwipeToDelegate>;
```

**Props:**

- `children`: React.ReactNode - Content to be swiped
- `onDelegate`: (option: string) => void - Callback when delegation occurs
- `disabled?: boolean` - Disable swipe functionality
- `onSnooze?`, `onArchive?`, `onDelete?` - Optional action callbacks

### 2. AIHover

Tooltip with sender context, relationship info, communication history, and tone analysis.

**Features:**

- Smooth fade-in/out animations
- Comprehensive sender context display
- Communication history and statistics
- Tone and urgency indicators
- Priority scoring visualization

**Usage:**

```tsx
import { AIHover } from "@/components/micro-interactions";

const senderContext = {
  name: "Sarah Chen",
  email: "sarah@example.com",
  company: "TechCorp Inc.",
  relationship: "colleague",
  communicationHistory: {
    totalEmails: 47,
    lastContact: "2 hours ago",
    averageResponseTime: "4.2h",
    tone: "positive",
    urgency: "medium",
  },
  recentTopics: ["Q4 Planning", "Product Launch"],
  priority: 0.85,
};

<AIHover senderContext={senderContext} showDetails>
  <div className="email-item">{/* Email content */}</div>
</AIHover>;
```

**Props:**

- `children`: React.ReactNode - Trigger element
- `senderContext`: SenderContext - Complete sender information
- `showDetails?: boolean` - Show detailed tooltip on hover
- `className?: string` - Additional styling

### 3. CompletionRitual

Celebration animation for completed tasks with constellation view and inspirational messaging.

**Features:**

- Constellation background animation
- Rotating trophy celebration
- Cycling inspirational messages
- Progress visualization
- Floating sparkle effects

**Usage:**

```tsx
import { CompletionRitual } from "@/components/micro-interactions";

<CompletionRitual
  isVisible={showRitual}
  completedTasks={8}
  totalTasks={10}
  onViewArchive={() => console.log("View archive")}
  onContinue={() => console.log("Continue")}
/>;
```

**Props:**

- `isVisible`: boolean - Show/hide the ritual
- `completedTasks`: number - Number of completed tasks
- `totalTasks`: number - Total number of tasks
- `onViewArchive?`: () => void - Archive view callback
- `onContinue?`: () => void - Continue callback

### 4. TimeZoneIndicator

Subtle visual cues for sender's local time with color-coded freshness indicators.

**Features:**

- Day/night status with sun/moon icons
- Color-coded freshness indicators
- Real-time timezone calculations
- Detailed tooltip on hover
- Compact peripheral vision version

**Usage:**

```tsx
import { TimeZoneIndicator, CompactTimeZoneIndicator } from '@/components/micro-interactions';

// Full indicator
<TimeZoneIndicator
  senderTimezone="America/Los_Angeles"
  userTimezone="America/New_York"
  emailTime={new Date()}
  showDetails
/>

// Compact version for peripheral vision
<CompactTimeZoneIndicator
  senderTimezone="Europe/London"
  userTimezone="America/New_York"
  emailTime={new Date()}
/>
```

**Props:**

- `senderTimezone`: string - Sender's timezone
- `userTimezone`: string - User's timezone
- `emailTime`: Date - When the email was sent
- `showDetails?: boolean` - Show detailed tooltip
- `className?: string` - Additional styling

## Animation Guidelines

All components follow these animation principles:

### Duration

- **Quick interactions**: 200-300ms
- **Standard transitions**: 300-500ms
- **Complex animations**: 500-800ms

### Easing

- **Spring physics**: Natural, bouncy movement
- **Ease-out**: Smooth deceleration
- **Linear**: Consistent motion (for continuous animations)

### Accessibility

- **Reduced motion**: Respects `prefers-reduced-motion`
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels and roles
- **Focus management**: Clear focus indicators

### Performance

- **GPU acceleration**: Uses `transform` and `opacity`
- **Debounced updates**: Prevents excessive re-renders
- **Efficient animations**: Minimal layout thrashing

## Design Principles

### Calm Technology

- Inform without demanding attention
- Stay in periphery until needed
- Smooth, non-jarring transitions

### Dieter Rams Principles

- **Less, but better**: Every animation serves a purpose
- **Good design is unobtrusive**: Subtle, not distracting
- **Good design is honest**: Clear, predictable behavior

### Swiss Design Minimalism

- Clean, precise, functional
- Luxury touches with gold accents
- Consistent spacing and typography

## Integration Examples

### Email List

```tsx
{
  emails.map((email) => (
    <SwipeToDelegate key={email.id} onDelegate={handleDelegate}>
      <AIHover senderContext={email.senderContext}>
        <div className="email-item">
          <TimeZoneIndicator
            senderTimezone={email.senderTimezone}
            userTimezone={userTimezone}
            emailTime={email.timestamp}
          />
          {/* Email content */}
        </div>
      </AIHover>
    </SwipeToDelegate>
  ));
}
```

### Dashboard

```tsx
{
  showCompletionRitual && (
    <CompletionRitual
      isVisible={true}
      completedTasks={completedTasks}
      totalTasks={totalTasks}
      onViewArchive={handleViewArchive}
      onContinue={handleContinue}
    />
  );
}
```

### Peripheral Indicators

```tsx
<div className="dashboard-stats">
  <CompactTimeZoneIndicator
    senderTimezone="Asia/Tokyo"
    userTimezone={userTimezone}
    emailTime={lastEmailTime}
  />
</div>
```

## Testing

### Animation Testing

- Verify smooth transitions on different devices
- Test with reduced motion preferences
- Ensure no layout shifts during animations

### Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- Focus management
- Color contrast compliance

### Performance Testing

- Monitor frame rates during animations
- Test on lower-end devices
- Verify memory usage with multiple instances

## Browser Support

- **Modern browsers**: Full support with hardware acceleration
- **Older browsers**: Graceful degradation
- **Mobile**: Touch gesture support
- **Tablet**: Responsive design with appropriate sizing

## Future Enhancements

- **Gesture customization**: User-defined swipe directions
- **Animation preferences**: User-configurable animation speeds
- **Advanced haptics**: Enhanced tactile feedback
- **Voice integration**: Voice-activated interactions
- **AI-powered animations**: Context-aware animation timing

## Contributing

When adding new micro-interactions:

1. Follow the established animation guidelines
2. Include comprehensive accessibility features
3. Add proper TypeScript types
4. Include usage examples
5. Test across different devices and browsers
6. Document any new props or behaviors
