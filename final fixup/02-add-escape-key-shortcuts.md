# Add Escape Key Handler to Keyboard Shortcuts Modal

## Problem
When the Keyboard Shortcuts Guide modal is open (triggered by pressing `?`), pressing the Escape key doesn't close it. Users have to click outside the modal or use the X button.

## Expected Behavior
Pressing Escape should close the modal, following standard UI conventions.

## Files to Modify

### Primary File: Keyboard Shortcuts Guide Modal
Location: Likely `src/components/Modals/KeyboardShortcutsGuide.tsx`

## Solution

### Step 1: Add Escape Key Event Listener

Add a `useEffect` hook to listen for Escape key presses:

```typescript
// In KeyboardShortcutsGuide.tsx

import { useEffect } from 'react';

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsGuide = ({ isOpen, onClose }: KeyboardShortcutsGuideProps) => {
  
  // NEW: Add Escape key listener
  useEffect(() => {
    if (!isOpen) return; // Only listen when modal is open
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      {/* Modal content */}
    </div>
  );
};
```

### Step 2: Ensure Modal Receives Props Correctly

Verify the modal is receiving `isOpen` and `onClose` props:

```typescript
// In parent component (likely App.tsx or Layout.tsx)

const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

// In keyboard handler
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === '?') {
      e.preventDefault();
      setIsShortcutsOpen(true);
    }
  };
  
  window.addEventListener('keypress', handleKeyPress);
  return () => window.removeEventListener('keypress', handleKeyPress);
}, []);

return (
  <>
    {/* Other components */}
    <KeyboardShortcutsGuide 
      isOpen={isShortcutsOpen}
      onClose={() => setIsShortcutsOpen(false)}
    />
  </>
);
```

### Step 3: Alternative - Use React Hook

If you have a custom modal hook, add Escape handling there:

```typescript
// In hooks/useModal.ts

export const useModal = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
};

// Then in KeyboardShortcutsGuide:
const modal = useModal();

// Triggered by ? key:
if (e.key === '?') {
  modal.open();
}
```

## Testing

After the fix, test these scenarios:

1. Press `?` key → Modal opens ✓
2. Press `Escape` → Modal closes ✓ (NEW)
3. Click outside modal → Modal closes ✓ (existing)
4. Click X button → Modal closes ✓ (existing)
5. Open modal, press `Escape`, open again → Works correctly ✓

## Additional Improvements (Optional)

### Focus Management
Add focus trap to keep Tab key within modal:

```typescript
useEffect(() => {
  if (!isOpen) return;
  
  // Focus first focusable element
  const modal = modalRef.current;
  const focusable = modal?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusable && focusable.length > 0) {
    (focusable[0] as HTMLElement).focus();
  }
}, [isOpen]);
```

### Prevent Body Scroll
Stop background scrolling when modal is open:

```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);
```

## Success Criteria

- [ ] Escape key closes the modal
- [ ] Modal can be reopened after Escape close
- [ ] Other close methods still work (click outside, X button)
- [ ] No console errors
- [ ] Event listeners properly cleaned up

## Notes

- This is a **SHOULD-FIX** before launch - improves UX
- Standard modal behavior - users expect Escape to work
- Small fix (10-15 lines of code)
- Estimated time: 10 minutes
- Priority: MEDIUM

---

**Implementation Guide for Claude Code:**

1. Locate `KeyboardShortcutsGuide.tsx` (or similar modal component)
2. Add `useEffect` hook with Escape key listener
3. Ensure `isOpen` and `onClose` props exist
4. Add cleanup function to remove listener
5. Test: Open modal with `?`, close with `Escape`
6. Commit with message: "feat: Add Escape key handler to shortcuts modal"
