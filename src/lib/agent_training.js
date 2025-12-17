import { databases, account, storage } from "./appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import { DB_ID, COLLECTION_AGENTS } from "./constants";

// ============================================================================
// COMPLETE AGENT TRAINING ACADEMY
// ============================================================================

// BADGE DEFINITIONS
export const BADGES = {
    FIRST_LOGIN: { id: 'first_login', name: 'Welcome Aboard', icon: '🎉', description: 'Logged in for the first time' },
    MODULE_MASTER: { id: 'module_master', name: 'Module Master', icon: '📚', description: 'Completed your first module' },
    QUICK_LEARNER: { id: 'quick_learner', name: 'Quick Learner', icon: '⚡', description: 'Completed a timed quiz in under 2 minutes' },
    PERFECT_SCORE: { id: 'perfect_score', name: 'Perfect Score', icon: '💯', description: 'Scored 100% on any quiz' },
    LEGAL_EAGLE: { id: 'legal_eagle', name: 'Legal Eagle', icon: '⚖️', description: 'Completed all legal modules' },
    CERTIFIED_PRO: { id: 'certified_pro', name: 'Certified Professional', icon: '🏆', description: 'Completed all training and earned certification' },
    SCENARIO_SOLVER: { id: 'scenario_solver', name: 'Scenario Solver', icon: '🧩', description: 'Completed all interactive scenarios' },
    SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', icon: '🚀', description: 'Completed 3 modules in one session' },
    KNOWLEDGE_SEEKER: { id: 'knowledge_seeker', name: 'Knowledge Seeker', icon: '🔍', description: 'Retook a quiz to improve your score' },
    ETHICS_CHAMPION: { id: 'ethics_champion', name: 'Ethics Champion', icon: '🛡️', description: 'Scored 100% on Ethics module' },
};

// TRAINING MODULE TYPES
export const MODULE_TYPES = {
    VIDEO: 'video',
    READING: 'reading',
    INTERACTIVE: 'interactive',
    SCENARIO: 'scenario',
};

