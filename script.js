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

        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
            if (!chatbotWindow.classList.contains('hidden') && !hasStarted) {
                hasStarted = true;
                sendMessage('Hello', true); // Auto-start trigger
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

        const SYSTEM_IDENTITY = `You are a consultative AI chatbot for Social Tiger Marketing. Your role is to qualify website visitors thoughtfully, provide genuine marketing value when asked, and build trust before suggesting a call. Never feel pushy or sales-driven. Ask one question at a time. Wait for the user’s response before continuing. Briefly acknowledge each response. Mirror one short phrase the user used. Add one short insight sentence max between questions. Do not repeat questions. do not force a booking.`;

        // Define the Qualification Flow
        function getSystemPrompt(state, userText) {
            let prompt = SYSTEM_IDENTITY + "\n\n";

            // INTERRUPT HANDLING
            const lowerText = userText.toLowerCase();
            if (lowerText.includes('what do you do') || lowerText.includes('how can you help') || lowerText.includes('services')) {
                return prompt + `The user has asked about services. IGNORE the current qualification flow for a moment.
                 Provide a value-first explanation of ONE relevant service (Organic LinkedIn Growth, Warm & Cold Email Marketing, or Website Build/AI Chatbot).
                 Do NOT list all of them. Pick the most relevant one or a general summary.
                 After looking at their input, if they seem unsure, ask if they'd like to continue with the previous topic.
                 Keep it brief.`;
            }

            switch (state) {
                case 'GREETING':
                    return prompt + `The user has responded to your greeting. 
                    Your goal is Step 1 - Current State.
                    Ask: "What are you currently using for your marketing?"
                    Acknowledge their greeting briefly first.`;

                case 'CURRENT_STATE':
                    return prompt + `The user just answered what they are using for marketing: "${userText}".
                    Step 1 Complete.
                    Task: 
                    1. Acknowledge their answer.
                    2. Mirror one phrase they used.
                    3. Add one short insight (e.g. "A lot of teams rely on this early on.")
                    4. Ask Step 2 Question: "What made you start looking for help with your marketing, or what challenges are you running into?"`;

                case 'PAIN':
                    return prompt + `The user just answered "What challenges...".
                    Step 2 Complete.
                    Task:
                    1. Reflect their challenge in their own words.
                    2. Normalize it briefly (e.g. "That’s a very common stage to hit.")
                    3. Ask Step 3 Question: "How long have these challenges been going on?"`;

                case 'TIMING':
                    return prompt + `The user just answered "How long...".
                    Step 3 Complete.
                    Task:
                    1. Acknowledge the time frame.
                    2. Add light context (e.g. "That’s usually when things start to feel frustrating or stagnant.")
                    3. Ask Step 4 Question: "What does success in marketing look like for you and your company?"`;

                case 'OUTCOME':
                    return prompt + `The user just answered "What does success look like...".
                    Step 4 Complete.
                    Task:
                    1. Mirror their definition of success.
                    2. TRANSITION: "From what you’ve shared, there are a few clear areas worth exploring."
                    3. Ask Step 5 Question: "Based on what you’ve shared, would you be opposed to a short meet and greet or connect call to see how we could possibly support you?"
                    If the answer is vague, ask one clarifying follow-up: "When you say 'better results', what would that look like in practice?"`;

                case 'INVITE':
                    return prompt + `The user responded to the call invite: "${userText}".
                    Step 5 Complete.
                    
                    IF THEY SAID YES/OPEN:
                    1. Respond warmly: "Great — no pressure at all. This would just be a short, informal conversation to see if there’s a fit."
                    2. Share this link EXACTLY: https://calendly.com/socialtigermarketing/30min
                    3. Say: "Totally exploratory — if it’s helpful, great, and if not, no worries at all."

                    IF THEY SAID NO/HESITANT:
                    1. Respond: "No problem at all — totally understand."
                    2. Ask: "Would you like a few marketing tips you can apply right away instead?"`;

                case 'TIPS':
                    return prompt + `The user is in the TIPS phase. User said: "${userText}".
                    If they want tips, provide 2-3 concise, high-level insights (no deep tactics).
                    Then ask if they have any other questions.`;

                case 'BOOKED':
                    return prompt + `The user has been given the booking link or declined it. The conversation is effectively qualified.
                    Respond simply and helpfully. Do NOT push for a meeting again.
                    Example: "Happy to help — feel free to ask anything else about marketing."`;

                default:
                    return prompt + `Respond naturally to the user's input: "${userText}". Keep it helpful and concise.`;
            }
        }

        // State Transitions
        function advanceState(currentState, userText) {
            const lower = userText.toLowerCase();
            switch (currentState) {
                case 'GREETING': return 'CURRENT_STATE';
                case 'CURRENT_STATE': return 'PAIN';
                case 'PAIN': return 'TIMING';
                case 'TIMING': return 'OUTCOME';
                case 'OUTCOME': return 'INVITE';
                case 'INVITE':
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) return 'TIPS';
                    return 'BOOKED'; // Transition to final state after link sharing
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

                const data = await response.json(); // Fix: Parse response

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
                return "We offer Organic LinkedIn Growth to build authority, Warm & Cold Email Marketing to reach decision-makers directly, and Website Builds with AI Chatbots (like me!) to capture leads 24/7. Shall we continue with your marketing goals?";
            }

            switch (state) {
                case 'GREETING': // Transitioning TO Step 1
                    return "Thanks for sharing. To start, what are you currently using for your marketing?";

                case 'CURRENT_STATE': // Transitioning TO Step 2
                    return "I see. A lot of teams rely on that early on. What made you start looking for help, or what challenges are you running into?";

                case 'PAIN': // Transitioning TO Step 3
                    return "That is a very common stage to hit. How long have these challenges been going on?";

                case 'TIMING': // Transitioning TO Step 4
                    return "That’s usually when things start to feel frustrating. What does success in marketing look like for you and your company?";

                case 'OUTCOME': // Transitioning TO Step 5
                    return "Understood. From what you’ve shared, there are a few clear areas worth exploring. Based on that, would you be opposed to a short meet and greet or connect call to see how we could possibly support you?";

                case 'INVITE': // Handling Invite Response
                    if (lower.includes('no') || lower.includes('pass') || lower.includes('busy')) {
                        return "No problem at all — totally understand. Would you like a few marketing tips you can apply right away instead?";
                    }
                    return "Great — no pressure at all. This would just be a short conversation to see if there’s a fit. \n\nYou can book here: https://calendly.com/socialtigermarketing/30min \n\nTotally exploratory!";

                case 'TIPS':
                    return "Sure! \n1. consistent posting builds trust. \n2. Engage with 5 prospects daily. \n3. Optimize your headline for clarity, not cleverness. \n\nAny other questions?";

                case 'BOOKED':
                    return "Happy to help — feel free to ask anything else about marketing.";

                default:
                    return "I see. Tell me more.";
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
