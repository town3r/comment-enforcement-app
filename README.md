# Comment Enforcement App

A Zendesk app that enforces comment requirements for agents working with tickets. This app ensures that agents cannot submit updates on unsolved tickets unless they include a comment that meets specified criteria.

## Overview

The Comment Enforcement App prevents agents from saving ticket updates without adding appropriate comments. It provides real-time feedback and blocks ticket saves when comment requirements aren't met, helping maintain consistent communication standards.

## Features

- **Comment Requirement Enforcement**: Blocks ticket saves when required comments are missing
- **Comment Type Control**: Enforces specific comment types (public replies vs. private notes)
- **Minimum Length Validation**: Ensures comments meet minimum character requirements
- **Real-time Feedback**: Provides live hints as agents type and interact with tickets
- **Auto-fix Option**: Automatically corrects comment types when configured
- **Solved Ticket Bypass**: Allows updates to solved tickets without comment requirements

## Configuration Options

The app supports several configuration modes through its settings:

### Mode Settings

- **`force_public`** (default): Requires a public reply comment
- **`force_private`**: Requires a private note comment
- **`require_any`**: Requires any type of comment
- **Default mode**: Falls back to requiring any comment

### Additional Settings

- **`minLength`**: Minimum character count for comments (default: 0)
- **`autofixType`**: Automatically correct comment type to match requirements (default: false)

## How It Works

### Real-time Hints

The app listens for the following events and provides immediate feedback:
- Comment type changes
- Comment text changes
- Ticket status changes

When agents interact with tickets, they receive sticky notifications indicating:
- Missing comment requirements
- Insufficient comment length
- Incorrect comment type

### Save Enforcement

When an agent attempts to save a ticket, the app:

1. **Checks ticket status**: Bypasses enforcement for solved tickets
2. **Validates comment presence**: Ensures a comment exists if required
3. **Validates comment length**: Checks minimum character requirements
4. **Validates comment type**: Ensures correct comment type (public/private)
5. **Auto-fixes if enabled**: Attempts to correct comment type automatically
6. **Blocks save if needed**: Prevents ticket save with descriptive error messages

## User Interface

The app displays a simple informational panel in the ticket sidebar:

```
Comment Enforcement is active for non-Solved tickets.
If you try to save without meeting the rule, you'll see a persistent error until fixed.
```

## Error Messages

The app provides clear error messages when requirements aren't met:

- **Missing comment**: "Please add a comment before saving this non-Solved ticket."
- **Insufficient length**: "Please enter at least {minLength} characters before saving."
- **Wrong comment type**: "This ticket requires a {Public reply/Private note} before saving."

## Technical Implementation

### Core Files

- **`assets/app.js`**: Main application logic with event handlers and validation
- **`assets/iframe.html`**: User interface template with styling

### Key Functions

- **`requiredRule()`**: Determines enforcement rules based on configuration
- **`updateHint()`**: Provides real-time feedback to agents
- **`ticket.save` handler**: Enforces requirements before allowing saves

### Dependencies

- Zendesk Apps Framework SDK 2.0
- Modern browser support for ES6+ features

## Installation

1. Package the app files according to Zendesk app structure
2. Upload to your Zendesk instance through the Admin interface
3. Configure the app settings based on your requirements
4. Install the app for agents who need comment enforcement

## Configuration Examples

### Force Public Replies Only
```json
{
  "mode": "force_public",
  "autofixType": true,
  "minLength": 10
}
```

### Require Any Comment with Minimum Length
```json
{
  "mode": "require_any",
  "minLength": 25
}
```

### Force Private Notes Only
```json
{
  "mode": "force_private",
  "autofixType": false,
  "minLength": 0
}
```

## Best Practices

1. **Start with warnings**: Consider using lower minimum lengths initially
2. **Train agents**: Ensure agents understand the requirements before enforcement
3. **Monitor impact**: Review ticket handling times after implementation
4. **Use auto-fix cautiously**: Enable `autofixType` only when comment type requirements are well-established

## Troubleshooting

### Common Issues

- **App not loading**: Verify all files are properly uploaded and manifest is correct
- **Settings not applying**: Check app configuration in Zendesk Admin
- **Enforcement not working**: Ensure app is installed for the appropriate agents

### Browser Compatibility

The app requires modern browsers that support:
- ES6+ JavaScript features
- Async/await syntax
- Promise handling

## Support

For issues or feature requests, refer to the app's repository or contact your Zendesk administrator.
