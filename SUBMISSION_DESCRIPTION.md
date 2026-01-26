# Pennywise Coach - Hackathon Submission

## Project Overview

**Pennywise Coach** is an AI-powered financial health assistant designed to help people understand their spending patterns, build healthier money habits, and make confident financial decisions through calm, non-judgmental guidance. Unlike traditional financial apps that overwhelm users with charts and jargon, Pennywise Coach translates complex spending data into plain language insights and provides supportive, actionable coaching.

## Problem Statement

Financial anxiety is a widespread issue. Many people struggle to understand their spending patterns, feel overwhelmed by complex financial tools, and lack access to affordable financial coaching. Traditional budgeting apps often use intimidating charts, financial jargon, and judgmental language that increases anxiety rather than reducing it.

## Solution & Approach

We built a web-based application that combines AI-powered analysis with empathetic design to create a calm, supportive financial coaching experience. The core philosophy is **clarity over complexity, support over shame**.

### Key Differentiators

1. **Plain Language AI**: All financial insights are generated in conversational, jargon-free language
2. **Non-Judgmental Tone**: The AI coach is trained to be supportive and encouraging, never shaming
3. **Context-Aware Guidance**: Responses are personalized based on user goals, concerns, and recent transaction patterns
4. **Measurable Quality**: Every AI response is evaluated and tracked using Opik for continuous improvement

## Technical Implementation

### Architecture

**Frontend:**
- Next.js 14 (App Router) with React 18 and TypeScript
- Tailwind CSS v4 for styling with a custom design system
- Framer Motion for smooth animations
- Fully responsive design (mobile-first approach)

**Backend & Data:**
- Supabase for authentication and PostgreSQL database
- RESTful API routes for AI interactions
- Client-side state management with React hooks

**AI Integration:**
- Hugging Face Inference API with `meta-llama/Llama-3.1-8B-Instruct` model
- Custom prompt engineering with versioned templates (v1, v2, v3)
- Structured JSON output for consistent parsing
- Robust error handling with timeout (30s) and retry logic (2 retries with exponential backoff)
- Graceful fallbacks to rule-based responses when AI fails

**Observability:**
- Opik integration for experiment tracking and evaluation
- Comprehensive trace logging for all AI interactions
- Automated evaluation system for response quality

### Core Features

1. **User Onboarding**: Captures income range, financial goals, concerns, and currency preferences
2. **Dashboard**: 
   - Real-time spending summary cards (income, expenses, net)
   - Category breakdown with visual progress bars
   - Recent transactions list with edit/delete functionality
   - AI-powered spending analysis panel with patterns, anomalies, and suggestions
3. **AI Coach**: Conversational interface with:
   - Context-aware responses based on user profile and recent transactions
   - Conversation history persistence
   - Structured responses with key points and suggested actions
4. **Insights**: Daily and weekly AI-generated financial insights with:
   - Personalized observations
   - Actionable suggestions
   - Goal-aligned guidance
5. **Settings**: Update preferences and profile information anytime

## Opik Integration (Best Use of Opik)

We've implemented a comprehensive Opik-based evaluation and experiment tracking system:

### Trace Logging
Every AI interaction (coach responses, insights, spending analysis) logs a trace with:
- Input payload (user context, transactions, questions)
- Prompt version and model version
- Output response and structured data
- Timing metrics (latency)
- Evaluation scores

### Automated Evaluation
Each AI response is automatically evaluated on:
- **Clarity** (0-10): How clear and understandable is the response?
- **Helpfulness** (0-10): How actionable and realistic is the advice?
- **Tone** (0-10): Is the response supportive and non-judgmental?
- **Financial Alignment** (0-10): Does it align with user goals/concerns?
- **Safety Flags**: Detects investment advice, guarantees, or risky suggestions

### Experiment System
We built a complete experiment runner (`lib/opik/experiments.ts`) that:
- Runs experiments on a fixed evaluation dataset (5 scenarios)
- Compares prompt versions side-by-side
- Generates summary statistics (average scores, safety flags, latency)
- Provides API endpoints for running and comparing experiments
- Tracks AI usage rates and fallback scenarios

### Evaluation Dataset
Created a fixed dataset of 5 real-world scenarios:
1. Overspending in dining category
2. Irregular income month
3. Low emergency fund with upcoming expense
4. High subscription creep
5. General "what should I do next?" guidance

### Prompt Versioning
Implemented three prompt versions:
- **v1-baseline**: Simple, straightforward prompts
- **v2-improved**: Enhanced with more structure and empathy
- **v3-structured-json**: Structured JSON output with explicit guidelines

All prompts are versioned and tracked, allowing us to measure improvements and iterate based on evaluation data.

## Development Process

### Phase 1: Foundation
- Set up Next.js project with TypeScript
- Implemented Supabase authentication and database schema
- Created responsive UI components with Tailwind CSS
- Built landing page and authentication flows

### Phase 2: AI Integration
- Integrated Hugging Face Inference API
- Implemented prompt engineering system with versioning
- Built robust error handling and retry logic
- Created fallback systems for graceful degradation

### Phase 3: Opik Integration
- Implemented trace logging for all AI calls
- Built automated evaluation system
- Created experiment runner and comparison utilities
- Set up evaluation dataset and metrics tracking

### Phase 4: Quality Improvements
- Enhanced prompt quality (v3 structured JSON)
- Improved JSON parsing robustness
- Added evaluation hooks for insights
- Standardized error messages and user feedback

### Phase 5: Mobile Responsiveness
- Added mobile navigation menus (hamburger)
- Optimized layouts for all screen sizes
- Improved touch targets and spacing
- Ensured no horizontal scrolling on mobile

## Key Achievements

1. **Production-Ready AI Integration**: Robust Hugging Face integration with timeout, retry, and fallback mechanisms
2. **Comprehensive Opik Integration**: Full experiment tracking, evaluation, and comparison system
3. **Quality Assurance**: Automated evaluation of every AI response for safety and quality
4. **User Experience**: Calm, supportive design that reduces financial anxiety
5. **Mobile-First**: Fully responsive design tested across devices
6. **Clean Architecture**: Well-organized codebase following best practices

## Technical Highlights

- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Error Handling**: User-friendly error messages with graceful fallbacks
- **Performance**: Optimized API calls with caching and efficient state management
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast ratios
- **Security**: Secure authentication, input validation, safe AI prompt handling

## Future Enhancements

- Connect to real bank accounts via Plaid or similar
- Add more sophisticated spending pattern detection
- Implement goal tracking with progress visualization
- Expand evaluation dataset for more comprehensive testing
- Add human-in-the-loop evaluation for continuous improvement

## Conclusion

Pennywise Coach demonstrates how AI can be used responsibly to provide financial guidance that is both helpful and empathetic. By combining thoughtful prompt engineering, comprehensive evaluation tracking with Opik, and a user-centered design approach, we've created a tool that genuinely reduces financial anxiety while providing actionable insights.

The Opik integration allows us to prove that our AI system improves over time through systematic experimentation and evaluation, making this a strong candidate for the "Best Use of Opik" track.

---

**Tech Stack**: Next.js, React, TypeScript, Tailwind CSS, Supabase, Hugging Face Inference API, Opik
**Repository**: [Your repo URL]
**Live Demo**: [Your demo URL]
