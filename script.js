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
        let conversationContext = {
            company: '',
            marketing: '',
            challenges: '',
            duration: ''
        };
        // Keep track of message history for the LLM context
        let messageHistory = [];

        const SYSTEM_IDENTITY = `You are The Social Tiger’s AI Assistant. 
        CORE RULES (NON-NEGOTIABLE):
        - You must analyze and respond to what the user actually says.
        - You must NEVER ignore a user’s answer.
        - You must NEVER advance to the next question automatically without acknowledging the previous one.
        - You must mirror or acknowledge the user’s response before continuing.
        - You may only ask ONE question at a time.
        - You are NOT a form, survey, or scripted flow. Respond naturally and conversationally.
        
        UNIVERSAL HELP DETECTION:
        If the user asks "What do you do?", "How can you help?", or about services, you MUST:
        1. Explains: Social Tiger helps with LinkedIn organic growth, Warm/Cold Email marketing, and Website/AI Chatbot builds. (Focus on BENEFITS).
        2. IMMEDIATELY AFTER, ask: "Out of curiosity, what do you do, or what does your company do?"
        
        TONE & STYLE:
        - Human, professional, calm.
        - Helpful, not salesy.
        - Consultative and respectful.`;

        // Define the Qualification Flow
        function getSystemPrompt(state, userText) {
            let prompt = SYSTEM_IDENTITY + "\n\n";
            const lowerText = userText.toLowerCase();

            // Inject Known Context to ensure continuity
            if (conversationContext.company) prompt += `KNOWN CONTEXT - User's CompanyContext: ${conversationContext.company}.\n`;
            if (conversationContext.marketing) prompt += `KNOWN CONTEXT - User's MarketingMethod: ${conversationContext.marketing}.\n`;
            if (conversationContext.challenges) prompt += `KNOWN CONTEXT - User's Challenges: ${conversationContext.challenges}.\n`;

            // UNIVERSAL HELP DETECTION (Global Interrupt)
            if (lowerText.includes('what do you do') || lowerText.includes('how can you help') || lowerText.includes('services') || lowerText.includes('help my business')) {
                return prompt + `The user asked about services/help. 
                 1. Briefly explain Social Tiger's 3 core areas (LinkedIn growth, Email marketing, Website/AI) focusing on BENEFITS (revenue, authority, time-saving).
                 2. IMMEDIATELY AFTER, ask EXACTLY: "Out of curiosity, what do you do, or what does your company do?"
                 
                 Ignore the current state logic for this turn.`;
            }

            switch (state) {
                case 'GREETING':
                    return prompt + `The user has responded to your opening greeting: "${userText}".
                    1. Acknowledge their response warmly.
                    2. IMMEDIATELY transition to discovery by asking: "Out of curiosity, what do you do, or what does your company do?"`;

                case 'COMPANY':
                    return prompt + `The user just answered what their company does: "${userText}".
                    1. Acknowledge and mirror their response specifically (mention their industry/role).
                    2. Contextualize it briefly (industry, business type, role).
                    3. THEN ask: "Out of curiosity, what are you currently using for your marketing?"`;

                case 'MARKETING':
                    return prompt + `The user ("${conversationContext.company}") answered about their marketing: "${userText}".
                    1. Acknowledge and mirror their response.
                    2. Analyze their situation lightly given their industry.
                    3. THEN ask: "Is there anything you’d like to improve, or any challenges you’re encountering?"`;

                case 'CHALLENGES':
                    return prompt + `The user (Company: "${conversationContext.company}", Marketing: "${conversationContext.marketing}") answered about challenges: "${userText}".
                    1. Acknowledge and reflect their response.
                    2. Offer a relevant brief insight or observation.
                    3. THEN ask: "How long have these challenges been going on?"`;

                case 'DURATION':
                    return prompt + `The user answered how long: "${userText}".
                    1. Summarize their situation clearly and show understanding.
                    2. THEN ask EXACTLY: "Based on what you’ve shared, would you be opposed to a short, no-pressure meet-and-greet call to see if we could possibly support you?"`;

                case 'INVITE':
                    return prompt + `The user responded to the call invite: "${userText}".
                    
                    IF POSITIVE/OPEN (Yes, Sure, Maybe):
                    1. Acknowledge positively.
                    2. Share this link: https://calendly.com/socialtigermarketing/30min
                    3. Add light context (e.g., "to explore ideas...").

                    IF NEGATIVE/HESITANT (No, Busy, Pass):
                    1. Respect the response.
                    2. Say EXACTLY: "No problem at all — we understand it might not be a good time. Would you like some free marketing tips in the meantime?"`;

                case 'TIPS':
                    return prompt + `The user accepted free tips. Provide 2-3 practical, high-value marketing tips (LinkedIn or Email focus). Keep it helpful and consultative.`;

                case 'BOOKED':
                    return prompt + `The user has completed the flow. Be helpful if they ask further questions, but do not restart the flow.`;

                default:
                    return prompt + `Respond naturally.`;
            }
        }

        // State Transitions
        function advanceState(currentState, userText) {
            const lower = userText.toLowerCase();

            // Universal Interrupt: If asking about services, we effectively reset/start at COMPANY (since we ask "What do you do?" next)
            if (lower.includes('what do you do') || lower.includes('how can you help') || lower.includes('services')) {
                return 'COMPANY';
            }

            switch (currentState) {
                case 'GREETING': return 'COMPANY';
                case 'COMPANY': return 'MARKETING';
                case 'MARKETING': return 'CHALLENGES';
                case 'CHALLENGES': return 'DURATION';
                case 'DURATION': return 'INVITE';
                case 'INVITE':
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) return 'TIPS';
                    return 'BOOKED'; // For yes/link
                case 'TIPS': return 'BOOKED';
                case 'BOOKED': return 'BOOKED';
                default: return currentState;
            }
        }

        // Local Fallback Logic (Simulates the AI behavior for testing or if API fails)
        function getLocalFallbackResponse(state, userText) {
            const lower = userText.toLowerCase();

            // Universal Interrupt
            if (lower.includes('what do you do') || lower.includes('how can you help') || lower.includes('services')) {
                return "Social Tiger helps businesses with: \n1. LinkedIn Organic Growth (content & conversations). \n2. Warm & Cold Email Marketing (human, value-first). \n3. Website Builds & AI Chatbots.\n\nOut of curiosity, what do you do, or what does your company do?";
            }

            switch (state) {
                case 'GREETING':
                    return "Thanks for reaching out! To get a better sense of how we might help, what do you do, or what does your company do?";

                case 'COMPANY':
                    // Dynamic fallback using userText
                    return `Ah, "${userText}" sounds like an interesting space. It's always great to connect with text. Out of curiosity, what are you currently using for your marketing?`;

                case 'MARKETING':
                    return `I see. "${userText}" is a common approach. Is there anything you’d like to improve, or any challenges you’re encountering with it?`;

                case 'CHALLENGES':
                    return `I understand. Dealing with "${userText}" can certainly hold back growth. How long have these challenges been going on?`;

                case 'DURATION':
                    return "Got it. Based on what you’ve shared, would you be opposed to a short, no-pressure meet-and-greet call to see if we could possibly support you?";

                case 'INVITE':
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) {
                        return "No problem at all — we understand it might not be a good time. Would you like some free marketing tips in the meantime?";
                    }
                    return "Great. Here is the link: https://calendly.com/socialtigermarketing/30min \n\nTotally exploratory — if it’s helpful, great, and if not, no worries at all.";

                case 'TIPS':
                    return "Here are a few tips:\n1. Focus on problem-aware content, not just value props.\n2. Follow up consistently with value, not 'checking in'.\n3. relationships > automation.\n\nHope that helps!";

                default:
                    return "I'm listening. Tell me more.";
            }
        }

        // Append Message to Chat Window
        function appendMessage(text, sender) {
            const div = document.createElement('div');
            div.classList.add('chat-msg', sender);
            // Auto-link URLs
            div.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');
            chatbotBody.appendChild(div);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }

        // Send Message
        async function sendMessage() {
            const text = chatbotInput.value.trim();
            if (!text) return;

            // 1. Show User Message
            appendMessage(text, 'user');
            chatbotInput.value = '';

            // Update Conversation Link (Context Accumulation)
            // We capture context BEFORE advancing state, so we save 'what they just said' as the answer to 'previous state'
            if (chatState === 'COMPANY') conversationContext.company = text;
            if (chatState === 'MARKETING') conversationContext.marketing = text;
            if (chatState === 'CHALLENGES') conversationContext.challenges = text;
            if (chatState === 'DURATION') conversationContext.duration = text;

            // 2. Show Loading Indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('chat-msg', 'bot');
            loadingDiv.textContent = '...';
            chatbotBody.appendChild(loadingDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;

            try {
                // 3. Prepare Prompt & Update State
                const systemInstruction = getSystemPrompt(chatState, text);

                // Add to message history
                messageHistory.push({ role: 'user', content: text });

                // Keep history manageable - maybe last 10 messages + system
                // But for this stateless function, we probably just send the robust system prompt + history.
                // NOTE: Using a robust system prompt with "KNOWN CONTEXT" usually works better than raw history for guided flows, 
                // but let's send recent history to ensure "Natural" conversational continuity if the user references previous turns.

                const messagesToSend = [
                    { role: 'system', content: systemInstruction },
                    ...messageHistory.slice(-6) // Send last 6 turns for context
                ];

                // Update state for the next turn
                chatState = advanceState(chatState, text);

                // 4. Call API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messagesToSend
                    })
                });

                if (!response.ok) throw new Error('API Request Failed');

                const data = await response.json();

                // Remove Loading
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                // 5. Show Bot Response
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const aiResponse = data.choices[0].message.content;
                    appendMessage(aiResponse, 'bot');
                    messageHistory.push({ role: 'assistant', content: aiResponse });
                } else {
                    // Fallback
                    const fallback = getLocalFallbackResponse(chatState, text);
                    appendMessage(fallback, 'bot');
                    messageHistory.push({ role: 'assistant', content: fallback });
                }

            } catch (error) {
                console.error('Chatbot Error:', error);

                // Remove Loading
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                // Use Local Fallback
                const fallback = getLocalFallbackResponse(chatState, text);
                appendMessage(fallback, 'bot');
                messageHistory.push({ role: 'assistant', content: fallback });
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
