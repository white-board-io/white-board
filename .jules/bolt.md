## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Plan Verification Rules
**Learning:** Plans will be rejected for "Groundedness Rule" violations if you try to optimize a file after only partially reading it (e.g., if a `read_file` or `cat` command truncated the output). You must see the exact method structure.
**Action:** Use `grep -A 50 "methodName" filePath` to retrieve full method bodies before proposing optimizations in a plan.
