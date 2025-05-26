# Workflow Quick Reference

## Before Starting ANY Work
1. Read `/workflow/IMPLEMENTATION-PLAN.md` - What's next?
2. Ask: "Does this next task make sense given current state?"
3. If no, update plan first

## The Core Loop

### 1. Implement
- Read ALL related docs first
- Search for similar code (5+ ways)
- Write tests FIRST
- Code to pass tests
- Match existing patterns EXACTLY

### 2. Analyze (Use Infinite Compute!)
Run ALL these checks:
- [ ] Pattern consistency (search 10+ ways)
- [ ] Documentation alignment 
- [ ] No redundancy/duplication
- [ ] No circular dependencies
- [ ] Zero 'any' types
- [ ] Would senior engineer approve?

### 3. Update
- Update IMPLEMENTATION-PLAN.md with learnings
- Update CHANGES.md with what you did
- Update DECISIONS.md with why
- Small, incremental changes

## Red Flags - STOP if you see:
- 🚨 Plan doesn't match reality
- 🚨 Similar code already exists
- 🚨 Pattern doesn't match existing
- 🚨 Documentation conflicts with code
- 🚨 Tests missing or failing
- 🚨 You're not proud of the code

## Key Metrics
- Time split: 80% analyzing, 20% coding
- Test coverage: Never decrease
- Pattern matches: 100% consistent
- Documentation drift: Zero tolerance

## The Ultimate Test
"Is this code I would proudly show as an example of my best work?"

If no → Analyze more, refactor more, test more

---
Full details in `/workflow/PROMPT.md`