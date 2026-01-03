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

        // Chatbot State Management (Moved up to prevent hoisting issues)
        let chatState = 'GREETING'; // Initial state
        let hasAskedCompany = false;
        let conversationContext = {
            company: '',
            marketing: '',
            challenges: '',
            duration: ''
        };


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



        const SYSTEM_IDENTITY = `You are The Social Tiger’s AI Assistant.

Your role is to:
- Help visitors with marketing-related questions
- Understand their business and context
- Provide real, useful marketing insight
- Guide conversations naturally toward clarity and optional support

You must feel human, adaptive, and conversational, not scripted.

🧠 CORE BEHAVIOR RULES (CRITICAL)
- Always prioritize answering the user’s direct question first
- Never disregard what the user says
- Always acknowledge and mirror user responses before progressing
- You may pause the flow to answer questions, then resume naturally
- Never force the flow unnaturally
- Never give passive responses (e.g. “I’m listening”, “Tell me more”)
- Every response must add value or clarity
- If the user interrupts the flow with a question, answer it fully first, then naturally resume the previous step without skipping any questions.
- Never repeat a question you have already asked.
- Never skip a step in the process.

🧩 INITIAL GREETING
Always start with: “Hi, I’m The Social Tiger’s AI Assistant. How can I assist you today?”

🧩 FLOW OVERVIEW
Greeting -> Company -> Marketing -> Challenges -> Duration -> Invite -> Booked/Tips

`;

        // Check Intelligibility (The ONLY Validation)
        function validateIntelligibility(text) {
            if (!text || text.trim().length === 0) return false;

            const cleanText = text.trim();

            // 1. Check for only symbols
            if (/^[^a-zA-Z0-9]+$/.test(cleanText)) return false;

            // 2. Check for keyboard mashing/random characters
            // Heuristic: If it's long (>10 chars) and has no vowels, it's likely gibberish
            if (cleanText.length > 8 && !/[aeiouyAEIOUY]/.test(cleanText)) return false;

            // 3. Very short repetitive patterns (e.g. "aaaaa")
            if (/(.)\1{4,}/.test(cleanText)) return false;

            return true;
        }

        // Define the Logic
        function getSystemPrompt(state, userText) {
            let prompt = SYSTEM_IDENTITY + "\n\n";

            // Inject Known Context
            if (conversationContext.company) prompt += `KNOWN CONTEXT - User's Company: ${conversationContext.company}.\n`;
            if (conversationContext.marketing) prompt += `KNOWN CONTEXT - User's Marketing: ${conversationContext.marketing}.\n`;
            if (conversationContext.challenges) prompt += `KNOWN CONTEXT - User's Challenges: ${conversationContext.challenges}.\n`;
            if (conversationContext.duration) prompt += `KNOWN CONTEXT - User's Timeline: ${conversationContext.duration}.\n`;

            // STRICT LINEAR FLOW INSTRUCTIONS
            switch (state) {
                case 'GREETING':
                    // Current State: GREETING. Next State: COMPANY.
                    return prompt + `
The user has said hello.
1. Acknowledge the user warmly.
2. Ask THIS EXACT QUESTION next: "Before we dive in, can I ask — what do you do, or what does your company do?"
`;

                case 'COMPANY':
                    // Current State: COMPANY (User just answered validly). Next State: MARKETING.
                    return prompt + `
The user just explained what they do: "${userText}".
1. Acknowledge and mirror their response (contextualize their industry/business).
2. Ask THIS EXACT QUESTION next: "Out of curiosity, what are you currently using for your marketing?"
`;

                case 'MARKETING':
                    // Current State: MARKETING (User just answered). Next State: CHALLENGES.
                    return prompt + `
The user just explained their marketing: "${userText}".
1. Mirror and acknowledge.
2. Ask THIS EXACT QUESTION next: "Is there anything you’re hoping to improve, or any challenges you’re running into right now?"
`;

                case 'CHALLENGES':
                    // Current State: CHALLENGES (User just answered). Next State: DURATION.
                    return prompt + `
The user described their challenges: "${userText}".
1. Mirror and acknowledge with empathy.
2. Ask THIS EXACT QUESTION next: "How long has this been something you’ve been dealing with?"
`;

                case 'DURATION':
                    // Current State: DURATION (User just answered). Next State: INVITE.
                    return prompt + `
The user answered how long: "${userText}".
1. Summarize/Understand.
2. Ask THIS EXACT QUESTION next: "Based on what you’ve shared, would you be opposed to a short meet-and-greet or connect call to see how we could possibly support you?"
`;

                case 'INVITE':
                    // Current State: INVITE (User just answered Yes/No). Next State: BOOKED or TIPS.
                    return prompt + `
The user just responded to your invite request: "${userText}".

IF SENTIMENT IS POSITIVE (Yes, Sure, OK, Maybe):
- Respond with enthusiasm.
- Tell them to book a time continuously.
- Note: A link will be appended by the system, just provide the bridge text.

IF SENTIMENT IS NEGATIVE (No, Busy, Later, Pass):
- Say: "No problem at all — totally understand. Would you like some free marketing tips or ideas you can apply right away?"
`;

                case 'TIPS':
                    return prompt + `
The user wants marketing tips.
CRITICAL RULES:
- NEVER respond with filler like "I'm listening"
- ALWAYS provide 2–3 concrete, actionable marketing insights based on their industry/challenges.
- Tailor advice to "${conversationContext.company}".
- End with ONE focused follow-up question.
`;

                case 'BOOKED':
                    return prompt + `User has booked or is in the booking phase. Be helpful if they ask more, but do not restart the Q&A flow.`;

                default:
                    return prompt + `Current state: ${state}. Be helpful and professional.`;
            }
        }

        // State Transitions (STRICT LINEAR ADVANCEMENT)
        function advanceState(currentState, userText) {
            const lower = userText.toLowerCase();

            switch (currentState) {
                case 'GREETING':
                    return 'COMPANY';

                case 'COMPANY':
                    return 'MARKETING';

                case 'MARKETING':
                    return 'CHALLENGES';

                case 'CHALLENGES':
                    return 'DURATION';

                case 'DURATION':
                    return 'INVITE';

                case 'INVITE':
                    // Here we need simple sentiment analysis to distinguish BOOKED vs TIPS
                    // But we proceed EITHER WAY, never stay on INVITE.
                    const negativeWords = ['no', 'nope', 'pass', 'not now', 'busy', 'later', 'nah', 'don\'t', 'cant'];
                    const isNegative = negativeWords.some(w => lower.includes(w));

                    if (isNegative) return 'TIPS';
                    return 'BOOKED'; // Default to booked for "yes", "sure", or ambiguous positive flow

                case 'TIPS':
                    return 'BOOKED'; // Or END, effectively.

                case 'BOOKED':
                    return 'BOOKED';

                default:
                    return currentState;
            }
        }

        // Local Fallback (For when API is skipped or fails)
        function getLocalFallbackResponse(state, userText) {
            // Logic: Provide the question for the *Next* state, assuming intelligible input.
            const nextState = advanceState(state, userText);

            switch (nextState) {
                case 'COMPANY':
                    return "Before we dive in, can I ask — what do you do, or what does your company do?";

                case 'MARKETING':
                    return `Thanks for sharing. Out of curiosity, what are you currently using for your marketing?`;

                case 'CHALLENGES':
                    return `Got it. Is there anything you’re hoping to improve with that setup, or any challenges you’re running into right now?`;

                case 'DURATION':
                    return `I hear you. How long has this been something you’ve been dealing with?`;

                case 'INVITE':
                    return "Based on what you’ve shared, would you be opposed to a short meet-and-greet or connect call to see how we could possibly support you?";

                case 'TIPS':
                    return "No problem at all — totally understand. Would you like some free marketing tips or ideas you can apply right away?";

                case 'BOOKED':
                    // If coming from TIPS (wait, TIPS -> BOOKED is default flow?)
                    // If coming from INVITE (Yes)
                    return "Great! Please book some time with us here: https://calendly.com/socialtigermarketing/30min";

                default:
                    return "I'm here to help with any marketing questions you have.";
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

            // 0. Hard Guard: No Contact Info
            if (/(email|e-mail|phone|number|contact me)/i.test(text)) {
                appendMessage(
                    "Just to clarify — I don’t collect contact details here. I’m happy to help directly in this chat though.",
                    'bot'
                );
                chatbotInput.value = '';
                return;
            }

            // 1. Show User Message
            appendMessage(text, 'user');
            chatbotInput.value = '';

            // 2. Validate Intelligibility (Global Gatekeeper)
            if (!validateIntelligibility(text)) {
                setTimeout(() => {
                    appendMessage("Sorry — I didn’t quite understand you. Could you please input that again?", 'bot');
                }, 500);
                return; // STOP. Do not advance state. Do not hit API.
            }

            // 3. Show Loading Indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('chat-msg', 'bot');
            loadingDiv.textContent = '...';
            chatbotBody.appendChild(loadingDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;

            try {
                // 4. Prepare Prompt using CURRENT state
                const systemInstruction = getSystemPrompt(chatState, text);

                // CRITICAL FIX #1: VALID PAYLOAD ONLY (No History)
                const messagesToSend = [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: text }
                ];

                // 5. Call API
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

                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const aiResponse = data.choices[0].message.content;

                    // Show Bot Response
                    appendMessage(aiResponse, 'bot');

                    // CRITICAL FIX #2: ADVANCE STATE ONLY AFTER SUCCESS
                    // Update Context based on what the user JUST answered (captured in 'text')
                    if (chatState === 'COMPANY') conversationContext.company = text;
                    if (chatState === 'MARKETING') conversationContext.marketing = text;
                    if (chatState === 'CHALLENGES') conversationContext.challenges = text;
                    if (chatState === 'DURATION') conversationContext.duration = text;

                    // Calculate Next State
                    const nextState = advanceState(chatState, text);

                    // Update internal state
                    const prevState = chatState;
                    chatState = nextState;

                    // Post-Response Logic: Append Link if we just moved to BOOKED from INVITE
                    if (chatState === 'BOOKED' && prevState === 'INVITE') {
                        if (!aiResponse.includes('calendly.com')) {
                            appendMessage("Great! Please book some time with us here: https://calendly.com/socialtigermarketing/30min", 'bot');
                        }
                    }
                } else {
                    console.error("Invalid response structure:", data);
                    // If API returns success but no content, fallback gracefully?
                    // For now, let's treat it as an error to be safe or use fallback.
                    throw new Error('Invalid API Response Structure');
                }

            } catch (error) {
                console.error('Chatbot Error:', error);
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                // Do NOT advance state.
                // Do NOT repeat questions (User sees the error and can try again if they want, or we prompt them?)
                // The task says "The error ... must disappear". 
                // Since we fixed payload, we expect fewer errors. 
                // If an error DOES occur (network), we show a polite message.

                appendMessage("I'm having a bit of trouble connecting. Please try again in a moment.", 'bot');
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
