# LOACL Chat Widget Examples

This directory contains examples of how to embed the LOACL Chat Widget in different ways. The examples demonstrate both in-page and floating widget implementations.

## Prerequisites

Before using the widget, you'll need:
1. A LOACL API key
2. A LOACL Assistant ID

You can obtain these from your LOACL dashboard.

## Quick Start

### 1. Floating Widget

To add a floating chat widget that appears in the bottom-right corner of your website:

```html
<script src="path/to/embed.js"></script>
<script>
    initLOACLWidget({
        position: 'floating',
        apiKey: 'YOUR_API_KEY',
        assistantId: 'YOUR_ASSISTANT_ID'
    });
</script>
```

### 2. In-page Widget

To embed the chat widget within a specific container on your page:

```html
<div id="my-chat-container"></div>

<script src="path/to/embed.js"></script>
<script>
    initLOACLWidget({
        position: 'inpage',
        containerId: 'my-chat-container',
        apiKey: 'YOUR_API_KEY',
        assistantId: 'YOUR_ASSISTANT_ID'
    });
</script>
```

## Example Files

1. `floating-example.html` - Demonstrates a floating chat widget
2. `inpage-example.html` - Demonstrates an in-page chat widget
3. `embed.js` - The main embed script that can be used on any website

## Configuration Options

The widget can be configured with the following options:

```javascript
{
    position: 'floating' | 'inpage',  // Widget position type
    containerId: string,             // Required for inpage widget
    apiKey: string,                 // Required: Your LOACL API key
    assistantId: string,            // Required: Your LOACL Assistant ID
    apiUrl: string,                // Required: Your LOACL API URL (e.g., 'http://localhost:5173')
    styles: {
        primary: string,           // Primary color (default: '#3B82F6')
        textPrimary: string,       // Primary text color (default: '#FFFFFF')
        background: string,        // Background color (default: '#FFFFFF')
        borderRadius: string       // Border radius (default: '0.5rem')
    }
}
```