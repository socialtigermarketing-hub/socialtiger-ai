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
        // Keep track of message history for the LLM context
        let messageHistory = [];

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

🧩 INITIAL GREETING
Always start with: “Hi, I’m The Social Tiger’s AI Assistant. How can I assist you today?”

🧭 ENTRY POINT (WHEN HELP IS IMPLIED)
If the user asks about marketing, growth, services, how you can help, or improving results:
- Ask: “Before we dive in, can I ask — what do you do, or what does your company do?”
- Wait for their response.

🧩 STEP 1 — WHAT THEY DO (ACKNOWLEDGE + CONTEXT)
After they explain what they do:
- Acknowledge and mirror their response
- Briefly contextualize their business (industry, role, company type)
- Then ask naturally: “Out of curiosity, what are you currently using for your marketing?”

🧩 STEP 2 — CURRENT MARKETING SETUP
After they explain their marketing:
- Mirror and acknowledge
- Ask: “Is there anything you’re hoping to improve, or any challenges you’re running into right now?”

🧩 STEP 3 — TIMELINE CONTEXT
After they describe challenges:
- Mirror and acknowledge
- Ask: “How long has this been something you’ve been dealing with?”

🧩 STEP 4 — OPTIONAL CONNECT CALL
Once timeline is understood (IMMEDATELY after):
- Ask: “Based on what you’ve shared, would you be opposed to a short meet-and-greet or connect call to see how we could possibly support you?”

If YES/Open:
- Acknowledge positively
- Share link: https://calendly.com/socialtigermarketing/30min
- Do not oversell.

If NO/Hesitant:
- Say: “No problem at all — totally understand. Would you like some free marketing tips or ideas you can apply right away?”

🧠 VALUE MODE (Only if they want tips)
- Acknowledge and mirror what they said
- Provide 2–3 actionable, specific insights tailored to their industry/challenges
- Ask only ONE focused follow-up question
- NO stalling, NO generic encouragement.

