# Release Checklist ✅

Use this checklist before every production release to ensure quality and minimize risk.

---

## Pre-Release Checklist

### Code Quality
- [ ] All feature branches merged to `main` via approved PRs
- [ ] No open PRs with "blocking" or "critical" labels
- [ ] All merge conflicts resolved
- [ ] Code review completed by at least one team member

### Automated Checks
- [ ] CI pipeline passing (green checkmark)
- [ ] Lint check passing
- [ ] Build verification passing
- [ ] All automated tests passing (when implemented)

### Manual Verification (Staging)
- [ ] Deployed to staging environment
- [ ] Critical user flows tested:
  - [ ] User registration/login
  - [ ] Property listing creation
  - [ ] Property search and filters
  - [ ] Payment flow (sandbox mode)
  - [ ] Agent dashboard access
- [ ] No console errors in browser
- [ ] Mobile responsive design verified

### Documentation
- [ ] Release notes prepared
- [ ] Any API changes documented
- [ ] CHANGELOG updated (if maintained)

---

## Release Process

### 1. Final Verification
```bash
# Ensure local is up to date
git checkout main
git pull origin main

# Verify build locally
npm run build
```

### 2. Create Release Tag (Optional)
```bash
# Semantic versioning: MAJOR.MINOR.PATCH
git tag -a v1.x.x -m "Release v1.x.x: Brief description"
git push origin v1.x.x
```

### 3. Deploy
Push to `main` triggers automatic deployment via GitHub Actions.

```bash
git push origin main
```

### 4. Monitor Deployment
- [ ] Watch GitHub Actions workflow
- [ ] Verify functions deployed successfully
- [ ] Verify site deployed successfully

---

## Post-Release Checklist

### Immediate (Within 5 minutes)
- [ ] Smoke test production site
  - [ ] Home page loads
  - [ ] Login works
  - [ ] One listing visible
- [ ] Check Appwrite Console for function health
- [ ] Monitor for error spikes (github-logger issues)

### Short-term (Within 1 hour)
- [ ] Notify stakeholders of successful release
- [ ] Monitor user-reported issues
- [ ] Check performance metrics

### Documentation
- [ ] Update roadmap if features completed
- [ ] Close related GitHub issues
- [ ] Update any external documentation

---

## Rollback Procedure

If critical issues are discovered post-release:

### Quick Rollback (< 5 minutes)
```bash
# Revert the last commit
git revert HEAD --no-edit
git push origin main

# This triggers a new deployment with the previous state
```

### Manual Rollback (Specific version)
```bash
# Find the last known good commit
git log --oneline -10

# Reset to that commit (replace COMMIT_HASH)
git checkout COMMIT_HASH -- .
git commit -m "Rollback to COMMIT_HASH"
git push origin main
```

### Function-Specific Rollback
```bash
# Via Appwrite Console:
# 1. Go to Functions → Select Function
# 2. Go to Deployments tab
# 3. Activate a previous deployment
```

---

## Emergency Contacts

| Role | Responsibility |
|------|----------------|
| **Tech Lead** | Rollback decision |
| **DevOps** | Infrastructure issues |
| **Product Owner** | Stakeholder communication |

---

## Release Notes Template

```markdown
## Release v[X.Y.Z] — [Date]

### 🚀 New Features
- Feature description

### 🐛 Bug Fixes
- Fix description

### 🔧 Improvements
- Improvement description

### ⚠️ Breaking Changes
- None / Description

### 📝 Notes
- Additional context
```

---

*Last Updated: December 2025*