// ============================================================================
// COMPREHENSIVE TRAINING MODULES (10 COMPLETE MODULES)
// ============================================================================
export const TRAINING_MODULES = [
    // ========================================================================
    // MODULE 1: WELCOME & PLATFORM OVERVIEW
    // ========================================================================
    {
        id: 'module-1',
        title: 'Welcome to LandSale.lk',
        type: MODULE_TYPES.VIDEO,
        description: 'A comprehensive introduction to our platform, company mission, and your role as a certified property agent in Sri Lanka.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        duration: '12 mins',
        estimatedTime: 20,
        category: 'onboarding',
        requiredScore: 80,
        timedQuiz: false,
        content: `
## Welcome to LandSale.lk Agent Training Academy

### Our Mission
LandSale.lk is Sri Lanka's premier digital real estate platform, connecting property buyers and sellers with verified, professional agents. Our goal is to bring transparency, trust, and efficiency to property transactions.

### Your Role as a Certified Agent
As a LandSale.lk certified agent, you are:
- A trusted intermediary between buyers and sellers
- A professional bound by our code of ethics
- A representative of our brand and values
- A licensed expert in Sri Lankan property transactions

### Platform Benefits
- **Verified Listings**: All properties go through verification
- **Agent Dashboard**: Track your performance and leads
- **Legal Support**: Access to legal document templates
- **Training & Support**: Continuous learning opportunities
- **Commission Protection**: Secure payment processing

### Certification Requirements
1. Complete all 10 training modules
2. Score minimum required marks on all quizzes
3. Complete interactive scenarios
4. Pass the final certification assessment
        `,
        questions: [
            {
                id: 'q1-1',
                text: 'What is the primary mission of LandSale.lk?',
                options: [
                    'To sell the maximum number of properties regardless of quality',
                    'To connect property buyers and sellers with verified, professional agents',
                    'To provide cheap property listings only',
                    'To offer mortgage and loan services exclusively'
                ],
                correctAnswer: 1,
                explanation: 'LandSale.lk focuses on connecting buyers and sellers through verified, professional agents with transparency and trust.'
            },
            {
                id: 'q1-2',
                text: 'What differentiates LandSale.lk from other property platforms?',
                options: [
                    'Lower commission rates only',
                    'Free listings without verification',
                    'Verified agents, legal compliance tracking, and transparent transactions',
                    'International properties exclusively'
                ],
                correctAnswer: 2,
                explanation: 'Our agent verification system, legal compliance features, and transaction transparency set us apart.'
            },
            {
                id: 'q1-3',
                text: 'As a certified agent, what is your PRIMARY responsibility?',
                options: [
                    'Closing deals as fast as possible',
                    'Providing accurate information, professional service, and ethical conduct',
                    'Getting the highest commission possible',
                    'Avoiding difficult clients'
                ],
                correctAnswer: 1,
                explanation: 'Your primary role is to serve clients professionally with accurate information and ethical conduct.'
            },
            {
                id: 'q1-4',
                text: 'How many modules must you complete for full certification?',
                options: [
                    '5 modules',
                    '7 modules',
                    '10 modules',
                    '3 modules'
                ],
                correctAnswer: 2,
                explanation: 'Full certification requires completion of all 10 training modules.'
            },
            {
                id: 'q1-5',
                text: 'Which of the following is NOT a platform benefit?',
                options: [
                    'Verified Listings',
                    'Agent Dashboard',
                    'Free unlimited advertising on TV',
                    'Legal Support'
                ],
                correctAnswer: 2,
                explanation: 'While we offer many benefits, free TV advertising is not among them.'
            }
        ]
    },

    // ========================================================================
    // MODULE 2: SRI LANKAN PROPERTY LAW FUNDAMENTALS
    // ========================================================================
    {
        id: 'module-2',
        title: 'Sri Lankan Property Law Fundamentals',
        type: MODULE_TYPES.READING,
        description: 'Essential legal knowledge including deed types, land registration systems, and property transfer requirements in Sri Lanka.',
        duration: '20 mins',
        estimatedTime: 35,
        category: 'legal',
        requiredScore: 85,
        timedQuiz: true,
        quizTimeLimit: 300, // 5 minutes
        content: `
## Sri Lankan Property Law Fundamentals

### Part 1: Types of Property Ownership

#### 1. Sinnakkara (Freehold)
- Complete ownership rights with no time limit
- Can be inherited, sold, or transferred freely
- Owner has full control over the land
- Most desirable form of ownership

#### 2. Bim Saviya (Registered Title)
- Government-guaranteed title system
- Provides certainty of ownership
- Introduced under Bim Saviya Program
- Reduces disputes and fraud

#### 3. Old System (Deeds System)
- Based on chain of deeds
- Requires title search going back 30+ years
- More vulnerable to disputes
- Still common in many areas

#### 4. Jayabhoomi
- Land granted by government
- May have restrictions on sale
- Often given to landless citizens
- Cannot always be freely transferred

#### 5. Condominium Ownership
- Shared ownership in multi-unit buildings
- Unit owner and common area shares
- Governed by Condominium Property Act
- Can be sold to foreigners

### Part 2: Land Registration Process

#### Steps for Property Transfer:
1. **Title Search** - Verify ownership history (minimum 30 years)
2. **Survey Plan** - Updated survey from licensed surveyor
3. **Valuation** - Government valuation for stamp duty
4. **Draft Deed** - Prepared by notary public
5. **Execution** - Signing before notary with witnesses
6. **Registration** - Submit to Land Registry within 30 days
7. **Title Certificate** - Obtain certified copy

#### Critical Documents Required:
- Original deed of current owner
- Survey plan (new or certified copy)
- NIC copies of all parties
- Tax clearance certificate
- Building approval (if applicable)
- NBRO certificate (in certain areas)

### Part 3: Stamp Duty and Taxes

| Transaction Type | Stamp Duty Rate |
|-----------------|-----------------|
| Property Transfer | 3-4% of value |
| Mortgage | 0.5% |
| Lease (over 20 years) | 3% |
| Gift to non-family | 3% |

### Part 4: NBRO Certification

The National Building Research Organisation (NBRO) certification is MANDATORY for:
- Properties in landslide-prone areas
- Hillside and slope developments
- Certain designated zones

**NBRO Categories:**
- **Safe Zone**: Construction allowed
- **Low Risk**: Minor precautions needed
- **High Risk**: Special approval required
- **Prohibited**: No construction allowed

### Part 5: Foreign Ownership Rules

**Current Regulations:**
- Foreigners CANNOT directly own land
- Can purchase apartments/condos above 4th floor (with 100% tax on land value)
- Can lease land for up to 99 years
- Company ownership is possible with local shareholding requirements
- Special Investment Zone exemptions may apply
        `,
        questions: [
            {
                id: 'q2-1',
                text: 'Which type of ownership provides complete freehold rights that can be inherited?',
                options: ['Jayabhoomi', 'Sinnakkara', 'Leasehold', 'State Land'],
                correctAnswer: 1,
                explanation: 'Sinnakkara is the freehold title providing complete ownership rights that can be inherited.'
            },
            {
                id: 'q2-2',
                text: 'How far back should a title search typically go?',
                options: ['5 years', '10 years', '30+ years', 'Only current owner'],
                correctAnswer: 2,
                explanation: 'Title searches should go back at least 30 years to ensure clear ownership history.'
            },
            {
                id: 'q2-3',
                text: 'What is the typical stamp duty rate for property transfers?',
                options: ['1%', '2%', '3-4%', '10%'],
                correctAnswer: 2,
                explanation: 'Stamp duty for property transfers in Sri Lanka is typically 3-4% of the property value.'
            },
            {
                id: 'q2-4',
                text: 'Within how many days must a deed be registered at the Land Registry?',
                options: ['7 days', '15 days', '30 days', '60 days'],
                correctAnswer: 2,
                explanation: 'Deeds must be registered within 30 days of execution.'
            },
            {
                id: 'q2-5',
                text: 'Can foreigners directly purchase land in Sri Lanka?',
                options: [
                    'Yes, without any restrictions',
                    'No, direct land ownership is not permitted',
                    'Only in Colombo',
                    'Only agricultural land'
                ],
                correctAnswer: 1,
                explanation: 'Foreign nationals cannot directly own land in Sri Lanka - alternatives include long-term leases or company structures.'
            },
            {
                id: 'q2-6',
                text: 'What does NBRO certification verify?',
                options: [
                    'Property market value',
                    'Building construction quality',
                    'Land safety regarding natural hazards like landslides',
                    'Tax compliance'
                ],
                correctAnswer: 2,
                explanation: 'NBRO certifies land safety, particularly regarding landslide risks in designated areas.'
            },
            {
                id: 'q2-7',
                text: 'Which document must be prepared by a licensed professional for property transfer?',
                options: [
                    'Survey Plan by Licensed Surveyor',
                    'Property brochure',
                    'Advertisement copy',
                    'Social media post'
                ],
                correctAnswer: 0,
                explanation: 'A survey plan prepared by a licensed surveyor is essential for property transfers.'
            }
        ]
    },

    // ========================================================================
    // MODULE 3: CLIENT COMMUNICATION & PROFESSIONAL CONDUCT
    // ========================================================================
    {
        id: 'module-3',
        title: 'Client Communication & Professional Conduct',
        type: MODULE_TYPES.VIDEO,
        description: 'Master professional communication techniques for client inquiries, property viewings, negotiations, and handling difficult situations.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15 mins',
        estimatedTime: 25,
        category: 'skills',
        requiredScore: 80,
        timedQuiz: false,
        content: `
## Client Communication Excellence

### Response Time Standards
- Initial inquiry: Within 2 hours during business hours
- Follow-up questions: Within 24 hours
- Document requests: Within 48 hours
- Viewing confirmations: Same day

### Communication Channels
- WhatsApp: Preferred for quick responses
- Phone: For complex discussions
- Email: For formal documentation
- Platform messaging: For initial contacts

### Professional Language Guidelines
- Always use formal salutations (Sir/Madam)
- Be concise but complete
- Avoid industry jargon with new clients
- Confirm understanding with summaries

### Handling Difficult Situations
1. **Angry clients**: Listen first, acknowledge concerns, propose solutions
2. **Unrealistic expectations**: Provide market data, be honest but tactful
3. **Price negotiations**: Know your limits, document all offers
4. **Competing agents**: Never speak negatively, focus on your value
        `,
        questions: [
            {
                id: 'q3-1',
                text: 'What is the maximum response time for an initial client inquiry during business hours?',
                options: ['Immediately', 'Within 2 hours', 'Within 24 hours', 'Within 1 week'],
                correctAnswer: 1,
                explanation: 'Initial inquiries should be responded to within 2 hours during business hours.'
            },
            {
                id: 'q3-2',
                text: 'If a client has unrealistic price expectations, what should you do?',
                options: [
                    'Agree with them to get the listing',
                    'Refuse to work with them',
                    'Provide market data and be honest but tactful',
                    'Ignore their expectations'
                ],
                correctAnswer: 2,
                explanation: 'Use market data to guide realistic expectations while remaining tactful.'
            },
            {
                id: 'q3-3',
                text: 'When a client asks about a property detail you do not know, what should you do?',
                options: [
                    'Make up an answer',
                    'Admit uncertainty and promise to find accurate information',
                    'Change the subject',
                    'Tell them to find out themselves'
                ],
                correctAnswer: 1,
                explanation: 'Honesty builds trust - admit when you need to verify information.'
            },
            {
                id: 'q3-4',
                text: 'How should you respond to an angry client?',
                options: [
                    'Argue back and defend yourself',
                    'Hang up immediately',
                    'Listen first, acknowledge their concerns, then propose solutions',
                    'Transfer them to another agent'
                ],
                correctAnswer: 2,
                explanation: 'Active listening and acknowledgment de-escalates situations and builds trust.'
            },
            {
                id: 'q3-5',
                text: 'What is the preferred communication channel for quick responses?',
                options: [
                    'Postal mail',
                    'WhatsApp',
                    'Fax',
                    'In-person only'
                ],
                correctAnswer: 1,
                explanation: 'WhatsApp is preferred for quick, accessible communication with clients.'
            }
        ]
    },

    // ========================================================================
    // MODULE 4: PROPERTY VALUATION SCENARIO
    // ========================================================================
    {
        id: 'module-4',
        title: 'Interactive: Property Valuation Case Study',
        type: MODULE_TYPES.SCENARIO,
        description: 'Practice real-world property valuation decisions through an interactive simulation featuring the challenging Kandy land assessment.',
        duration: '25 mins',
        estimatedTime: 30,
        category: 'practical',
        requiredScore: 75,
        scenario: {
            title: 'The Kandy Land Valuation Challenge',
            background: `A new client, Mr. Perera, approaches you about selling a 15-perch land plot in Kandy, near Peradeniya. 
            He claims it's worth Rs. 5 million per perch based on a sale he heard about nearby.
            The property has beautiful views but is on a steep slope with narrow road access.
            Your task is to professionally evaluate this property and advise the client.`,
            steps: [
                {
                    id: 'step-1',
                    situation: 'Mr. Perera shows you the land. The view is stunning, but you notice the slope is quite steep and the access road is narrow.',
                    question: 'What is your FIRST priority action?',
                    options: [
                        { text: 'Immediately agree with his Rs. 5M/perch valuation to secure the listing', feedback: 'Never agree to valuations without verification. This could damage your credibility and lead to months of wasted effort.', correct: false },
                        { text: 'Request to see the deed, survey plan, and ask about NBRO certification', feedback: 'Excellent! Verifying legal documents is always the first step. This shows professionalism and protects both you and your client.', correct: true },
                        { text: 'Suggest a much lower price to manage expectations without research', feedback: 'Guessing prices without research is unprofessional and could lose the client.', correct: false },
                        { text: 'Take photos and post the listing immediately', feedback: 'Never list a property before verifying documents and condition.', correct: false }
                    ]
                },
                {
                    id: 'step-2',
                    situation: 'After reviewing documents, you discover: (1) The land lacks NBRO certification, (2) The "nearby sale" was for FLAT land with direct main road access, (3) The steep slope may require significant development costs.',
                    question: 'How do you communicate these findings to Mr. Perera?',
                    options: [
                        { text: 'Hide this information to avoid losing the listing', feedback: 'This is unethical and could result in legal action against you. Disclosure is mandatory.', correct: false },
                        { text: 'Explain the differences professionally, suggest getting NBRO certification, and provide a realistic price range', feedback: 'Perfect! Transparency with actionable solutions builds trust and demonstrates expertise.', correct: true },
                        { text: 'Tell him his land is basically worthless due to the slope', feedback: 'While there are challenges, dismissing the property is unprofessional and demoralizing.', correct: false },
                        { text: 'Refer him to another agent to avoid the difficult conversation', feedback: 'Avoiding challenges means missing growth opportunities and potential commission.', correct: false }
                    ]
                },
                {
                    id: 'step-3',
                    situation: 'Mr. Perera agrees to get NBRO certification. While waiting (2-3 weeks), a cash buyer contacts you offering Rs. 3.2M per perch, wanting to close quickly before NBRO arrives.',
                    question: 'What is the best course of action?',
                    options: [
                        { text: 'Accept the offer immediately and push for quick closing without NBRO', feedback: 'This could cause serious legal issues and buyer remorse complaints later.', correct: false },
                        { text: 'Reject the buyer completely since NBRO is pending', feedback: 'This wastes a potential opportunity. The buyer might wait if handled correctly.', correct: false },
                        { text: 'Inform both parties of the situation, negotiate a conditional deal pending NBRO certification', feedback: 'Excellent! Conditional offers protect all parties while keeping the deal alive.', correct: true },
                        { text: 'Accept the offer without informing Mr. Perera about the details', feedback: 'Never make decisions about offers without full client knowledge and consent.', correct: false }
                    ]
                },
                {
                    id: 'step-4',
                    situation: 'NBRO certification comes back showing "Low Risk" status with minor recommendations. The buyer is still interested but now wants to renegotiate to Rs. 3M/perch citing the additional development precautions needed.',
                    question: 'How do you handle this renegotiation?',
                    options: [
                        { text: 'Tell the buyer to take it or leave it at Rs. 3.2M', feedback: 'Rigid negotiation tactics can lose deals. Consider client priorities.', correct: false },
                        { text: 'Immediately accept Rs. 3M without consulting Mr. Perera', feedback: 'Never accept price changes without seller approval.', correct: false },
                        { text: 'Present both options to Mr. Perera with your professional assessment of the market', feedback: 'Perfect! The seller makes the final decision with your informed guidance.', correct: true },
                        { text: 'Add hidden fees to make up the difference', feedback: 'This is fraud and will destroy your career.', correct: false }
                    ]
                }
            ]
        },
        questions: [] // Scenario uses step-based assessment
    },

    // ========================================================================
    // MODULE 5: PLATFORM TOOLS & FEATURES MASTERY
    // ========================================================================
    {
        id: 'module-5',
        title: 'Platform Tools & Features Mastery',
        type: MODULE_TYPES.VIDEO,
        description: 'Complete guide to using the LandSale.lk platform - creating listings, managing leads, using analytics, and optimizing your performance.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '18 mins',
        estimatedTime: 28,
        category: 'platform',
        requiredScore: 85,
        timedQuiz: true,
        quizTimeLimit: 240, // 4 minutes
        content: `
## LandSale.lk Platform Mastery

### Creating Effective Listings
Required fields for complete listings:
- Property title (compelling and accurate)
- High-quality photos (minimum 5, recommended 15+)
- Accurate location with GPS coordinates
- Price (fixed or negotiable range)
- Land/building size with measurement units
- Legal details (deed type, land category)
- Comprehensive description
- Contact preferences

### Photo Guidelines
- Minimum resolution: 1920x1080
- Natural lighting preferred
- Multiple angles of each area
- Include exterior and interior
- No watermarks or filters
- GPS-tagged for verification

### Dashboard Features
- Lead management and tracking
- Performance analytics
- Inquiry response metrics
- Listing views and favorites
- Commission tracking
- Message center
- Calendar for viewings

### Premium Features
- Featured listings
- Boost visibility
- Priority support
- Advanced analytics
- Multiple listing packages
        `,
        questions: [
            {
                id: 'q5-1',
                text: 'What is the minimum number of photos recommended for a complete listing?',
                options: ['1-2 photos', '3-4 photos', 'At least 5, recommended 15+', 'Photos not required'],
                correctAnswer: 2,
                explanation: 'Quality listings need minimum 5 photos, with 15+ recommended for best results.'
            },
            {
                id: 'q5-2',
                text: 'Which information is required for a complete property listing?',
                options: [
                    'Only the price',
                    'Title, photos, location, price, size, legal details, and description',
                    'Just the owner phone number',
                    'Only the address and price'
                ],
                correctAnswer: 1,
                explanation: 'Complete listings require comprehensive information for buyer confidence.'
            },
            {
                id: 'q5-3',
                text: 'Where can you track your listing performance and leads?',
                options: [
                    'There is no tracking available',
                    'Agent Dashboard',
                    'Only by calling support',
                    'External third-party websites'
                ],
                correctAnswer: 1,
                explanation: 'The Agent Dashboard provides comprehensive analytics and lead tracking.'
            },
            {
                id: 'q5-4',
                text: 'What is the minimum photo resolution recommended?',
                options: ['640x480', '800x600', '1920x1080', 'Any resolution'],
                correctAnswer: 2,
                explanation: 'High-resolution photos (1920x1080 minimum) create better first impressions.'
            },
            {
                id: 'q5-5',
                text: 'Should listing photos have watermarks or heavy filters?',
                options: [
                    'Yes, to protect intellectual property',
                    'No, clean natural photos are preferred',
                    'Only on premium listings',
                    'Only for land photos'
                ],
                correctAnswer: 1,
                explanation: 'Clean, natural photos without watermarks or heavy filters perform best.'
            }
        ]
    },

    // ========================================================================
    // MODULE 6: ETHICS & COMPLIANCE
    // ========================================================================
    {
        id: 'module-6',
        title: 'Ethics, Compliance & Anti-Fraud',
        type: MODULE_TYPES.READING,
        description: 'Understanding your ethical obligations, anti-fraud measures, compliance requirements, and consequences of violations.',
        duration: '20 mins',
        estimatedTime: 30,
        category: 'compliance',
        requiredScore: 100, // Must pass 100% for ethics
        timedQuiz: false,
        content: `
## Agent Ethics & Compliance Guide

### Part 1: Core Ethical Principles

#### 1. HONESTY
- Never misrepresent property details, size, or condition
- Disclose all known defects and issues
- Be truthful about market conditions and values
- Correct any misinformation immediately

#### 2. TRANSPARENCY
- Disclose your commission structure
- Reveal any conflicts of interest
- Share all relevant information with clients
- Maintain clear communication at all times

#### 3. CONFIDENTIALITY
- Protect client personal information
- Do not share negotiation details without permission
- Secure all documents and data
- Comply with data protection regulations

#### 4. FAIRNESS
- Treat all parties equitably
- Do not discriminate based on ethnicity, religion, or status
- Present all offers to sellers
- Advocate for fair market practices

### Part 2: Anti-Fraud Measures

**NEVER do the following:**
❌ Accept cash payments on behalf of sellers
❌ Forge signatures or documents
❌ Create fake listings or buyers
❌ Inflate or deflate prices artificially
❌ Withhold offers from clients
❌ Share login credentials

**ALWAYS:**
✅ Verify all documents before listing
✅ Use official payment channels only
✅ Report suspicious activities immediately
✅ Maintain proper records
✅ Follow verification procedures

### Part 3: Document Verification Checklist

Before listing any property, verify:
- [ ] Original deed (not just a copy)
- [ ] Owner's NIC matches deed
- [ ] Survey plan is current (within 5 years)
- [ ] Tax receipts are up to date
- [ ] No pending legal disputes
- [ ] NBRO clearance (if applicable)
- [ ] Building approvals (for structures)

### Part 4: Consequences of Violations

| Violation Level | Consequence |
|-----------------|-------------|
| Minor (first offense) | Written warning, mandatory retraining |
| Moderate | Temporary suspension (30-90 days) |
| Serious | Permanent platform ban |
| Criminal (fraud) | Legal prosecution, industry-wide ban |

### Part 5: Reporting Procedures

If you suspect fraud or unethical behavior:
1. Document all evidence
2. Report through platform compliance channel
3. Do not confront the suspect directly
4. Cooperate fully with investigations
5. Maintain confidentiality of the report
        `,
        questions: [
            {
                id: 'q6-1',
                text: 'Is it acceptable to omit known property defects from a listing?',
                options: [
                    'Yes, if the defects are minor',
                    'No, ALL known defects must be disclosed',
                    'Only if the buyer does not ask',
                    'Yes, to help the sale go faster'
                ],
                correctAnswer: 1,
                explanation: 'Full disclosure of known defects is both an ethical and legal requirement.'
            },
            {
                id: 'q6-2',
                text: 'Should you ever accept cash payments on behalf of a property seller?',
                options: [
                    'Yes, if the seller requests it',
                    'No, always use official payment channels',
                    'Only for small amounts under Rs. 100,000',
                    'Yes, if documented with a receipt'
                ],
                correctAnswer: 1,
                explanation: 'Never handle cash transactions - this protects you from fraud allegations.'
            },
            {
                id: 'q6-3',
                text: 'What should you do if you suspect fraudulent documents?',
                options: [
                    'Ignore it if the client seems trustworthy',
                    'Report immediately through the platform compliance channel',
                    'Proceed with caution and hope for the best',
                    'Confront the client directly about the fraud'
                ],
                correctAnswer: 1,
                explanation: 'Suspected fraud must be reported immediately through proper channels.'
            },
            {
                id: 'q6-4',
                text: 'What is the consequence of serious ethical violations?',
                options: [
                    'A warning email only',
                    'Small fine',
                    'Permanent platform ban and potential legal action',
                    'No real consequence'
                ],
                correctAnswer: 2,
                explanation: 'Serious violations result in permanent bans and may include legal prosecution.'
            },
            {
                id: 'q6-5',
                text: 'If a buyer makes an offer, you must:',
                options: [
                    'Only present offers you think are reasonable',
                    'Present ALL offers to the seller',
                    'Negotiate on behalf of the seller without informing them',
                    'Only present the highest offer received'
                ],
                correctAnswer: 1,
                explanation: 'Agents must present all offers to sellers - it is their decision to accept or reject.'
            },
            {
                id: 'q6-6',
                text: 'Which of the following must you verify BEFORE listing a property?',
                options: [
                    'Only the price',
                    'Original deed, owner NIC, survey plan, and tax receipts',
                    'Just the owner\'s phone number',
                    'Nothing, the seller verifies everything'
                ],
                correctAnswer: 1,
                explanation: 'Comprehensive document verification protects all parties and prevents fraud.'
            }
        ]
    },

    // ========================================================================
    // MODULE 7: CLIENT NEGOTIATION SCENARIO
    // ========================================================================
    {
        id: 'module-7',
        title: 'Interactive: Difficult Negotiation',
        type: MODULE_TYPES.SCENARIO,
        description: 'Navigate a challenging multi-party negotiation with competing interests and last-minute complications.',
        duration: '20 mins',
        estimatedTime: 25,
        category: 'practical',
        requiredScore: 75,
        scenario: {
            title: 'The Colombo Apartment Standoff',
            background: `You are representing a seller for a 3-bedroom apartment in Colombo 5. 
            The asking price is Rs. 35 million. Two serious buyers have emerged: 
            - Buyer A: Offering Rs. 33M, all cash, can close in 2 weeks
            - Buyer B: Offering Rs. 34.5M but needs 45 days for bank loan approval
            The seller desperately needs cash for a business emergency but also wants maximum value.`,
            steps: [
                {
                    id: 'step-1',
                    situation: 'Both buyers have submitted their offers. The seller calls you asking which offer to accept.',
                    question: 'How do you advise the seller?',
                    options: [
                        { text: 'Recommend Buyer A (cash) since speed is important', feedback: 'This ignores the Rs. 1.5M difference. Present both options objectively.', correct: false },
                        { text: 'Recommend Buyer B (higher price) since it is more money', feedback: 'This ignores the seller\'s cash urgency and loan approval risk.', correct: false },
                        { text: 'Present both options with pros and cons, letting the seller decide based on their priorities', feedback: 'Perfect! Objective presentation respects the seller\'s autonomy and shows professionalism.', correct: true },
                        { text: 'Tell the seller you will handle it and make the decision for them', feedback: 'Never make financial decisions on behalf of clients.', correct: false }
                    ]
                },
                {
                    id: 'step-2',
                    situation: 'The seller chooses to counter Buyer A at Rs. 34M cash for quick closing. Before you can respond, Buyer B increases their offer to Rs. 35M (full asking price) but still needs the 45-day loan period.',
                    question: 'What is your next step?',
                    options: [
                        { text: 'Only present Buyer A\'s counter-response since the seller already made a decision', feedback: 'You must present all offers - this is an ethical obligation.', correct: false },
                        { text: 'Present both updates to the seller immediately', feedback: 'Correct! All offers must be presented regardless of previous discussions.', correct: true },
                        { text: 'Play the buyers against each other without telling the seller', feedback: 'This is unethical and could be considered fraud.', correct: false },
                        { text: 'Accept Buyer B\'s full price offer on behalf of the seller', feedback: 'Never accept offers without explicit seller approval.', correct: false }
                    ]
                },
                {
                    id: 'step-3',
                    situation: 'The seller is torn. They need Rs. 15M urgently for their business. You realize Buyer B might be able to make a partial payment upfront while the loan processes.',
                    question: 'How do you help resolve this?',
                    options: [
                        { text: 'Stay silent since it is not your job to suggest solutions', feedback: 'Creative problem-solving adds value to your service.', correct: false },
                        { text: 'Suggest negotiating a partial advance payment from Buyer B to meet the seller\'s immediate need', feedback: 'Excellent! This creative solution could satisfy both parties and close the deal.', correct: true },
                        { text: 'Pressure the seller to just accept Buyer A and move on', feedback: 'Pressure tactics damage trust and relationships.', correct: false },
                        { text: 'Offer to loan the seller money yourself', feedback: 'Never have financial entanglements with clients.', correct: false }
                    ]
                }
            ]
        },
        questions: []
    },

    // ========================================================================
    // MODULE 8: PHOTOGRAPHY & LISTING OPTIMIZATION
    // ========================================================================
    {
        id: 'module-8',
        title: 'Photography & Listing Optimization',
        type: MODULE_TYPES.VIDEO,
        description: 'Learn professional property photography techniques and how to write compelling listing descriptions that attract buyers.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15 mins',
        estimatedTime: 25,
        category: 'skills',
        requiredScore: 80,
        timedQuiz: false,
        content: `
## Property Photography & Listing Optimization

### Photography Best Practices

#### Equipment
- Smartphone with good camera (12MP+) or DSLR
- Wide-angle lens or setting
- Tripod for stability
- External lighting (optional but helpful)

#### Shooting Tips
1. **Natural Light**: Shoot between 10 AM - 2 PM
2. **Wide Angles**: Capture entire rooms
3. **Level Camera**: Keep horizon straight
4. **Declutter**: Remove personal items before shooting
5. **Multiple Angles**: 3-5 shots per room
6. **Exterior First**: Start with street view

#### Photo Order for Listings
1. Exterior/Street view (hero image)
2. Living areas
3. Kitchen
4. Bedrooms
5. Bathrooms
6. Special features (garden, pool, view)
7. Neighborhood/surroundings

### Writing Compelling Descriptions

#### Title Formula
[Property Type] + [Key Feature] + [Location]
Example: "Modern 3-Bedroom Villa with Sea View - Mount Lavinia"

#### Description Structure
1. Opening hook (unique selling point)
2. Property overview (size, rooms, type)
3. Key features (listed clearly)
4. Location benefits
5. Call to action

#### Words That Convert
✅ Use: Spacious, modern, prime, panoramic, serene, renovated
❌ Avoid: Nice, good, okay, cheap, distressed, motivated seller
        `,
        questions: [
            {
                id: 'q8-1',
                text: 'What is the best time of day to photograph properties?',
                options: [
                    'Early morning (6-8 AM)',
                    '10 AM - 2 PM for natural light',
                    'Evening (5-7 PM)',
                    'Night time for dramatic effect'
                ],
                correctAnswer: 1,
                explanation: 'Mid-day (10 AM - 2 PM) provides the best natural lighting for property photos.'
            },
            {
                id: 'q8-2',
                text: 'Which photo should typically be the "hero image" (first photo)?',
                options: [
                    'Bathroom',
                    'Kitchen',
                    'Exterior/Street view',
                    'Bedroom'
                ],
                correctAnswer: 2,
                explanation: 'The exterior/street view sets the first impression and should be the hero image.'
            },
            {
                id: 'q8-3',
                text: 'Which words should you AVOID in listing descriptions?',
                options: [
                    'Spacious and Modern',
                    'Cheap and Distressed',
                    'Panoramic and Serene',
                    'Prime and Renovated'
                ],
                correctAnswer: 1,
                explanation: 'Negative or desperate-sounding words like "cheap" and "distressed" reduce appeal.'
            },
            {
                id: 'q8-4',
                text: 'What should you do before photographing a property interior?',
                options: [
                    'Add more furniture',
                    'Declutter and remove personal items',
                    'Turn off all lights',
                    'Close all curtains'
                ],
                correctAnswer: 1,
                explanation: 'Decluttering makes spaces appear larger and helps buyers envision themselves there.'
            },
            {
                id: 'q8-5',
                text: 'What is the recommended title formula for listings?',
                options: [
                    'Price + Address',
                    'Property Type + Key Feature + Location',
                    'Just the address',
                    'Seller name + property'
                ],
                correctAnswer: 1,
                explanation: 'Property Type + Key Feature + Location creates compelling, informative titles.'
            }
        ]
    },

    // ========================================================================
    // MODULE 9: MARKET ANALYSIS & PRICING
    // ========================================================================
    {
        id: 'module-9',
        title: 'Market Analysis & Property Pricing',
        type: MODULE_TYPES.READING,
        description: 'Learn how to conduct comparative market analysis, determine fair property values, and advise clients on pricing strategies.',
        duration: '20 mins',
        estimatedTime: 30,
        category: 'skills',
        requiredScore: 85,
        timedQuiz: true,
        quizTimeLimit: 300,
        content: `
## Market Analysis & Property Pricing

### Part 1: Comparative Market Analysis (CMA)

A CMA compares your property to similar recently sold properties to determine fair market value.

#### Steps for Conducting a CMA:
1. **Identify Comparable Properties**
   - Same neighborhood (within 1-2 km)
   - Similar size (within 20%)
   - Similar property type
   - Sold within last 6 months

2. **Collect Data**
   - Sale prices
   - Property features
   - Condition at sale
   - Time on market

3. **Make Adjustments**
   - Add value for superior features
   - Subtract for deficiencies
   - Adjust for market changes

4. **Calculate Value Range**
   - Low: Conservative estimate
   - Mid: Most likely value
   - High: Optimistic scenario

### Part 2: Pricing Factors

#### Location Factors
- Road access quality
- Proximity to amenities
- School districts
- Flood/landslide risk
- Noise levels
- Future development plans

#### Property Factors
- Land size and shape
- Building age and condition
- Legal status (deed type)
- Special features
- Renovation status

#### Market Factors
- Current demand/supply
- Economic conditions
- Interest rates
- Seasonal patterns

### Part 3: Pricing Strategies

| Strategy | When to Use | Risk |
|----------|-------------|------|
| Market Price | Balanced market | Low |
| Above Market | Seller not in hurry | Long wait |
| Below Market | Quick sale needed | Leave money on table |
| Auction Style | High demand property | Unpredictable |

### Part 4: Common Pricing Mistakes

❌ Basing price only on owner's sentiment
❌ Ignoring recent comparable sales
❌ Not accounting for property condition
❌ Pricing too high then reducing repeatedly
❌ Using outdated data (>6 months old)
        `,
        questions: [
            {
                id: 'q9-1',
                text: 'What is a Comparative Market Analysis (CMA)?',
                options: [
                    'A government property valuation',
                    'Comparing your property to similar recently sold properties',
                    'A bank appraisal',
                    'An insurance assessment'
                ],
                correctAnswer: 1,
                explanation: 'CMA compares similar recently sold properties to estimate fair market value.'
            },
            {
                id: 'q9-2',
                text: 'How recent should comparable sales data be for a reliable CMA?',
                options: [
                    'Within the last 5 years',
                    'Within the last 6 months',
                    'Within the last 10 years',
                    'Any time period is fine'
                ],
                correctAnswer: 1,
                explanation: 'Comparable sales should be within 6 months for market relevance.'
            },
            {
                id: 'q9-3',
                text: 'Which is a common pricing mistake?',
                options: [
                    'Using recent comparable sales',
                    'Basing price only on owner\'s emotional attachment',
                    'Considering property condition',
                    'Analyzing market trends'
                ],
                correctAnswer: 1,
                explanation: 'Emotional pricing ignores market reality and leads to overpricing.'
            },
            {
                id: 'q9-4',
                text: 'If a property has superior features compared to comparables, you should:',
                options: [
                    'Price it lower',
                    'Add value in your price estimate',
                    'Ignore the differences',
                    'Use the same price as comparables'
                ],
                correctAnswer: 1,
                explanation: 'Superior features justify adjustments upward in your valuation.'
            },
            {
                id: 'q9-5',
                text: 'What is the risk of pricing above market value?',
                options: [
                    'Selling too quickly',
                    'Property may sit on market for extended time',
                    'Getting too many offers',
                    'No risk at all'
                ],
                correctAnswer: 1,
                explanation: 'Overpriced properties often linger on market, eventually selling below true value.'
            }
        ]
    },

    // ========================================================================
    // MODULE 10: FINAL CERTIFICATION ASSESSMENT
    // ========================================================================
    {
        id: 'module-10',
        title: 'Final Certification Assessment',
        type: MODULE_TYPES.READING,
        description: 'Comprehensive final assessment covering all training topics. Pass this to earn your LandSale.lk Agent Certification.',
        duration: '30 mins',
        estimatedTime: 45,
        category: 'certification',
        requiredScore: 90,
        timedQuiz: true,
        quizTimeLimit: 600, // 10 minutes
        content: `
## Final Certification Assessment

Congratulations on completing all training modules! This final assessment will test your comprehensive knowledge across all areas:

- Platform operations
- Legal requirements
- Client communication
- Ethics and compliance
- Market analysis
- Property presentation

### Certification Requirements
- Score: Minimum 90%
- Complete all previous modules
- Pass this final assessment

### What You've Learned
Throughout this training, you have mastered:

✓ Sri Lankan property law fundamentals
✓ Professional client communication
✓ Ethical conduct and compliance
✓ Property valuation techniques
✓ Platform tools and features
✓ Photography and listing optimization
✓ Negotiation strategies
✓ Market analysis methods

### After Certification
Upon passing, you will:
- Receive official LandSale.lk certification
- Get verified badge on your profile
- Access premium features
- Be eligible for priority lead distribution

Good luck!
        `,
        questions: [
            {
                id: 'q10-1',
                text: 'What is the typical stamp duty rate for property transfers in Sri Lanka?',
                options: ['1%', '3-4%', '10%', '15%'],
                correctAnswer: 1,
                explanation: 'Stamp duty is typically 3-4% of property value.'
            },
            {
                id: 'q10-2',
                text: 'Can foreigners directly own land in Sri Lanka?',
                options: [
                    'Yes, without restrictions',
                    'No, direct ownership is restricted',
                    'Only in Colombo',
                    'Only agricultural land'
                ],
                correctAnswer: 1,
                explanation: 'Foreigners cannot directly own land but have alternative options.'
            },
            {
                id: 'q10-3',
                text: 'Must you present ALL offers to a seller, even ones you think are too low?',
                options: [
                    'No, only reasonable offers',
                    'Yes, all offers must be presented',
                    'Only if the buyer insists',
                    'Only written offers'
                ],
                correctAnswer: 1,
                explanation: 'Presenting all offers is an ethical requirement.'
            },
            {
                id: 'q10-4',
                text: 'What should be your first step when evaluating a new property listing?',
                options: [
                    'Take photos immediately',
                    'Start marketing',
                    'Verify legal documents and ownership',
                    'Agree on commission'
                ],
                correctAnswer: 2,
                explanation: 'Always verify documents before any other activities.'
            },
            {
                id: 'q10-5',
                text: 'What is the consequence of repeated serious ethical violations?',
                options: [
                    'Warning letter',
                    'Small fine',
                    'Permanent ban and potential legal action',
                    'No consequence'
                ],
                correctAnswer: 2,
                explanation: 'Serious violations result in permanent bans and legal consequences.'
            },
            {
                id: 'q10-6',
                text: 'How recent should comparable sales data be for a reliable valuation?',
                options: ['1 year', '6 months', '5 years', '10 years'],
                correctAnswer: 1,
                explanation: 'Sales within 6 months are most relevant for current market conditions.'
            },
            {
                id: 'q10-7',
                text: 'Which photo should be the "hero image" for a property listing?',
                options: ['Bathroom', 'Kitchen', 'Exterior view', 'Utility room'],
                correctAnswer: 2,
                explanation: 'The exterior view creates the crucial first impression.'
            },
            {
                id: 'q10-8',
                text: 'What is NBRO certification used for?',
                options: [
                    'Property valuation',
                    'Land safety regarding natural hazards',
                    'Agent licensing',
                    'Tax calculation'
                ],
                correctAnswer: 1,
                explanation: 'NBRO certifies land safety, especially for landslide risks.'
            },
            {
                id: 'q10-9',
                text: 'If you suspect a document is fraudulent, you should:',
                options: [
                    'Ignore it',
                    'Report immediately to platform compliance',
                    'Proceed carefully',
                    'Ask the client to explain'
                ],
                correctAnswer: 1,
                explanation: 'Fraud must be reported immediately through proper channels.'
            },
            {
                id: 'q10-10',
                text: 'What deed type provides complete freehold ownership in Sri Lanka?',
                options: ['Jayabhoomi', 'Sinnakkara', 'Leasehold', 'State permit'],
                correctAnswer: 1,
                explanation: 'Sinnakkara is the freehold title with complete ownership rights.'
            }
        ]
    }
];

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Get or initialize training progress from localStorage
 */
