// LOACL Chat Widget Embed Script
(function(w, d) {
    // Configuration object
    const config = {
        position: 'floating', // or 'inpage'
        containerId: '', // required for inpage widget
        apiKey: '', // LOACL API key
        assistantId: '', // LOACL Assistant ID
        apiUrl: 'http://localhost:8000', // LOACL Backend API URL (not frontend URL)
        styles: {
            primary: '#3B82F6', // blue-500
            textPrimary: '#FFFFFF',
            background: '#FFFFFF',
            borderRadius: '0.5rem',
        }
    };

    // Message handling
    let messageHistory = [];
    let currentStreamController = null;
    
    async function sendMessageToLOACL(message) {
        if (!config.apiKey || !config.assistantId) {
            console.error('API key and Assistant ID are required');
            return null;
        }

        try {
            // Cancel any existing stream
            if (currentStreamController) {
                currentStreamController.abort();
            }

            // Create a new AbortController for this stream
            currentStreamController = new AbortController();

            const response = await fetch(`${config.apiUrl}/api/v1/assistant-streaming/threads/stream?assistant_id=${config.assistantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config.apiKey,
                    'Accept': 'text/event-stream',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: message
                    }]
                }),
                signal: currentStreamController.signal
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            // Add user message to history
            messageHistory.push({ role: 'user', content: message });
            
            return response;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Stream was cancelled');
                return null;
            }
            console.error('Error sending message:', error);
            return null;
        }
    }

    // Function to process the stream and update UI
    async function processStream(response, messageElement) {
        try {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullMessage = '';
            let messageId = null;
            let currentEventType = null;
            let hasAssistantMessage = false;

            // Add initial typing indicator as a separate element
            const typingIndicator = d.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.textContent = 'Thinking...';
            messageElement.appendChild(typingIndicator);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last incomplete line in the buffer

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    // Handle event type
                    if (line.startsWith('event: ')) {
                        currentEventType = line.slice(7).trim();
                        continue;
                    }

                    // Handle data
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            console.log('Event:', currentEventType, 'Data:', data);
                            
                            switch (currentEventType) {
                                case 'thread.created':
                                    console.log('Thread created:', data.id);
                                    break;

                                case 'thread.message.created':
                                    if (data.role === 'assistant') {
                                        hasAssistantMessage = true;
                                        messageId = data.id;
                                        if (data.content && data.content[0]?.text?.value) {
                                            // Remove typing indicator
                                            const indicator = messageElement.querySelector('.typing-indicator');
                                            if (indicator) indicator.remove();
                                            
                                            fullMessage = data.content[0].text.value;
                                            const contentDiv = d.createElement('div');
                                            contentDiv.textContent = fullMessage;
                                            messageElement.appendChild(contentDiv);
                                        }
                                    }
                                    break;

                                case 'thread.message.delta':
                                    if (data.delta?.content && data.id === messageId) {
                                        const deltaContent = data.delta.content[0]?.text?.value;
                                        if (deltaContent) {
                                            // Remove typing indicator if still present
                                            const indicator = messageElement.querySelector('.typing-indicator');
                                            if (indicator) indicator.remove();
                                            
                                            fullMessage += deltaContent;
                                            // Update or create content div
                                            let contentDiv = messageElement.querySelector('.message-text');
                                            if (!contentDiv) {
                                                contentDiv = d.createElement('div');
                                                contentDiv.className = 'message-text';
                                                messageElement.appendChild(contentDiv);
                                            }
                                            contentDiv.textContent = fullMessage;
                                        }
                                    }
                                    break;

                                case 'thread.message.completed':
                                    if (data.role === 'assistant') {
                                        hasAssistantMessage = true;
                                        // Remove typing indicator if still present
                                        const indicator = messageElement.querySelector('.typing-indicator');
                                        if (indicator) indicator.remove();
                                        
                                        if (data.content && data.content[0]?.text?.value) {
                                            fullMessage = data.content[0].text.value;
                                            // Update or create content div
                                            let contentDiv = messageElement.querySelector('.message-text');
                                            if (!contentDiv) {
                                                contentDiv = d.createElement('div');
                                                contentDiv.className = 'message-text';
                                                messageElement.appendChild(contentDiv);
                                            }
                                            contentDiv.textContent = fullMessage;
                                        }
                                    }
                                    break;

                                case 'thread.run.completed':
                                    console.log('Run completed:', data.id);
                                    // Remove typing indicator if still present
                                    const indicator = messageElement.querySelector('.typing-indicator');
                                    if (indicator) indicator.remove();
                                    
                                    if (!hasAssistantMessage) {
                                        try {
                                            const messageResponse = await fetch(`${config.apiUrl}/api/v1/assistant-communication/threads/${data.thread_id}/messages?assistant_id=${config.assistantId}`, {
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-API-Key': config.apiKey,
                                                }
                                            });
                                            
                                            if (messageResponse.ok) {
                                                const messages = await messageResponse.json();
                                                const lastAssistantMessage = messages
                                                    .reverse()
                                                    .find(msg => msg.role === 'assistant');
                                                
                                                if (lastAssistantMessage && lastAssistantMessage.content && lastAssistantMessage.content[0]?.text?.value) {
                                                    fullMessage = lastAssistantMessage.content[0].text.value;
                                                    // Update or create content div
                                                    let contentDiv = messageElement.querySelector('.message-text');
                                                    if (!contentDiv) {
                                                        contentDiv = d.createElement('div');
                                                        contentDiv.className = 'message-text';
                                                        messageElement.appendChild(contentDiv);
                                                    }
                                                    contentDiv.textContent = fullMessage;
                                                    hasAssistantMessage = true;
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Error fetching message:', error);
                                            messageElement.textContent = 'Sorry, there was an error processing your message.';
                                        }
                                    }
                                    break;

                                case 'thread.run.failed':
                                    console.error('Run failed:', data.last_error);
                                    // Remove typing indicator if still present
                                    const failedIndicator = messageElement.querySelector('.typing-indicator');
                                    if (failedIndicator) failedIndicator.remove();
                                    
                                    const errorDiv = d.createElement('div');
                                    errorDiv.className = 'message-text error';
                                    errorDiv.textContent = 'Sorry, there was an error processing your message.';
                                    messageElement.appendChild(errorDiv);
                                    break;
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }

            // Add the complete message to history
            if (fullMessage) {
                messageHistory.push({ role: 'assistant', content: fullMessage });
            }
            return fullMessage;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Stream processing was cancelled');
                return null;
            }
            console.error('Error processing stream:', error);
            // Remove typing indicator if still present
            const indicator = messageElement.querySelector('.typing-indicator');
            if (indicator) indicator.remove();
            
            const errorDiv = d.createElement('div');
            errorDiv.className = 'message-text error';
            errorDiv.textContent = 'Sorry, there was an error processing your message.';
            messageElement.appendChild(errorDiv);
            return null;
        }
    }

    // Initialize function
    w.initLOACLWidget = function(userConfig) {
        // Validate required parameters
        if (!userConfig.apiKey || !userConfig.assistantId) {
            console.error('API key and Assistant ID are required');
            return;
        }

        // Merge configurations
        Object.assign(config, userConfig);

        // Load Tailwind CSS
        const tailwindScript = d.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        d.head.appendChild(tailwindScript);

        // Create container if needed
        let container;
        if (config.position === 'inpage') {
            if (!config.containerId) {
                console.error('Container ID is required for inpage widget');
                return;
            }
            container = d.getElementById(config.containerId);
            if (!container) {
                console.error('Container not found:', config.containerId);
                return;
            }
        } else {
            container = d.createElement('div');
            container.id = 'loacl-widget-container';
            d.body.appendChild(container);
        }

        // Add styles
        const style = d.createElement('style');
        style.textContent = `
            .loacl-widget-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            .loacl-widget {
                ${config.position === 'floating' ? `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 384px;
                    z-index: 1000;
                    display: none;
                ` : `
                    width: 100%;
                `}
            }
            .loacl-widget.open {
                display: block;
            }
            .message {
                margin-bottom: 1rem;
                padding: 0.75rem;
                border-radius: 0.5rem;
                max-width: 80%;
                line-height: 1.5;
            }
            .message-content {
                white-space: pre-wrap;
            }
            .user-message {
                background-color: #EFF6FF;
                margin-left: auto;
                text-align: right;
            }
            .assistant-message {
                background-color: #F3F4F6;
                margin-right: auto;
            }
            .typing-indicator {
                display: inline-block;
                padding: 0.5rem 0.75rem;
                background-color: #F3F4F6;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                color: #6B7280;
                font-style: italic;
                font-size: 0.875rem;
                margin-right: auto;
            }
            .error-message {
                color: #DC2626;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }
        `;
        d.head.appendChild(style);

        // Create widget HTML
        const createWidgetHTML = () => {
            const floatingButton = config.position === 'floating' ? `
                <button
                    id="loacl-widget-button"
                    class="loacl-widget-button bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
                    onclick="toggleLOACLWidget()"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            ` : '';

            const widgetHTML = `
                ${floatingButton}
                <div id="loacl-widget" class="loacl-widget bg-white rounded-lg shadow-xl ${config.position === 'inpage' ? '' : 'hidden'}">
                    <div class="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 class="font-semibold">LOACL Chat</h3>
                        ${config.position === 'floating' ? `
                            <button onclick="toggleLOACLWidget()" class="text-white hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <div id="loacl-messages" class="h-96 p-4 bg-gray-50 overflow-y-auto">
                        <div>
                            <div class="message assistant-message">Hello! How can I help you today?</div>
                        </div>
                    </div>
                    <div class="p-4 border-t">
                        <form id="loacl-message-form" class="flex space-x-2" onsubmit="return handleMessageSubmit(event)">
                            <input
                                type="text"
                                id="loacl-message-input"
                                placeholder="Type your message..."
                                class="flex-1 px-4 py-1.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />
                            <button
                                type="submit"
                                id="loacl-send-button"
                                class="bg-blue-500 text-white px-4 py-1.5 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </form>
                        <div id="loacl-error" class="error-message hidden"></div>
                    </div>
                </div>
            `;

            return widgetHTML;
        };

        // Add widget to container
        container.innerHTML = createWidgetHTML();

        // Add message handling
        w.handleMessageSubmit = async function(event) {
            event.preventDefault();
            const input = d.getElementById('loacl-message-input');
            const sendButton = d.getElementById('loacl-send-button');
            const errorDiv = d.getElementById('loacl-error');
            const messagesContainer = d.getElementById('loacl-messages');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Disable input and button while processing
            input.disabled = true;
            sendButton.disabled = true;
            errorDiv.classList.add('hidden');
            
            try {
                // Clear input
                input.value = '';

                // Add user message
                const userMessageDiv = d.createElement('div');
                userMessageDiv.className = 'message user-message message-content';
                userMessageDiv.textContent = message;
                messagesContainer.appendChild(userMessageDiv);

                // Add typing indicator
                const typingIndicator = d.createElement('div');
                typingIndicator.className = 'typing-indicator';
                typingIndicator.textContent = 'Thinking...';
                messagesContainer.appendChild(typingIndicator);

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Create assistant message div
                const assistantMessageDiv = d.createElement('div');
                assistantMessageDiv.className = 'message assistant-message message-content';
                assistantMessageDiv.textContent = '';

                // Send message to LOACL
                const response = await sendMessageToLOACL(message);
                
                if (response) {
                    // Remove typing indicator and add assistant message div
                    typingIndicator.remove();
                    messagesContainer.appendChild(assistantMessageDiv);

                    // Process the stream
                    await processStream(response, assistantMessageDiv);
                } else {
                    // Handle error
                    typingIndicator.remove();
                    errorDiv.textContent = 'Failed to send message. Please try again.';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error in message handling:', error);
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.classList.remove('hidden');
            } finally {
                // Re-enable input and button
                input.disabled = false;
                sendButton.disabled = false;
                input.focus();

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };

        // Add toggle function
        w.toggleLOACLWidget = function() {
            const widget = d.getElementById('loacl-widget');
            const button = d.getElementById('loacl-widget-button');
            
            if (config.position === 'floating') {
                if (widget.classList.contains('open')) {
                    widget.classList.remove('open');
                    button.style.display = 'block';
                } else {
                    widget.classList.add('open');
                    button.style.display = 'none';
                }
            }
        };
    };
})(window, document); 