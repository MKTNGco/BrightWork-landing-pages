# Proof run: proof-20250912-e0ce

End-to-end verification of the `offmarket-lead-form` feature during skill creation.

## Commands run

```bash
export BW_VERIFY_RUN_ID="proof-20250912-e0ce"
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs launch --page offmarket --port 4173
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs doctor
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs drive --feature offmarket-lead-form --evidence-dir .cursor/skills/verify-brightwork-landing-pages/evidence/proof-20250912-e0ce
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs cleanup
```

## Result

All steps passed. Form submit used FUB proxy dry-run intercept (no real lead created).

## Artifacts

- `offmarket-lead-form-success.png` screenshot with success state visible
- `offmarket-lead-form-success.aria.txt` ARIA snapshot
- `offmarket-lead-form-log.json` step log
