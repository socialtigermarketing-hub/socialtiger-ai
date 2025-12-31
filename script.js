document.addEventListener('DOMContentLoaded', () => {

    // Mobile Navigation Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger to X
            const spans = mobileBtn.querySelectorAll('span');
            spans[0].style.transform = navLinks.classList.contains('active')
                ? 'rotate(45deg) translate(5px, 5px)'
                : 'none';
            spans[1].style.opacity = navLinks.classList.contains('active')
                ? '0'
                : '1';
            spans[2].style.transform = navLinks.classList.contains('active')
                ? 'rotate(-45deg) translate(5px, -5px)'
                : 'none';
        });
    }

    // Smooth Scrolling & Close Mobile Menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    // Reset hamburger icon
                    const spans = mobileBtn.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Chatbot Widget Logic
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');

    if (chatbotToggle && chatbotWindow && chatbotClose) {
        let hasStarted = false;

        // Customize the opening message here (Fast Load)
        const OPENING_MESSAGE = "Hi, I’m The Social Tiger’s AI Assistant. How can I assist you today?";

        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
            if (!chatbotWindow.classList.contains('hidden') && !hasStarted) {
                hasStarted = true;
                // Directly append the opening message without API call
                appendMessage(OPENING_MESSAGE, 'bot');
            }
        });

        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.add('hidden');
        });

        // Chatbot API Integration
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotSend = document.getElementById('chatbot-send');
        const chatbotBody = document.querySelector('.chatbot-body');
        const API_URL = 'https://magenta-fairy-2a3006.netlify.app/.netlify/functions/chat';

        // Chatbot State Management
        let chatState = 'GREETING'; // Initial state
        let context = {}; // Store user responses

        const SYSTEM_IDENTITY = `You are The Social Tiger’s AI Assistant. Your goal is to understand the visitor’s marketing situation, provide helpful insights, and ONLY invite them to a short call if it feels appropriate.
        
        IMPORTANT BEHAVIOR:
        - You are NOT a form or survey. Respond naturally.
        - Never blindly ask the next question.
        - Only ask ONE question at a time.
        - If the user asks something, answer it fully before asking anything else.
        - Always acknowledge the user’s response before continuing.
        - Do NOT repeat the opening message.`;

        // Define the Qualification Flow
        function getSystemPrompt(state, userText) {
            let prompt = SYSTEM_IDENTITY + "\n\n";

            // INTERRUPT HANDLING
            const lowerText = userText.toLowerCase();
            if (lowerText.includes('what do you do') || lowerText.includes('how can you help') || lowerText.includes('services')) {
                return prompt + `The user has asked about services. IGNORE the current qualification flow for a moment.
                 Explain clearly and simply that Social Tiger helps in 3 main areas:
                 1. LinkedIn organic growth (ghostwritten content, strategic commenting, inbound conversations).
                 2. Warm and cold email marketing (value-first outreach to increase Revenue).
                 3. Website builds or upgrades with AI chatbot integration (to handle inbound inquiries).
                 
                 Explain BENEFITS, not features.
                 After explaining, ask if they would like to continue talking about their marketing goals.`;
            }

            switch (state) {
                case 'GREETING':
                    return prompt + `The user has responded to your opening "How can I assist you?".
                    Respond directly to their intent. Do not force questions immediately.
                    If it makes sense to transition to qualification, ask: "To get a better sense, what are you currently doing for marketing?"`;

                case 'CURRENT_STATE':
                    return prompt + `The user just answered what they are using for marketing: "${userText}".
                    1. Quickly acknowledge what they said.
                    2. Provide a relevant short insight or tip about that channel.
                    3. THEN ask: "What challenges or frustrations are you experiencing with it?"`;

                case 'PAIN':
                    return prompt + `The user just answered their challenges: "${userText}".
                    1. Briefly acknowledge and enable them (e.g., "That makes sense").
                    2. Provide a short observation.
                    3. THEN ask: "How long have those challenges been happening?"`;

                case 'TIMING':
                    return prompt + `The user just answered how long: "${userText}".
                    1. Acknowledge.
                    2. Provide a brief insight.
                    3. THEN ask: "What would success in marketing look like for you roughly?"`;

                case 'OUTCOME':
                    return prompt + `The user shared their goal: "${userText}".
                    1. Acknowledge.
                    2. Decide if a call is appropriate (usually yes if they have challenges).
                    3. Ask EXACTLY: "Would you be opposed to a short, no-pressure meet-and-greet call to see if we could possibly support you?"`;

                case 'INVITE':
                    return prompt + `The user responded to the call invite: "${userText}".
                    
                    IF THEY AGREE (YES/SURE/OK):
                    1. Say: "Great. Here is the link:"
                    2. Provide: https://calendly.com/socialtigermarketing/30min
                    3. Add: "Totally exploratory — if it’s helpful, great, and if not, no worries at all."

                    IF THEY DECLINE (NO/BUSY/PASS):
                    1. Respond respectfully: "No problem at all."
                    2. Offer generic value: "Would you like a few practical marketing tips you can apply right away?"`;

                case 'TIPS':
                    return prompt + `The user wants marketing tips. Provide 2-3 genuine, high-value practical tips for LinkedIn or Email marketing. Keep it punchy.`;

                case 'BOOKED':
                    return prompt + `The user has already been given the link or declined. Just be helpful and polite.`;

                default:
                    return prompt + `Respond naturally and helpfully to: "${userText}".`;
            }
        }

        // State Transitions
        function advanceState(currentState, userText) {
            const lower = userText.toLowerCase();

            // Allow user to stay in GREETING if they are just chatting, 
            // but if they answer the "what are you doing" question, move to CURRENT_STATE.
            // For simplicity in this linear-ish architecture, we advance on every turn 
            // unless the backend explicitly tells us otherwise (which it doesn't).
            // We'll stick to the "Happy Path" assumption but relying on the LLM to steer if the user goes off-track.

            switch (currentState) {
                case 'GREETING': return 'CURRENT_STATE';
                case 'CURRENT_STATE': return 'PAIN';
                case 'PAIN': return 'TIMING';
                case 'TIMING': return 'OUTCOME';
                case 'OUTCOME': return 'INVITE';
                case 'INVITE':
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) return 'TIPS';
                    return 'BOOKED';
                case 'TIPS': return 'BOOKED';
                case 'BOOKED': return 'BOOKED';
                default: return currentState;
            }
        }

        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender);

            const p = document.createElement('p');
            if (sender === 'bot') {
                const linkified = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--color-primary); text-decoration: underline;">$1</a>');
                p.innerHTML = linkified;
            } else {
                p.textContent = text;
            }

            messageDiv.appendChild(p);
            chatbotBody.appendChild(messageDiv);

            // Scroll to bottom
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }

        async function sendMessage(textOverride, isSilent = false) {
            const text = textOverride || chatbotInput.value.trim();
            if (!text) return;

            // Clear input
            if (!textOverride) chatbotInput.value = '';

            // User Message (Skip if silent auto-start)
            if (!isSilent) {
                appendMessage(text, 'user');
            }

            // Loading Indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot', 'loading');
            loadingDiv.innerHTML = '<p>Typing...</p>';
            chatbotBody.appendChild(loadingDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;

            // Prepare Prompt
            const prompt = getSystemPrompt(chatState, text);
            const nextState = advanceState(chatState, text);

            try {
                // Combine system instruction and user message for the backend
                // The backend expects specific OpenAI format: { messages: [...] }
                const payload = {
                    messages: [
                        { role: "system", content: prompt },
                        { role: "user", content: text }
                    ]
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                // Remove loading
                chatbotBody.removeChild(loadingDiv);

                // Bot Message (Handle OpenAI Response Structure)
                if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                    const reply = data.choices[0].message.content;
                    appendMessage(reply, 'bot');
                    chatState = nextState;
                } else if (data.reply) {
                    // Fallback for previous simple format if backend changes
                    appendMessage(data.reply, 'bot');
                    chatState = nextState;
                } else {
                    appendMessage("I received your message but didn't get a proper reply.", 'bot');
                }

            } catch (error) {
                console.error('Chatbot Error:', error);
                if (chatbotBody.contains(loadingDiv)) chatbotBody.removeChild(loadingDiv);

                // FALLBACK MODE: Simulate AI response if API fails (CORS/Network error)
                // This allows the user to test the flow even without backend connectivity.
                console.log("Switching to Local Fallback Mode due to error.");
                const fallbackReply = getLocalFallbackResponse(chatState, text);
                appendMessage(fallbackReply, 'bot');
                chatState = advanceState(chatState, text); // Advance state locally
            }
        }

        // Local Fallback Logic (Simulates what the AI would generate based on the System Prompt)
        function getLocalFallbackResponse(state, userText) {
            const lower = userText.toLowerCase();
            // Interrupt Check
            if (lower.includes('what do you do') || lower.includes('how can you help') || lower.includes('services')) {
                return "Social Tiger helps with 3 main things: \n1. LinkedIn Organic Growth (ghostwriting & engagement). \n2. Warm & Cold Email Marketing (revenue-focused). \n3. Website Builds + AI Chatbots (like me!). \n\nShall we get back to your marketing goals?";
            }

            switch (state) {
                case 'GREETING':
                    return "Glad to hear. To get a better sense, what are you currently doing for marketing?";

                case 'CURRENT_STATE':
                    return "Thanks for sharing. That's a common starting point. What specific challenges or frustrations are you experiencing with it?";

                case 'PAIN':
                    return "I hear you. That can be really tricky to scale. How long have you been dealing with those challenges?";

                case 'TIMING':
                    return "Got it. That's enough time to start feeling the drag. What would success in marketing look like for you ideally?";

                case 'OUTCOME':
                    return "That sounds like a great goal. Based on what you've shared, would you be opposed to a short, no-pressure meet-and-greet call to see if we could possibly support you?";

                case 'INVITE':
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) {
                        return "No problem at all — I understand. Would you like a few practical marketing tips you can apply right away?";
                    }
                    return "Great. Here is the link: https://calendly.com/socialtigermarketing/30min \n\nTotally exploratory — if it’s helpful, great, and if not, no worries at all.";

                case 'TIPS':
                    return "Here are a quick tips:\n1. Focus on one channel first until it works.\n2. Speak to problems, not just solutions.\n3. Consistent follow-ups win deals.\n\nLet me know if you need anything else!";

                case 'BOOKED':
                    return "Happy to help! Feel free to ask anything else.";

                default:
                    return "That's interesting. Tell me more.";
            }
        }

        if (chatbotSend && chatbotInput) {
            chatbotSend.addEventListener('click', sendMessage);
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    }

    // Lead Form Handler (Form removed)
    // const form = document.getElementById('leadForm');
    // ...

    // Scroll-based fade-in animation
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Slightly offset trigger point
        };

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Trigger once
                }
            });
        }, observerOptions);

        // Enable animations only if IO is supported
        document.body.classList.add('js-scroll-anim-enabled');

        // Observe all elements with the fade-in-up class
        document.querySelectorAll('.fade-in-up').forEach(element => {
            observer.observe(element);
        });
    }

});
