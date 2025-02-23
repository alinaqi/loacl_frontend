# LOACL Frontend

A modern React-based frontend for the LOACL project, featuring an embeddable chat widget and comprehensive chat interface management system.

## Features

- Embeddable Chat Widget
- Multiple Embedding Options (iframe & JavaScript)
- In-page & Floating Widget Modes
- Real-time Chat Interface
- File Upload Support
- Voice Input Support
- Emoji Support
- Customizable Themes
- Responsive Design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Jest & React Testing Library
- ESLint & Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

### Building

To create a production build:

```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

### Linting and Formatting

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ChatWidget/     # Main chat widget component
│   ├── CodeSnippets/   # Code snippet display
│   └── Navigation/     # Navigation components
├── pages/              # Application pages
│   ├── demos/          # Demo pages
│   └── widget/         # Widget implementation
├── services/           # API services
│   ├── api.ts         # Base API configuration
│   └── chatbotApi.ts  # Chatbot-specific API
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── hooks/             # Custom React hooks
└── widgets/           # Widget implementations
    └── examples/      # Example implementations

public/
├── widget.js         # Widget loader script
└── widget.html       # Widget entry point
```

## Widget Implementation

### JavaScript Embed
```html
<script src="https://your-domain.com/widget.js"></script>
<script>
  window.loaclWidget.init({
    baseUrl: 'https://your-domain.com',
    assistantId: 'your-assistant-id',
    apiKey: 'your-api-key',
    position: 'floating', // or 'inpage'
    containerId: 'chat-widget-container' // required for 'inpage'
  });
</script>
```

### IFrame Embed
```html
<iframe
  src="https://your-domain.com/widget/your-assistant-id?apiKey=your-api-key"
  style="border: none; width: 400px; height: 600px;"
  allow="microphone"
  title="LOACL Chat Widget"
></iframe>
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under a Non-Commercial Use License - see the [LICENSE](LICENSE) file for details.

### Key License Points:
- Free for non-commercial use
- Commercial use is prohibited
- Attribution required
- Modifications allowed for non-commercial use only
