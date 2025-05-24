# Development Session Prompt

Please help me continue developing the SIM (SynMax Intelligence Marketplace) project by following this systematic workflow:

## 1. Check Current Status
- Read `workflow/IMPLEMENTATION-PLAN.md` to understand the current project status and priorities
- Identify the next uncompleted task from the priority list
- Review any related documentation for that task

## 2. Adhere to Documentation
Before implementing:
- Review relevant documentation in `/docs/` for the feature area
- Check `CLAUDE.md` for project-specific instructions
- Verify design patterns in `/docs/architecture/` and `/docs/standards/`
- Ensure consistency with `docs/prd.md` requirements

## 3. Implementation Standards
Build with these qualities in mind:
- **World-class**: Follow industry best practices
- **Maintainable**: Clear code structure, comprehensive types
- **Extendable**: Modular design, clear interfaces
- **Performant**: Optimize for speed and efficiency
- **Elegant**: Clean, readable, DRY code
- **Documentation Adherence**: Consistently cross-reference the `/docs` folder to ensure that everything you're writing is consistent with our docs.

If documentation is lacking:
- Clearly state what needs updating and why
- Update documentation BEFORE implementing
- Ensure code matches updated documentation

## 4. Post-Implementation Process
After completing each task:
1. **Cross-reference documentation** to verify consistency
2. **Run quality checks**:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run format`
3. **Perform codebase analysis**:
   - Perform a comprehensive codebase analysis like the one in `workflow/CODEBASE_ANALYSIS.md`
   - Overwrite CODEBASE_ANALYSIS.md to contain the results of the new analysis
3. **Update steps in `workflow/IMPLEMENTATION-PLAN.md`**:
   - Mark completed items with [x]
   - Review the newly created `workflow/CODEBASE_ANALYSIS.md`
   - Add any new tasks discovered
   - Determine if any future tasks need to be modified
4. **Summarize what was done**:
   - What was implemented
   - Any documentation updates made
   - Any issues or considerations found
   - Summarize the CODEBASE_ANALYSIS
5. **Wait for approval** before proceeding to the next task

## Expected Response Format
1. State which task you're working on from `workflow/IMPLEMENTATION-PLAN.md`
2. Review relevant documentation
3. Implement the feature
4. Update documentation/plan as needed
5. Provide summary and wait for feedback

Please begin by checking the current status and identifying the next priority task.