export function getTrainingProgress() {
    if (typeof window === 'undefined') return { completedModules: [], badges: [], quizAttempts: {}, totalTimeSpent: 0 };

    const stored = localStorage.getItem('agent_training_progress');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        completedModules: [],
        badges: [],
        quizAttempts: {},
        scenarioProgress: {},
        totalTimeSpent: 0,
        startedAt: new Date().toISOString(),
        lastActivityAt: null,
        sessionModules: 0, // Track modules completed in current session
    };
}

/**
 * Save training progress
 */
export function saveTrainingProgress(progress) {
    if (typeof window === 'undefined') return;

    progress.lastActivityAt = new Date().toISOString();
    localStorage.setItem('agent_training_progress', JSON.stringify(progress));
}

/**
 * Record a quiz attempt
 */
export function recordQuizAttempt(moduleId, score, timeSpent) {
    const progress = getTrainingProgress();

    if (!progress.quizAttempts[moduleId]) {
        progress.quizAttempts[moduleId] = { attempts: 0, bestScore: 0, timeSpent: 0 };
    }

    const isRetake = progress.quizAttempts[moduleId].attempts > 0;
    progress.quizAttempts[moduleId].attempts++;
    progress.quizAttempts[moduleId].bestScore = Math.max(progress.quizAttempts[moduleId].bestScore, score);
    progress.quizAttempts[moduleId].timeSpent += timeSpent;
    progress.totalTimeSpent += Math.round(timeSpent / 60);

    // Knowledge Seeker badge for retakes
    if (isRetake && !progress.badges.includes('knowledge_seeker')) {
        progress.badges.push('knowledge_seeker');
    }

    saveTrainingProgress(progress);
    return progress.quizAttempts[moduleId];
}

