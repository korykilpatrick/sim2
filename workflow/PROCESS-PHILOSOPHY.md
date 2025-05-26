# Process Philosophy

This document explains the WHY behind our development process. Read this when you need to make judgment calls about how to apply the process.

## Core Beliefs

### 1. Compute is Cheap, Technical Debt is Expensive
We operate under the assumption of **infinite compute**. We would rather spend 10x more time analyzing than introduce even small inconsistencies. Why? Because:
- Technical debt compounds exponentially
- Inconsistencies confuse developers and AI alike
- Fixing problems later is 100x more expensive than preventing them
- A pristine codebase enables confident, rapid development

### 2. The Plan Should Always Be Trustworthy
If maintained properly, the implementation plan should be:
- An accurate reflection of what needs to be done next
- Based on actual learnings, not original assumptions
- Updated incrementally with each session
- Something a new developer can follow without context

**If you find yourself wanting to rewrite the plan, something went wrong in previous maintenance.**

### 3. Documentation Alignment is Sacred
Every line of code should be traceable to documentation:
- PRD defines WHAT we build
- Architecture docs define HOW we build
- Standards define PATTERNS we follow
- If code doesn't match docs, either code or docs must change
- Silent divergence is unacceptable

### 4. Consistency Trumps Cleverness
When faced with choices:
- Boring consistency > clever uniqueness
- Established patterns > marginally better alternatives
- Team conventions > personal preferences
- Predictability > optimization (unless performance is critical)

### 5. Analysis is Investment, Not Overhead
The 80/20 rule: Spend 80% of time analyzing, 20% implementing
- Analysis prevents bugs
- Analysis maintains consistency  
- Analysis discovers issues early
- Analysis is documentation
- Analysis improves understanding

## Process Principles

### Incremental Refinement
- Small changes, continuously integrated
- Plan updates after each learning
- Documentation updates as you go
- Never batch updates for "later"

### Exhaustive Verification
When checking for similar code:
- Don't stop at the first search
- Try multiple search terms
- Look in unexpected places
- Assume it exists until proven otherwise

### Fresh Eyes Test
Always ask: "Would a senior engineer joining tomorrow understand and approve?"
- No "you had to be there" code
- No unexplained cleverness
- No shortcuts without documentation
- No "temporary" solutions

### Zero Tolerance for Drift
The moment you notice:
- Documentation doesn't match code
- Patterns are inconsistent
- Tests are missing
- The plan seems off

**STOP and fix it.** Don't add to the problem.

## First Principles Over Backwards Compatibility

**CRITICAL: We have ZERO users. There is no backwards compatibility to maintain.**

This principle fundamentally shapes every architectural decision:
- **Always choose the architecturally correct solution** - No compromises for compatibility
- **Refactor fearlessly** - If the current approach isn't ideal, change it completely
- **Eliminate all tech debt immediately** - Don't work around problems, fix them
- **Build for the future, not the past** - Every decision should assume a clean slate
- **Gold standard reference implementation** - This codebase should exemplify best practices

When you find yourself thinking "but this would break existing..."—STOP. We have no existing users. The only thing that matters is delivering a world-class final product. Every line of code should be what you'd write if you were starting fresh with perfect knowledge.

## Anti-Patterns to Avoid

### 1. "I'll Document It Later"
Later never comes. Document as you go or not at all.

### 2. "This Is Just a Quick Fix"
There are no quick fixes. Do it right or don't do it.

### 3. "The Tests Can Come After"
Tests come first. No exceptions. Ever.

### 4. "It's Similar Enough"
Similar isn't same. Match exactly or document why not.

### 5. "We Can Refactor Later"
If you're not proud of it now, don't commit it.

### 6. "This Maintains Backwards Compatibility"
We have ZERO users. Choose the ideal solution, not the compatible one.

## Success Metrics

You know the process is working when:
- New features slot in cleanly without refactoring
- The plan accurately predicts what needs doing
- Code reviews would have zero architectural concerns
- Any developer can understand any part of the codebase
- Technical debt stays near zero
- Adding features gets easier over time, not harder

## The Ultimate Test

Before committing any code, ask:
> "Is this code I would proudly show as an example of my best work?"

If the answer isn't an immediate "yes," use more compute to analyze and improve.

## Remember

We're not building a prototype or MVP. We're building a **world-class production system** that will be maintained and extended for years. Every decision should reflect that level of quality.

When in doubt:
- Analyze more deeply
- Match existing patterns more closely
- Document more thoroughly
- Test more completely
- Refactor more boldly

The process exists to ensure every line of code contributes to a codebase we're proud of.