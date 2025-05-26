# Development Session Prompt

Please help me continue developing the SIM (SynMax Intelligence Marketplace) project by following this systematic workflow:

## 1. Check Current Status
- Read `workflow/IMPLEMENTATION-PLAN.md` to understand the current project status and priorities
- Identify the next uncompleted task from the priority list
- Review any related documentation for that task
- Check `workflow/CHANGES.md` for recent changes and context
- Review `workflow/DECISIONS.md` for architectural decisions that may impact your approach

## 2. Pre-Implementation Requirements
Before implementing any new feature or change:

### 2.1 Documentation Review
- Review relevant documentation in `/docs/` for the feature area
- Check `CLAUDE.md` for project-specific instructions
- Verify design patterns in `/docs/architecture/` and `/docs/standards/`
- Ensure consistency with `docs/prd.md` requirements

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
- Write a brief implementation approach in DECISIONS.md before coding
- List any architectural decisions or trade-offs
- Identify which existing tests might be affected

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

### 4.3 Codebase Analysis
1. **Delete the old** `workflow/CODEBASE_ANALYSIS.md` (it's now defunct)
2. **Perform comprehensive analysis** and create new `workflow/CODEBASE_ANALYSIS.md`
3. **Focus analysis on**:
   - How the new changes integrate with existing code
   - Any new patterns or anti-patterns introduced
   - Test coverage improvements
   - Potential areas of technical debt
   - Performance implications

### 4.4 Update Implementation Plan
1. **Update `workflow/IMPLEMENTATION-PLAN.md`**:
   - Mark completed items with [x]
   - Add any new tasks discovered during implementation
   - Adjust priorities based on findings
   - Update timelines if needed

### 4.5 Summary Report
Provide a summary including:
- What was implemented (brief description)
- Tests added (list test files and what they cover)
- Test coverage delta (e.g., "55% → 58%")
- Documentation updates made
- Any architectural decisions and rationale
- Issues or bugs discovered and fixed
- Technical debt introduced (if any)
- Next recommended steps
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
- **NEVER implement code without tests first**
- **ALWAYS verify tests fail before implementing**
- **NEVER decrease test coverage**
- **ALWAYS update CHANGES.md and DECISIONS.md**
- **ALWAYS run full test suite before marking complete**
- **ALWAYS complete the full Post-Implementation Process**

Please begin by checking the current status and identifying the next priority task.