/**
 * Mark module as completed and check for badge unlocks
 */
export function completeModule(moduleId, score, timeSpent) {
    const progress = getTrainingProgress();
    const module = TRAINING_MODULES.find(m => m.id === moduleId);

    if (!progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId);
        progress.sessionModules = (progress.sessionModules || 0) + 1;
    }

    // Check for badge unlocks
    const newBadges = [];

    // First module badge
    if (progress.completedModules.length === 1 && !progress.badges.includes('module_master')) {
        progress.badges.push('module_master');
        newBadges.push(BADGES.MODULE_MASTER);
    }

    // Perfect score badge
    if (score === 100 && !progress.badges.includes('perfect_score')) {
        progress.badges.push('perfect_score');
        newBadges.push(BADGES.PERFECT_SCORE);
    }

    // Quick learner (under 2 minutes for timed quiz)
    if (module?.timedQuiz && timeSpent < 120 && !progress.badges.includes('quick_learner')) {
        progress.badges.push('quick_learner');
        newBadges.push(BADGES.QUICK_LEARNER);
    }

    // Speed demon (3 modules in one session)
    if (progress.sessionModules >= 3 && !progress.badges.includes('speed_demon')) {
        progress.badges.push('speed_demon');
        newBadges.push(BADGES.SPEED_DEMON);
    }

    // Ethics champion (100% on ethics module)
    if (module?.id === 'module-6' && score === 100 && !progress.badges.includes('ethics_champion')) {
        progress.badges.push('ethics_champion');
        newBadges.push(BADGES.ETHICS_CHAMPION);
    }

    // Legal modules completed
    const legalModules = TRAINING_MODULES.filter(m => m.category === 'legal').map(m => m.id);
    if (legalModules.every(id => progress.completedModules.includes(id)) && !progress.badges.includes('legal_eagle')) {
        progress.badges.push('legal_eagle');
        newBadges.push(BADGES.LEGAL_EAGLE);
    }

    // Scenario solver
    const scenarioModules = TRAINING_MODULES.filter(m => m.type === MODULE_TYPES.SCENARIO).map(m => m.id);
    if (scenarioModules.every(id => progress.completedModules.includes(id)) && !progress.badges.includes('scenario_solver')) {
        progress.badges.push('scenario_solver');
        newBadges.push(BADGES.SCENARIO_SOLVER);
    }

    // All modules completed
    if (progress.completedModules.length === TRAINING_MODULES.length && !progress.badges.includes('certified_pro')) {
        progress.badges.push('certified_pro');
        newBadges.push(BADGES.CERTIFIED_PRO);
    }

    saveTrainingProgress(progress);

    return { progress, newBadges };
}

