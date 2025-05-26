# Development Session Prompt

Please help me continue developing the SIM (SynMax Intelligence Marketplace) project by following this systematic workflow:

## Critical Principles (READ FIRST)

### NO BACKWARDS COMPATIBILITY
**We have ZERO users. Always refactor to the ideal solution.**
- Never compromise architecture for compatibility
- If existing code isn't perfect, replace it entirely
- Choose first-principles solutions over incremental patches
- Build as if starting fresh with perfect knowledge

## 1. Check Current Status & Validate Plan Trustworthiness

### 1.1 Read Current State
- Read `workflow/IMPLEMENTATION-PLAN.md` to understand the current project status and priorities
- Check `workflow/CHANGES.md` for recent changes and context
- Review `workflow/DECISIONS.md` for architectural decisions that may impact your approach

### 1.2 Review Related Documentation
- Review all documentation related to your task
- Ensure you understand not just WHAT to build but WHY

## 2. Pre-Implementation Requirements
Before implementing any new feature or change:

### 2.1 Documentation Review (Read Everything Relevant)
- Review ALL relevant documentation in `/docs/` for the feature area
- Check `CLAUDE.md` for project-specific instructions
- Study design patterns in `/docs/architecture/` and `/docs/standards/`
- Read the PRD section for your feature 2-3 times
- If documentation is unclear or conflicting, resolve BEFORE coding

### 2.2 Existing Code Analysis
- Search for similar features/patterns (use 5+ different search strategies)
- Study how similar problems were solved elsewhere
- Identify the established patterns you should follow
- Note any patterns you think should be improved (document why)

### 2.2 Test-First Development (MANDATORY)
**No new code without tests. Period.**
- Write failing tests FIRST for the feature/fix you're about to implement
- Tests must cover:
  - Happy path scenarios
  - Error cases and edge conditions
  - Integration with existing features if applicable
- Place tests in appropriate locations:
  - Unit tests: Adjacent to the code being tested or in `tests/unit/`
  - Integration tests: In `tests/integration/`
- Run tests to ensure they fail for the right reasons
- Only then proceed with implementation

