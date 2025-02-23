// LOACL Widget Loader
(function() {
  class LOACLWidget {
    constructor() {
      this.queue = [];
      this.initialized = false;
      this.iframe = null;
    }

    init(config) {
      if (this.initialized) return;
      
      // Create iframe
      this.iframe = document.createElement('iframe');
      
      // Set default styles
      this.iframe.style.border = 'none';
      this.iframe.style.background = 'transparent';
      this.iframe.allow = 'microphone';
      this.iframe.title = 'LOACL Chat Widget';

      // Handle different positioning
      if (config.position === 'inpage' && config.containerId) {
        // For in-page positioning
        const container = document.getElementById(config.containerId);
        if (container) {
          this.iframe.style.position = 'relative';
          this.iframe.style.width = '100%';
          this.iframe.style.height = '600px';
          
          // Build URL with parameters for in-page
          const params = new URLSearchParams({
            assistantId: config.assistantId,
            apiKey: config.apiKey,
            position: 'inpage',
            features: JSON.stringify(config.features || {}),
            styles: JSON.stringify(config.styles || {})
          });
          
          this.iframe.src = `${config.baseUrl}/widget/${config.assistantId}?${params.toString()}`;
          container.appendChild(this.iframe);
        } else {
          console.error('LOACL Widget: Container element not found:', config.containerId);
          return;
        }
      } else {
        // For floating positioning
        this.iframe.style.position = 'fixed';
        this.iframe.style.bottom = '20px';
        this.iframe.style.right = '20px';
        this.iframe.style.width = '400px';
        this.iframe.style.height = '600px';
        this.iframe.style.zIndex = '9999';
        
        // Build URL with parameters for floating
        const params = new URLSearchParams({
          assistantId: config.assistantId,
          apiKey: config.apiKey,
          position: 'floating',
          features: JSON.stringify(config.features || {}),
          styles: JSON.stringify(config.styles || {})
        });
        
        this.iframe.src = `${config.baseUrl}/widget/${config.assistantId}?${params.toString()}`;
        document.body.appendChild(this.iframe);
      }
      
      this.initialized = true;
      console.log('LOACL Widget: Initialized with position:', config.position);
    }
  }

  // Create global widget instance
  window.loaclWidget = new LOACLWidget();

  // Process any queued commands
  if (window.loacl && window.loacl.q) {
    window.loacl.q.forEach(args => {
      if (args[0] === 'init') {
        window.loaclWidget.init(args[1]);
      }
    });
  }
})(); 