// ============================================================================
// CERTIFICATE GENERATION
// ============================================================================

/**
 * Generate certificate data for PDF
 */
export function generateCertificateData(agentName, completionDate) {
    const progress = getTrainingProgress();

    return {
        recipientName: agentName,
        completionDate: completionDate || new Date().toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        certificateNumber: `LSL-${Date.now().toString(36).toUpperCase()}`,
        modulesCompleted: progress.completedModules.length,
        totalModules: TRAINING_MODULES.length,
        badgesEarned: progress.badges,
        badges: progress.badges.map(b => {
            const badge = Object.values(BADGES).find(badge => badge.id === b);
            return badge?.name || b;
        }),
        totalTimeSpent: progress.totalTimeSpent,
        verificationUrl: `https://landsale.lk/verify/${Date.now().toString(36)}`,
    };
}

// ============================================================================
// APPWRITE INTEGRATION
// ============================================================================

/**
 * Sync progress to Appwrite (for persistence across devices)
 */
export async function syncProgressToCloud(userId) {
    try {
        const progress = getTrainingProgress();

        const agents = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [Query.equal('user_id', userId)]
        );

        if (agents.documents.length > 0) {
            await databases.updateDocument(
                DB_ID,
                COLLECTION_AGENTS,
                agents.documents[0].$id,
                {
                    training_progress: JSON.stringify(progress),
                    training_completed: progress.completedModules.length === TRAINING_MODULES.length,
                    verification_status: progress.completedModules.length === TRAINING_MODULES.length ? 'verified' : 'pending',
                }
            );
            return true;
        }
        return false;
    } catch (error) {
        console.error("Sync Error:", error);
        return false;
    }
}