🧩 SERVICES EXPLANATION (Only if asked)
Social Tiger helps businesses create consistent inbound interest and remove friction from growth/scaling.
1. LinkedIn Organic Growth (Ghostwritten content, strategic commenting, DM management). Benefit: Visible & relevant without manual effort.
2. Warm & Cold Email Marketing (Value-first messaging, ongoing interest). Benefit: Predictable flow of opportunities.
3. Website Build/Upgrade + AI Chatbot (Clear positioning, conversion paths, instant inquiry handling). Benefit: Website works 24/7.
- Natural Transition: "Out of curiosity, what are you currently using for your marketing right now?"
`;

        // Check Intent Helper (Semantic Validation)
        function checkIntent(userText, state) {
            const lower = userText.toLowerCase();
            const words = lower.split(/\s+/);

            // Basic length check to filter empty/nonsense
            if (lower.length < 3) return false;

            switch (state) {
                case 'COMPANY':
                    // Look for business/role keywords or meaningful length
                    // Keywords: business, agency, company, we do, i run, saas, consulting, service, build, sell, provider, firm, store, shop
                    const companyKeywords = ['agency', 'company', 'consulting', 'saas', 'service', 'we', 'i run', 'owner', 'founder', 'coach', 'build', 'sell', 'provider', 'firm', 'store', 'shop'];
                    if (companyKeywords.some(kw => lower.includes(kw))) return true;
                    // If no keyword, accept if it has some substance (e.g. "Construction", "Law firm") - length > 3 is already checked.
                    // Let's be slightly stricter for vague short answers
                    // Accept single-word industry answers like "construction", "plumbing", etc.
                    if (words.length === 1 && lower.length >= 6) return true;

                    // Reject ultra-vague responses
                    if (words.length < 2 && lower.length < 5) return false;
                    return true;

                case 'MARKETING':
                    // Look for marketing channels/methods
                    const mktKeywords = ['email', 'linkedin', 'ads', 'facebook', 'instagram', 'google', 'seo', 'content', 'post', 'referral', 'word of mouth', 'outbound', 'inbound', 'call', 'dm', 'networking', 'website', 'nothing', 'none', 'unknown', 'manual'];
                    if (mktKeywords.some(kw => lower.includes(kw))) return true;
                    if (lower.includes('using') || lower.includes('try')) return true;
                    // Accept "Yes" if it implies confirmation of a previous guess, but usually we want specifics.
                    if (lower.length > 3) return true; // Fallback for specific tools not listed
                    return false;

                case 'CHALLENGES':
                    // Look for pain points
                    const painKeywords = ['lead', 'sales', 'growth', 'time', 'busy', 'consistent', 'enough', 'low', 'hard', 'struggle', 'result', 'quality', 'meeting', 'appointment', 'revenue', 'money', 'cost', 'expensive', 'slow', 'manual', 'scale', 'convert', 'close', 'response', 'reply'];
                    if (painKeywords.some(kw => lower.includes(kw))) return true;
                    if (lower.includes('not') || lower.includes('cant') || lower.includes('don\'t')) return true;
                    if (lower.length > 10) return true; // Longer explanation usually implies detail
                    return false;

                case 'DURATION':
                    // Look for time
                    const timeKeywords = ['month', 'year', 'week', 'day', 'time', 'long', 'since', 'start', 'ago', 'recent', 'forever', 'always', 'new', 'just'];
                    if (timeKeywords.some(kw => lower.includes(kw))) return true;
                    // Numbers often imply duration
                    if (/\d/.test(lower)) return true;
                    return true; // Duration can be vague "A while", assume acceptable if not empty

                default:
                    return true;
            }
        }

        // Define the Logic
        function getSystemPrompt(state, userText) {
            let prompt = SYSTEM_IDENTITY + "\n\n";
            const lowerText = userText.toLowerCase();

            // Inject Known Context
            if (conversationContext.company) prompt += `KNOWN CONTEXT - User's Company: ${conversationContext.company}.\n`;
            if (conversationContext.marketing) prompt += `KNOWN CONTEXT - User's Marketing: ${conversationContext.marketing}.\n`;
            if (conversationContext.challenges) prompt += `KNOWN CONTEXT - User's Challenges: ${conversationContext.challenges}.\n`;

            // UNIVERSAL INTERRUPT: Services
            if (
                lowerText.includes('what do you do') ||
                lowerText.includes('how can you help') ||
                (lowerText.includes('services') && !lowerText.includes('using'))
            ) {
                hasAskedCompany = true;
                return prompt + `
The user asked about services.

1. Briefly explain what Social Tiger does and the BENEFITS:
   - LinkedIn organic growth (ghostwritten content, strategic commenting, inbox management)
   - Warm & cold email marketing (predictable inbound interest)
   - Website builds/upgrades + AI chatbot (clear positioning, better conversions, instant inquiry handling)

2. THEN ask EXACTLY:
"Before we dive in, can I ask — what do you do, or what does your company do?"

IMPORTANT:
- Do NOT ask about marketing yet.
- This keeps the flow aligned with the COMPANY state.
`;
            }

            // CHECK INTENT (Feedback Loop)
            // If the user's answer is invalid for the CURRENT state (and they didn't ask a services question), provide a Fallback/Clarification prompt.
            // Note: We skip intent check for GREETING (any entry is fine) and TIPS/INVITE/BOOKED.
            const intentCheckNeeded = ['COMPANY', 'MARKETING', 'CHALLENGES', 'DURATION'].includes(state);
            if (intentCheckNeeded && !checkIntent(userText, state)) {
                return prompt + `The user gave a vague, short, or unclear response ("${userText}") to your question about ${state}.
                 1. Acknowledge the response politely but indicate you didn't quite catch that.
                 2. Re-ask the question for ${state} naturally.`;
            }

            switch (state) {
                case 'GREETING':
                    // 1. Direct Company Answer (e.g. "Construction")
                    if (checkIntent(userText, 'COMPANY')) {
                        return prompt + `User just stated their industry/company: "${userText}".
                        1. Acknowledge and mirror the company/industry (briefly contextualize).
                        2. Ask EXACTLY: "Out of curiosity, what are you currently using for your marketing?"`;
                    }

                    // 2. Implied Help (e.g. "I need leads", "Help with growth")
                    if (lowerText.includes('help') || lowerText.includes('marketing') || lowerText.includes('growth')) {
                        return prompt + `The user asked for help or mentioned marketing/growth: "${userText}".
                        1. Acknowledge.
                        2. Ask: "Before we dive in, can I ask — what do you do, or what does your company do?"`;
                    }

                    // 3. Generic Greeting
                    return prompt + `The user said hello or a generic greeting: "${userText}".
                    1. Be friendly.
                    2. Prompt them: "How can I help you with your marketing or growth today?"`;

                case 'COMPANY':
                    return prompt + `User just explained what they do: "${userText}".
                    1. Acknowledge and mirror (contextualize their industry/business).
                    2. Ask: "Out of curiosity, what are you currently using for your marketing?"`;

                case 'MARKETING':
                    return prompt + `User explained their marketing: "${userText}".
                    1. Mirror and acknowledge.
                    2. Ask: "Is there anything you’re hoping to improve, or any challenges you’re running into right now?"`;

                case 'CHALLENGES':
                    return prompt + `User described challenges: "${userText}".
                    1. Mirror and acknowledge.
                    2. Ask: "How long has this been something you’ve been dealing with?"`;

                case 'DURATION':
                    return prompt + `User answered how long: "${userText}".
                    1. Summarize/Understand.
                    2. Ask EXACTLY: "Based on what you’ve shared, would you be opposed to a short meet-and-greet or connect call to see how we could possibly support you?"`;

                case 'INVITE':
                    return prompt + `User responded to invite: "${userText}".
                    IF YES: Acknowledge & Link (https://calendly.com/socialtigermarketing/30min).
                    IF NO: Say "No problem at all — totally understand. Would you like some free marketing tips or ideas you can apply right away?"`;

                case 'TIPS':
                    return prompt + `
User wants marketing tips.

CRITICAL RULES:
- NEVER respond with filler like "I'm listening"
- ALWAYS provide 2–3 concrete, actionable marketing insights
- Tailor advice to the user's industry, role, or stated challenge
- Keep advice practical and specific
- End with ONE focused follow-up question
`;

                case 'BOOKED':
                    return prompt + `User is done. Be helpful if they ask more, but don't restart flow.`;

                default:
                    return SYSTEM_IDENTITY + `
You are The Social Tiger's AI Assistant.

If the state is unclear:
- Clearly explain how Social Tiger helps businesses grow using:
  • LinkedIn organic growth (ghostwritten content, strategic commenting, inbox management)
  • Warm & cold email marketing (predictable inbound interest)
  • Website builds/upgrades + AI chatbot (clear positioning, better conversions, instant inquiry handling)

Then ask:
"What do you do, or what does your company do?"
`;
            }
        }

        // State Transitions
        function advanceState(currentState, userText) {
            const lower = userText.toLowerCase();

            switch (currentState) {
                case 'GREETING':
                    return 'COMPANY';
                case 'COMPANY':
                    if (checkIntent(userText, 'COMPANY')) return 'MARKETING';
                    return 'COMPANY';
                case 'MARKETING':
                    if (checkIntent(userText, 'MARKETING')) return 'CHALLENGES';
                    return 'MARKETING';
                case 'CHALLENGES':
                    if (checkIntent(userText, 'CHALLENGES')) return 'DURATION';
                    return 'CHALLENGES';
                case 'DURATION':
                    if (checkIntent(userText, 'DURATION')) return 'INVITE'; // Usually duration is easy to pass
                    return 'DURATION'; // Or stay if really nonsense
                case 'INVITE':
                    if (
                        lower.includes('no') ||
                        lower.includes('not now') ||
                        lower.includes('maybe later') ||
                        lower.includes('pass')
                    ) return 'TIPS';

                    if (
                        lower.includes('yes') ||
                        lower.includes('sure') ||
                        lower.includes('sounds good') ||
                        lower.includes('happy to')
                    ) return 'BOOKED';

                    return 'INVITE'; // Unclear answer?
                case 'TIPS': return 'BOOKED';
                case 'BOOKED': return 'BOOKED';
                default: return currentState;
            }
        }

        // Local Fallback (For when API is skipped or fails)
        function getLocalFallbackResponse(state, userText) {
            const lowerContent = userText.toLowerCase();

            // Universal Interrupt
            if (
                lowerContent.includes('what do you do') ||
                lowerContent.includes('how can you help') ||
                lowerContent.includes('services')
            ) {
                return "Social Tiger helps businesses with LinkedIn Organic Growth, value-first email marketing, and high-converting websites with AI chatbots.\n\nBefore we dive in, can I ask — what do you do, or what does your company do?";
            }

            switch (state) {
                case 'GREETING':
                    return "To get started, could you tell me a little bit about what you or your company does?";

                case 'COMPANY':
                    return `Thanks for sharing. That's a great space to be in. Out of curiosity, what are you currently using for your marketing?`;

                case 'MARKETING':
                    return `Got it. Is there anything you’re hoping to improve with that setup, or any challenges you’re running into right now?`;

                case 'CHALLENGES':
                    return `I hear you. That can be frustrating. How long has this been something you’ve been dealing with?`;

                case 'DURATION':
                    return "Based on what you’ve shared, would you be opposed to a short meet-and-greet or connect call to see how we could possibly support you?";

                case 'INVITE':
                    if (lowerContent.includes('no') || lowerContent.includes('pass')) {
                        return "No problem at all — totally understand. Would you like some free marketing tips or ideas you can apply right away?";
                    }
                    return "Great! Here is the link: https://calendly.com/socialtigermarketing/30min";

                case 'TIPS':
                    return "Here are a few quick tips:\n1. Ensure your LinkedIn profile speaks to your client's problem, not just your skills.\n2. In emails, focus on 'problem-aware' questions.\n3. Be consistent.";

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

            // Update Conversation State (Context Accumulation)
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

            let systemInstruction = null;

            // If user gives company info immediately (while in GREETING), treat the turn as handled by COMPANY logic
            const effectiveState =
                (chatState === 'GREETING' && checkIntent(text, 'COMPANY'))
                    ? 'COMPANY'
                    : chatState;

            try {
                // 3. Prepare Prompt & Update State
                systemInstruction = getSystemPrompt(effectiveState, text);

                console.log("STATE:", chatState);
                console.log("SYSTEM PROMPT:", systemInstruction);

                // Add to history
                messageHistory.push({ role: 'user', content: text });

                const messagesToSend = [
                    { role: 'system', content: systemInstruction },
                    ...messageHistory.slice(-6)
                ];

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

                // Update state for the next turn AFTER response is generated
                // ONLY advance if the intent was valid
                if (checkIntent(text, effectiveState)) {
                    chatState = advanceState(effectiveState, text);
                }

                // Remove Loading
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                // 5. Show Bot Response
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const aiResponse = data.choices[0].message.content;
                    appendMessage(aiResponse, 'bot');
                    messageHistory.push({ role: 'assistant', content: aiResponse });
                } else {
                    const fallback = getLocalFallbackResponse(effectiveState, text);
                    appendMessage(fallback, 'bot');
                }

            } catch (error) {
                console.error('Chatbot Error:', error);
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                // Always fall back to state-aware logic
                const safeFallback = getLocalFallbackResponse(effectiveState, text);
                appendMessage(safeFallback, 'bot');
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
