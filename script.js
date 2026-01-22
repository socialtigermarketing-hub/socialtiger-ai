document.addEventListener('DOMContentLoaded', () => {

    // --- PRIVACY POLICY LOGIC ---
    const privacyLink = document.getElementById('privacy-policy-link');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('main');
            if (mainContent) {
                // Privacy Policy Content
                const privacyContent = `
                    <section class="section" style="padding: 4rem 0;">
                        <div class="container">
                            <h1>Privacy Notice – The Social Tiger</h1>
                            <p><strong>Last updated: Jan 2026</strong></p>
                            <br>

                            <h2>1. Who we are</h2>
                            <p>The Social Tiger (“we”, “us”, “our”) provides social media marketing and lead generation services for businesses.</p>
                            <p><strong>Company name:</strong> The Social Tiger<br>
                            <strong>Website:</strong> <a href="https://thesocialtiger.com">https://thesocialtiger.com</a><br>
                            <strong>Email:</strong> <a href="mailto:Mark@thesocialtiger.com">Mark@thesocialtiger.com</a></p>
                            <br>

                            <h2>2. What data we collect</h2>
                            <p>We may collect and process the following business-related personal data:</p>
                            <ul>
                                <li>Name</li>
                                <li>Job title</li>
                                <li>Company name</li>
                                <li>Work email address</li>
                                <li>LinkedIn profile</li>
                                <li>Any information you provide when contacting us</li>
                            </ul>
                            <p>We do not intentionally collect personal or sensitive data.</p>
                            <br>

                            <h2>3. How we collect your data</h2>
                            <p>We collect data when:</p>
                            <ul>
                                <li>You visit our website</li>
                                <li>You contact us via email or forms</li>
                                <li>We identify relevant business contacts via public sources (e.g. LinkedIn or company websites)</li>
                                <li>You engage with our content or outreach</li>
                            </ul>
                            <br>

                            <h2>4. Why we process your data</h2>
                            <p>We process personal data to:</p>
                            <ul>
                                <li>Respond to enquiries</li>
                                <li>Provide our services</li>
                                <li>Conduct B2B outreach where relevant</li>
                                <li>Improve our marketing and website</li>
                                <li>Maintain business relationships</li>
                            </ul>
                            <br>

                            <h2>5. Lawful basis for processing</h2>
                            <p>Under UK GDPR, our lawful bases are:</p>
                            <ul>
                                <li><strong>Legitimate interest</strong> – for B2B outreach and business communications</li>
                                <li><strong>Consent</strong> – where you have explicitly opted in</li>
                                <li><strong>Contract</strong> – where services are provided</li>
                            </ul>
                            <p>You can object to processing at any time.</p>
                            <br>

                            <h2>6. B2B email outreach</h2>
                            <p>We may contact business professionals using work email addresses where we believe our services are relevant.</p>
                            <p>Every email includes:</p>
                            <ul>
                                <li>Our identity</li>
                                <li>A clear purpose</li>
                                <li>A simple opt-out option</li>
                            </ul>
                            <p>If you ask us to stop, we will do so immediately.</p>
                            <br>

                            <h2>7. How we store and protect data</h2>
                            <ul>
                                <li>Data is stored securely</li>
                                <li>Access is limited</li>
                                <li>We only keep data for as long as necessary</li>
                                <li>If no engagement occurs, data is typically deleted after 6–12 months.</li>
                            </ul>
                            <br>

                            <h2>8. Who we share data with</h2>
                            <p>We may share data with trusted service providers (e.g. CRM, email or analytics tools) strictly for business operations.</p>
                            <p>We never sell personal data.</p>
                            <br>

                            <h2>9. Your rights</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access your data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion</li>
                                <li>Object to processing</li>
                                <li>Withdraw consent</li>
                            </ul>
                            <p>To exercise your rights, email: <a href="mailto:mark@thesocialtiger.com">mark@thesocialtiger.com</a></p>
                            <br>

                            <h2>10. Complaints</h2>
                            <p>If you are unhappy with how we handle your data, you can complain to:</p>
                            <p><strong>Information Commissioner’s Office (ICO)</strong><br>
                            Website: <a href="https://ico.org.uk">https://ico.org.uk</a></p>
                            <br>

                            <h2>11. Changes to this notice</h2>
                            <p>We may update this privacy notice from time to time.<br>
                            The latest version will always appear on this page.</p>
                        </div>
                    </section>
                `;

                mainContent.innerHTML = privacyContent;
                window.scrollTo(0, 0);

                // --- Navigation Replacement Logic ---
                // 1. Toggle Privacy Mode Class
                document.body.classList.add('privacy-active');

                // 2. Add Back Button (Logic remains same)
                const navContainer = document.querySelector('.nav-container');
                if (navContainer) {
                    // Prevent duplicates
                    if (!document.getElementById('privacy-back-btn')) {
                        const backBtn = document.createElement('a');
                        backBtn.id = 'privacy-back-btn';
                        backBtn.href = 'https://www.thesocialtiger.com';
                        backBtn.className = 'btn btn-primary';
                        backBtn.textContent = 'Go Back to Home Page';

                        // Append to container
                        navContainer.appendChild(backBtn);
                    }
                } else {
                    console.error('Privacy Policy: .nav-container not found');
                }
            }
        });
    }

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
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotBody = document.querySelector('.chatbot-body');
    const API_URL = 'https://magenta-fairy-2a3006.netlify.app/.netlify/functions/chat';

    if (chatbotToggle && chatbotWindow && chatbotClose) {

        // --- STRICT FLOW STATE MANAGEMENT ---
        let currentStep = 1;
        let isFlowComplete = false;
        let isWaitingForTipsReply = false; // Sub-state for Step 5 negative path
        let hasInitialized = false;

        const FLOW_MESSAGES = {
            STEP_1: `Hi, I’m The Social Tiger’s AI Assistant.

The Social Tiger helps businesses grow through:

1️⃣ LinkedIn & Social Media Organic Growth — using strategic ghostwritten content to stimulate inbound interest, targeted outbound connections to reach the right audience, and DM inbox management focused on booking qualified calls.

2️⃣ Warm & Cold Strategic Email Campaigns — designed to generate consistent inbound interest and predictable conversations without spamming or burning your list.

3️⃣ High-Converting Website Creation or Upgrades — with clear positioning, better conversion paths, and an AI chatbot that handles inbound inquiries instantly so you don’t have to.

How may I assist you today?`,

            STEP_1_5: `Before we dive in, can I ask — what do you do, or what does your company do?`,

            STEP_2: `Thanks for sharing. Out of curiosity, what are you currently using for your marketing?`,

            STEP_3: `Got it. Is there anything you would like to possibly improve in your current marketing or any possible challenges you are facing now?`,

            STEP_4: `How long have you been facing these challenges or wanting to improve your current marketing?`,

            STEP_5: `Thanks for sharing this. This really aligns to people and companies we have helped with great results! Based on what you’ve shared, would you be opposed to a quick meet and greet or connect call to see how we can support you?`,

            STEP_5_NEGATIVE: `No problem, we understand that that may not be a good time. In the meantime would you like some free marketing tips or advice that can really make a difference?`,

            STEP_6: `Great! You can book some time below (click the button). Slots are limited though so try to book ASAP!`
        };

        const SYSTEM_IDENTITY = `You are The Social Tiger’s AI Assistant.
Your role is to:
- Help visitors with marketing-related questions
- Understand their business and context
- Provide real, useful marketing insight
- Guide conversations naturally toward clarity and optional support

You are helpful, professional, and concise.`;


        // Toggle Window
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
            if (!chatbotWindow.classList.contains('hidden') && !hasInitialized) {
                initializeChat();
            }
        });

        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.add('hidden');
        });

        // Initialize Chat
        function initializeChat() {
            hasInitialized = true;
            appendMessage(FLOW_MESSAGES.STEP_1, 'bot');
        }

        // --- VALIDATION (Step 1 Only) ---
        function isUnintelligible(text) {
            if (!text || text.trim().length < 2) return true; // Empty or too short

            const cleanText = text.trim();

            // No alphabetic characters
            if (!/[a-zA-Z]/.test(cleanText)) return true; // Mostly symbols/numbers

            // Mostly symbols check (more than 80% non-alphanumeric)
            const nonAlpha = cleanText.replace(/[a-zA-Z0-9\s]/g, '').length;
            if (nonAlpha > cleanText.length * 0.8) return true;

            // Repeated nonsense (simple heuristic: repeating char sequences)
            if (/(.+?)\1{4,}/.test(cleanText)) return true; // e.g., aaaaa, qqqqq

            return false;
        }

        // --- CORE LOGIC ---
        async function handleUserMessage() {
            const text = chatbotInput.value.trim();
            if (!text) return; // Basic input check

            // Display User Message
            appendMessage(text, 'user');
            chatbotInput.value = '';

            // If Flow is Complete -> Standard API Chat
            if (isFlowComplete) {
                await sendToApi(text);
                return;
            }

            // --- STRICT FLOW HANDLER ---

            // STEP 1 VALIDATION
            if (currentStep === 1) {
                if (isUnintelligible(text)) {
                    // Do not advance. Show error.
                    setTimeout(() => {
                        appendMessage("I'm sorry, I don’t understand… please input your answer again!", 'bot');
                    }, 500);
                    return;
                }
                // Valid -> Advance to 1.5
                currentStep = 1.5;
                setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_1_5, 'bot'), 600);
                return;
            }

            // STEP 1.5 -> 2
            if (currentStep === 1.5) {
                currentStep = 2;
                setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_2, 'bot'), 600);
                return;
            }

            // STEP 2 -> 3
            if (currentStep === 2) {
                currentStep = 3;
                setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_3, 'bot'), 600);
                return;
            }

            // STEP 3 -> 4
            if (currentStep === 3) {
                currentStep = 4;
                setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_4, 'bot'), 600);
                return;
            }

            // STEP 4 -> 5
            if (currentStep === 4) {
                currentStep = 5;
                setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_5, 'bot'), 600);
                return;
            }

            // STEP 5 LOGIC
            if (currentStep === 5) {
                // Check if we are already waiting for the "Tips" reply (Negative Path sub-state)
                if (isWaitingForTipsReply) {
                    // User replied to "Would you like some free marketing tips?"
                    // Regardless of answer -> Go to Step 6
                    advanceToStep6();
                    return;
                }

                // Check Sentiment of Invite Answer
                const lower = text.toLowerCase();
                const negativeWords = ['no', 'nope', 'pass', 'not now', 'busy', 'later', 'nah', 'don\'t', 'cant', 'can\'t'];
                // distinct word check to avoid partial matches if needed, but 'includes' is usually sufficient for simple logic
                const isNegative = negativeWords.some(w => lower.includes(w));

                if (isNegative) {
                    // Negative Path: Message -> Wait -> Step 6
                    isWaitingForTipsReply = true;
                    setTimeout(() => appendMessage(FLOW_MESSAGES.STEP_5_NEGATIVE, 'bot'), 600);
                } else {
                    // Positive (or ambiguous) Path: -> Step 6 immediately
                    advanceToStep6();
                }
                return;
            }
        }

        function advanceToStep6() {
            currentStep = 6;
            setTimeout(() => {
                appendMessage(FLOW_MESSAGES.STEP_6, 'bot');
                appendButton('Grab a slot', 'https://calendly.com/socialtigermarketing/30min');
                isFlowComplete = true; // Flow Ends
            }, 600);
        }

        // --- UI HELPERS ---

        function appendMessage(text, sender) {
            const div = document.createElement('div');
            div.classList.add('chat-msg', sender);
            // Auto-link URLs
            div.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');
            // Convert newlines to <br> for formatting
            div.innerHTML = div.innerHTML.replace(/\n/g, '<br>');

            chatbotBody.appendChild(div);
            scrollBottom();
        }

        function appendButton(label, url) {
            const container = document.createElement('div');
            container.style.textAlign = 'center';
            container.style.marginTop = '10px';
            container.style.marginBottom = '10px';

            const btn = document.createElement('a');
            btn.href = url;
            btn.target = '_blank';
            btn.textContent = label;

            // Match website brand style (assuming 'btn-primary' exists or manual style)
            btn.className = 'btn btn-primary';
            btn.style.display = 'inline-block';
            btn.style.padding = '10px 20px';
            btn.style.textDecoration = 'none';
            btn.style.borderRadius = '5px';
            btn.style.fontSize = '14px';
            // Fallback colors if class doesn't load right
            if (!btn.classList.contains('btn-primary')) {
                btn.style.backgroundColor = '#ff6b00';
                btn.style.color = '#fff';
            }

            container.appendChild(btn);
            chatbotBody.appendChild(container);
            scrollBottom();
        }

        function scrollBottom() {
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }

        async function sendToApi(userText) {
            // Show Loading
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('chat-msg', 'bot');
            loadingDiv.textContent = '...';
            chatbotBody.appendChild(loadingDiv);
            scrollBottom();

            try {
                const messagesToSend = [
                    { role: 'system', content: SYSTEM_IDENTITY },
                    { role: 'user', content: userText }
                ];

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messagesToSend })
                });

                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);

                if (!response.ok) throw new Error('API Request Failed');
                const data = await response.json();

                if (data.choices && data.choices[0] && data.choices[0].message) {
                    appendMessage(data.choices[0].message.content, 'bot');
                } else {
                    appendMessage("I'm having trouble connecting right now. Please try again.", 'bot');
                }

            } catch (error) {
                console.error(error);
                if (loadingDiv.parentNode) chatbotBody.removeChild(loadingDiv);
                appendMessage("I'm having a bit of trouble connecting. Please try again later.", 'bot');
            }
        }

        // Event Listeners
        if (chatbotSend && chatbotInput) {
            chatbotSend.addEventListener('click', handleUserMessage);
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleUserMessage();
            });
        }
    }

    // Scroll-based fade-in animation
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.body.classList.add('js-scroll-anim-enabled');
        document.querySelectorAll('.fade-in-up').forEach(element => {
            observer.observe(element);
        });
    }

    // --- GA4 EVENT TRACKING ---

    // 1. Calendly Button Clicks
    const calendlyButtons = document.querySelectorAll('.track-calendly');
    calendlyButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            if (typeof gtag === 'function') {
                gtag('event', 'calendly_click', {
                    'event_category': 'engagement',
                    'event_label': this.textContent.trim(),
                    'transport_type': 'beacon'
                });
            } else {
                console.warn('Google Analytics (gtag) not loaded.');
            }
        });
    });

    // 2. Chatbot Opened
    // Note: 'chatbotToggle' is already defined above (line 52)
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function () {
            if (typeof gtag === 'function') {
                gtag('event', 'chatbot_opened', {
                    'event_category': 'engagement',
                    'event_label': 'Chatbot Opened'
                });
            }
        });
    }



});