/**
 * Mark agent as fully certified
 */
export async function certifyAgent(agentId) {
    try {
        await databases.updateDocument(
            DB_ID,
            COLLECTION_AGENTS,
            agentId,
            {
                verification_status: 'verified',
                certified_at: new Date().toISOString(),
            }
        );
        return true;
    } catch (error) {
        console.error("Certification Error:", error);
        throw error;
    }
}

/**
 * Get agent profile for certification status
 */
export async function getAgentProfile(userId) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [Query.equal('user_id', userId)]
        );
        return result.documents[0] || null;
    } catch (error) {
        console.error("Get Agent Error:", error);
        return null;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate overall training progress percentage
 */
export function getOverallProgress() {
    const progress = getTrainingProgress();
    return Math.round((progress.completedModules.length / TRAINING_MODULES.length) * 100);
}

/**
 * Check if a module is unlocked (previous modules completed)
 */
export function isModuleUnlocked(moduleIndex) {
    if (moduleIndex === 0) return true;
    const progress = getTrainingProgress();
    const previousModule = TRAINING_MODULES[moduleIndex - 1];
    return progress.completedModules.includes(previousModule.id);
}

/**
 * Get next recommended module
 */
export function getNextModule() {
    const progress = getTrainingProgress();
    for (const module of TRAINING_MODULES) {
        if (!progress.completedModules.includes(module.id)) {
            return module;
        }
    }
    return null;
}

/**
 * Format time spent for display
 */
export function formatTimeSpent(minutes) {
    if (!minutes || minutes === 0) return '0 mins';
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

/**
 * Get module by ID
 */
export function getModuleById(moduleId) {
    return TRAINING_MODULES.find(m => m.id === moduleId);
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category) {
    return TRAINING_MODULES.filter(m => m.category === category);
}

/**
 * Calculate estimated time to complete remaining modules
 */
export function getEstimatedTimeRemaining() {
    const progress = getTrainingProgress();
    const remainingModules = TRAINING_MODULES.filter(m => !progress.completedModules.includes(m.id));
    const totalMinutes = remainingModules.reduce((sum, m) => sum + m.estimatedTime, 0);
    return formatTimeSpent(totalMinutes);
}
