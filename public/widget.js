(function() {
  console.log('LOACL Widget: Script loaded');

  // Configuration object to store widget settings
  let config = {
    assistantId: null,
    baseUrl: null,
    apiKey: null,
    position: 'right',
    features: {
      showFileUpload: true,
      showVoiceInput: true,
      showEmoji: true
    },
    customStyles: {}
  };

  // Queue to store commands before initialization
  let queue = [];
  let isInitialized = false;
  let iframeElement = null;

  // Function to process queued commands
  function processQueue() {
    console.log('LOACL Widget: Processing queue', queue);
    while (queue.length > 0) {
      const args = queue.shift();
      handleCommand(args);
    }
  }

  // Function to handle commands
  function handleCommand(args) {
    console.log('LOACL Widget: Handling command', args);
    const method = args[0];
    const params = args.slice(1);

    switch (method) {
      case 'init':
        init(params[0]);
        break;
      default:
        console.error('LOACL Widget: Unknown method', method);
    }
  }

  // Function to send message to iframe
  function sendMessageToIframe(message) {
    if (iframeElement && iframeElement.contentWindow) {
      iframeElement.contentWindow.postMessage(message, config.baseUrl);
    }
  }

  // Function to initialize the widget
  function init(options) {
    console.log('LOACL Widget: Initializing with options', options);
    
    if (isInitialized) {
      console.warn('LOACL Widget: Already initialized');
      return;
    }

    if (!options) {
      console.error('LOACL Widget: No options provided');
      return;
    }

    config = { ...config, ...options };
    console.log('LOACL Widget: Configuration', config);
    
    if (!config.assistantId) {
      console.error('LOACL Widget: assistantId is required');
      return;
    }

    if (!config.baseUrl) {
      console.error('LOACL Widget: baseUrl is required');
      return;
    }

    if (!config.apiKey) {
      console.error('LOACL Widget: apiKey is required');
      return;
    }

    try {
      // Create and append the iframe
      iframeElement = document.createElement('iframe');
      iframeElement.style.border = 'none';
      iframeElement.style.position = 'fixed';
      iframeElement.style.bottom = '20px';
      iframeElement.style[config.position] = '20px';
      iframeElement.style.width = '400px';
      iframeElement.style.height = '600px';
      iframeElement.style.zIndex = '9999';
      iframeElement.style.background = 'transparent';
      iframeElement.allow = 'microphone';
      iframeElement.title = 'LOACL Chat Widget';
      
      // Set the iframe source with the configuration
      const queryParams = new URLSearchParams({
        assistantId: config.assistantId,
        apiKey: config.apiKey,
        position: config.position,
        features: JSON.stringify(config.features),
        styles: JSON.stringify(config.customStyles)
      });
      
      const iframeSrc = `${config.baseUrl}/widget.html?${queryParams.toString()}`;
      console.log('LOACL Widget: Setting iframe src', iframeSrc);
      iframeElement.src = iframeSrc;
      
      // Append the iframe to the body
      document.body.appendChild(iframeElement);
      console.log('LOACL Widget: Iframe appended to body');

      // Handle messages from the iframe
      window.addEventListener('message', (event) => {
        // Verify the origin
        if (event.origin !== config.baseUrl) {
          console.warn('LOACL Widget: Message from unknown origin', event.origin);
          return;
        }

        console.log('LOACL Widget: Received message', event.data);

        // Handle different message types
        switch (event.data.type) {
          case 'ready':
            // Send initial configuration
            sendMessageToIframe({
              type: 'init',
              config: {
                assistantId: config.assistantId,
                apiKey: config.apiKey,
                features: config.features
              }
            });
            break;
          case 'resize':
            if (event.data.height) {
              iframeElement.style.height = `${event.data.height}px`;
            }
            break;
          case 'close':
            iframeElement.remove();
            break;
          // Add more message handlers as needed
        }
      });

      isInitialized = true;
      console.log('LOACL Widget: Initialization complete');
    } catch (error) {
      console.error('LOACL Widget: Error during initialization', error);
    }
  }

  // Create the initial queue handler
  const initialQueueHandler = function() {
    const args = Array.prototype.slice.call(arguments);
    (window.loacl.q = window.loacl.q || []).push(args);
  };

  // Save any existing queue
  const existingQueue = window.loacl && window.loacl.q ? window.loacl.q : [];

  // Function to handle commands
  function queueCommand() {
    const args = Array.prototype.slice.call(arguments);
    console.log('LOACL Widget: Received command', args);
    if (isInitialized) {
      handleCommand(args);
    } else {
      queue.push(args);
      processQueue();
    }
  }

  // Replace the queue handler with the actual implementation
  window.loacl = queueCommand;

  // Process any existing queue items
  if (existingQueue.length > 0) {
    console.log('LOACL Widget: Processing existing queue', existingQueue);
    existingQueue.forEach(args => queueCommand.apply(null, args));
  }
})(); 