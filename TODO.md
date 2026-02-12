# Implementation TODOs

## Interactive Tools (Templates & Tools Section)

### 1. ROI Calculator: How Much Time Could You Save?
**Route**: `/resources/templates-tools/roi-calculator`
**Type**: Interactive Tool
**Status**: Page exists (placeholder) - needs full implementation

**Requirements**:
- Interactive form with inputs for:
  - Process name/description
  - Hours spent per week on manual task
  - Hourly rate (for cost calculation)
  - Expected automation efficiency (percentage saved)
- Real-time calculation display showing:
  - Hours saved per week/month/year
  - Cost savings per week/month/year
  - Break-even time for automation investment
- Results visualization (charts/graphs)
- "Book Strategy Call" CTA with pre-filled context
- Option to download/email results
- No signup required to use

**Technical Approach**:
- Client-side React component with useState for form management
- Use recharts or similar for visualization
- localStorage to save calculations
- Optional: API route to log anonymous usage data

---

### 2. Automation Readiness Checklist for SMBs
**Route**: `/resources/templates-tools/automation-readiness-checklist`
**Type**: Checklist
**Status**: Page exists with content - needs interactivity

**Requirements**:
- Convert existing content into interactive checklist
- Sections (from current page):
  - Current Process Documentation (4 items)
  - Team Readiness (4 items)
  - Technical Infrastructure (4 items)
  - Success Metrics (4 items)
- Progress tracking (X of Y completed)
- Score calculation with readiness level:
  - 0-25%: Not Ready - Needs foundational work
  - 26-50%: Getting Started - Basic readiness
  - 51-75%: Ready to Automate - Good foundation
  - 76-100%: Automation-Ready - Excellent position
- Personalized recommendations based on score
- Export checklist as PDF
- "Book Strategy Call" CTA based on readiness level
- No signup required to use

**Technical Approach**:
- Client-side component with checkbox state management
- localStorage to persist progress
- Dynamic recommendations based on checked items
- Optional: jsPDF for PDF export

---

### 3. Process Mapping Template
**Route**: `/resources/templates-tools/process-mapping-template`
**Type**: Template
**Status**: Page exists (placeholder) - needs full implementation

**Requirements**:
- Interactive flowchart/diagram builder for documenting processes
- Elements to include:
  - Start/End points
  - Process steps (with description, owner, time estimate)
  - Decision points (if/then branches)
  - Input/output data
  - Pain points/bottlenecks (highlighting)
- Auto-detect automation opportunities based on:
  - Repetitive steps
  - Manual data entry
  - Time-consuming tasks
  - Error-prone processes
- Export options:
  - Download as image (PNG/SVG)
  - Export as JSON (for reimport)
  - Print view
- "Book Strategy Call" CTA with process context
- No signup required to use

**Technical Approach**:
- Use React Flow or similar flowchart library
- Client-side state management for diagram data
- localStorage to save/load diagrams
- Canvas-to-image export for downloads
- Optional: API route to save anonymized process patterns for insights

---

## Newsletter Signup Integration

All three tools should include:
- NewsletterSignup component at bottom of page
- Optional: Inline newsletter prompt after using tool ("Get more resources like this")

---

## General Technical Notes

**Shared Components**:
- Create `components/tools/` directory for tool-specific components
- Reusable form elements (sliders, number inputs, checkboxes)
- Consistent styling with existing site design
- Loading states and error handling

**Analytics**:
- Track tool usage (which tools, completion rates)
- Optional: Send results data to n8n webhook for lead scoring

**SEO**:
- Each tool page optimized for relevant keywords
- Structured data markup for interactive elements
- Social share images

**Performance**:
- All tools client-side (no backend required for core functionality)
- Lazy load heavy libraries (charts, flowchart)
- localStorage for persistence (no database needed)

---

## Priority Order

1. **Automation Readiness Checklist** - Content already exists, just needs interactivity
2. **ROI Calculator** - High value for lead generation, moderate complexity
3. **Process Mapping Template** - Most complex, requires flowchart library

---

## Future Enhancements

- AI-powered suggestions (connect to OpenRouter API)
- Save/share tools with unique URLs
- Compare results across time
- Integration with Calendly (pre-fill booking form with tool context)
- Multi-step wizards for complex tools