### 2.3 Implementation Planning
- Think through your implementation approach before coding
- List any architectural decisions or trade-offs
- Identify which existing tests might be affected
- (You'll document decisions in DECISIONS.md after implementation)

## 3. Implementation Standards
Build with these qualities in mind:
- **Test-Driven**: Tests written before code, 100% coverage for new code
- **World-class**: Follow industry best practices
- **Maintainable**: Clear code structure, comprehensive types
- **Extendable**: Modular design, clear interfaces
- **Performant**: Optimize for speed and efficiency
- **Elegant**: Clean, readable, DRY code
- **Documentation Adherence**: Consistently cross-reference the `/docs` folder

If documentation is lacking:
- Clearly state what needs updating and why
- Update documentation BEFORE implementing
- Ensure code matches updated documentation
- Record the documentation change in CHANGES.md

## 4. Post-Implementation Process
After completing each task:

### 4.1 Quality Verification
1. **Run ALL tests** (not just your new ones):
   ```bash
   npm run test
   npm run test:coverage
   ```
   - Ensure all tests pass
   - Verify coverage increased (never decreased)
   - Document coverage change in CHANGES.md

2. **Run quality checks**:
   ```bash
   npm run lint
   npm run typecheck  
   npm run format
   ```
   - Fix any errors that arise

3. **Cross-reference documentation** to verify consistency
   - This is critically important!! We need our codebase to be consistent and world-class and maintaining those standards at scale requires thorough cross-referencing of documentation and validation that changes are consistent with the project.

### 4.2 Update Historical Records
1. **Update CHANGES.md**:
   - Add entry with date, task completed, and key changes
   - List all files modified/added/deleted
   - Note test coverage before and after
   - Document any bugs fixed or issues discovered
   - Include rollback command

2. **Update DECISIONS.md**:
   - Document any architectural decisions made
   - Explain why certain approaches were chosen
   - Note any technical debt incurred
   - Record any patterns introduced or modified

### 4.3 Exhaustive Codebase Analysis (Use Infinite Compute)

**Mindset**: We have unlimited compute. Be EXHAUSTIVE in analysis to maintain world-class code quality.

1. **Delete the old** `workflow/CODEBASE_ANALYSIS.md` (it's now defunct)
2. **Perform EXHAUSTIVE multi-pass analysis** and create new `workflow/CODEBASE_ANALYSIS.md`

#### Required Analysis Passes:

##### Pass 1: Pattern Consistency Check
- Search for 10+ variations of similar functionality to what you just built
- Verify naming matches existing patterns EXACTLY
- Confirm error handling matches similar code
- Check test patterns match similar features
- Flag ANY inconsistencies, no matter how small

##### Pass 2: Documentation Alignment Verification
- Re-read the PRD section for this feature
- Re-read architecture docs for this area
- Re-read ALL relevant coding standards
- Verify EVERY behavior matches documentation
- List any deviations and justify each one explicitly

##### Pass 3: Redundancy and Overlap Analysis
- Search entire codebase for similar functions/components (try 5+ search terms)
- Check for duplicate type definitions
- Look for overlapping responsibilities
- Verify no parallel implementations exist
- If found, document why yours is necessary or refactor to use existing

##### Pass 4: Deep Dependency Analysis
- Trace ALL import paths for circular dependencies
- Verify proper layering (UI → features → services)
- Ensure no shortcuts were taken
- Check that new code doesn't break existing patterns

##### Pass 5: Code Quality Deep Dive
- ZERO tolerance for 'any' types (unless explicitly justified)
- Verify ALL error states are handled
- Check loading states are consistent with rest of app
- Ensure accessibility requirements are met
- Confirm performance patterns match existing code

##### Pass 6: The Fresh Eyes Test
- Read your code as if you're a new senior engineer
- List anything that would make someone go "wtf?"
- Note any "clever" code that should be simplified
- Check if a world-class team would be proud of this code

##### Pass 7: Integration Impact Analysis
- How do the new changes integrate with existing code?
- What existing code might be affected?
- Are there any breaking changes?
- Do any other components need updates?

**If ANY check fails**: Fix immediately before proceeding. Do not rationalize or defer.

### 4.4 Update Implementation Plan (Incremental Refinement)

**Mindset**: The plan should ALWAYS reflect current reality. Small, continuous updates keep it trustworthy.

1. **Update `workflow/IMPLEMENTATION-PLAN.md`** based on learnings:
   - Mark completed items with [x]
   - **Critical**: Did you discover anything that changes the immediate next step?
   - Add any prerequisites you discovered
   - Adjust the plan minimally to reflect new knowledge
   - If you find yourself wanting to rewrite large sections, something was missed in earlier updates

2. **Validate Plan Coherence**:
   - Read the updated plan from start to finish
   - Would a new developer understand what to work on next and why?
   - Does the next task address the most pressing current need?
   - If the plan feels off, you've likely discovered accumulated drift - fix it

3. **Document the Delta**:
   - What specifically changed in the plan?
   - Why did it change?
   - This helps track if the plan is drifting over time

### 4.5 Summary Report with Learnings
Provide a comprehensive summary including:

#### Implementation Summary
- What was implemented (brief description)
- Tests added (list test files and what they cover)
- Test coverage delta (e.g., "55% → 58%")
- Documentation updates made

#### Key Learnings (CRITICAL SECTION)
- What did we learn about the codebase?
- What assumptions were proven wrong?
- What was harder/easier than expected?
- What patterns emerged?
- What technical debt did we discover (not introduce)?

#### Quality Attestation
- Confirm ALL analysis checks passed
- List any patterns you reinforced
- Note any inconsistencies you fixed
- State: "This code meets world-class standards" (or explain why not)

#### Decisions & Rationale
- Architectural decisions made and why
- Trade-offs considered
- Why this approach vs alternatives

#### Next Steps
- Based on learnings, what should we do next?
- Does the planned next step still make sense?
- Any new prerequisites discovered?
- If UI/UX changed, navigation path to view changes

## 5. Expected Response Format
Your response should follow this structure:

```
## Task: [Task name from IMPLEMENTATION-PLAN.md]

### Pre-Implementation Review
- Documentation reviewed: [list docs]
- Related decisions considered: [from DECISIONS.md]
- Test approach: [brief description]

### Tests Written
- [List of test files created/modified]
- Coverage areas: [what the tests validate]

### Implementation
[Code changes made]

### Post-Implementation Results
- Tests: ✅ All passing (X total, Y new)
- Coverage: X% → Y% (delta: +Z%)
- Lint/Type/Format: ✅ Clean
- Documentation updated: [list]

### Changes Summary
[What will go in CHANGES.md]

### Decisions Made
[What will go in DECISIONS.md]

### Next Steps
[Recommendations based on analysis]
```

### Implementation-Plan changes
[Natural language summary of how you updated IMPLEMENTATION-PLAN.md to include the Next Steps you listed above]
- If we have a fully complete implementation with all checks passing then we can move on to the next implementation step
- If not, we need to add steps to our implementation plan that will get us there
- The first unchecked box on the implementation plan should always been the next thing that we focus our attention on

## Critical Reminders

### Non-Negotiable Quality Standards
- **NEVER implement code without tests first**
- **ALWAYS verify tests fail before implementing**
- **NEVER decrease test coverage**
- **ALWAYS update CHANGES.md and DECISIONS.md**
- **ALWAYS run full test suite before marking complete**
- **ALWAYS complete the FULL Post-Implementation Process**

### Architectural Integrity
- **ALWAYS make the choice that leads to the highest quality codebase from first-principles**
- **ALWAYS ensure our work aligns with the PRD in `docs/prd.md`**
- **ALWAYS ensure our work aligns with our documentation**
- **NEVER introduce patterns inconsistent with existing code**
- **NEVER copy-paste without understanding and adapting**
- **REMEMBER that we do not need to be backwards compatible**

### Use Infinite Compute Mindset
- **Spend 80% of time analyzing, 20% implementing**
- **Run EVERY analysis check, even if it seems redundant**
- **Search for similar code in 10+ different ways**
- **Read relevant docs multiple times to ensure alignment**
- **When in doubt, analyze more deeply**

### Plan Maintenance
- **The implementation plan should ALWAYS reflect current reality**
- **Small, frequent updates prevent drift**
- **Trust the plan if it's being maintained properly**
- **Fix drift immediately when discovered**

## The Continuous Improvement Loop

This process is designed as a continuous loop where:
1. **The plan is always trustworthy** because it's constantly maintained
2. **Code quality never degrades** because we analyze exhaustively  
3. **Technical debt is prevented** not fixed later
4. **Documentation stays aligned** through continuous verification
5. **Patterns stay consistent** through rigorous checking

When this process is followed properly:
- You should rarely need major plan rewrites
- The codebase should always look professionally crafted
- New developers should be able to understand everything
- Technical debt should be near zero

## What To Do When Analysis Finds Issues

**If you discover inconsistencies/problems during analysis:**
1. STOP - Do not proceed with new work
2. Document the issue in DECISIONS.md
3. Fix the issue IMMEDIATELY
4. Update any affected documentation
5. Run the full analysis again
6. Only proceed when codebase is pristine

**Common issues and fixes:**
- Duplicate implementations → Consolidate to one
- Inconsistent patterns → Update to match majority
- Documentation drift → Update docs to match code
- Circular dependencies → Refactor architecture
- Missing tests → Write them now

Please begin by checking the current status and identifying the next priority task.