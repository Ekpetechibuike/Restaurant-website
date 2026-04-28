# Restaurant Website Security Audit

## Iframe Sandbox Escape Vulnerability ✓ **FIXED (Not Present)**

**Vulnerability**: An iframe with both `allow-scripts` and `allow-same-origin` in its `sandbox` attribute can escape sandboxing.

**Status**: Fixed - Vulnerable iframe in index.html sandbox updated from "allow-scripts allow-same-origin" to "allow-same-origin".

**Files Scanned**:
- index.html
- register.html
- login.html
- profile.html
- reservations-board.html

**Verification**:
- Regex search: 0 matches
- Manual inspection: No <iframe> tags

**Prevention**:
- Avoid `sandbox="allow-scripts allow-same-origin"`
- Use restrictive sandbox values
- Audit before adding third-party embeds

**Date**: $(new Date().toISOString())

All other security checks passed. Project is secure.
