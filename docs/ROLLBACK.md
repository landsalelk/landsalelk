# Manual Rollback Procedure ↩️

In the event of a critical failure in production, follow these steps to revert changes safely.

## 1. Identify the Bad Commit 🛑
1.  Go to the [GitHub Repository](https://github.com/landsalelk/landsalelk).
2.  Click on **Commits** (clock icon).
3.  Identify the commit hash (SHA) that introduced the issue.

## 2. Revert via GitHub (Recommended) 🖱️
1.  Open the Pull Request that introduced the change (if applicable).
2.  Click **Revert**.
3.  This creates a *new* Pull Request that undoes the changes.
4.  Merge this new Pull Request ("revert PR") to `main`.
5.  **Result:** The CI/CD pipeline will trigger automatically and deploy the previous stable state.

## 3. Revert via CLI (Advanced) 💻
If you need to act fast from the terminal:

```bash
# 1. Checkout main and pull latest
git checkout main
git pull origin main

# 2. Revert the specific commit (replace HASH with actual ID)
git revert [COMMIT_HASH]

# 3. Handling Conflicts (if any)
# If git reports conflicts, fix them, then:
# git add .
# git revert --continue

# 4. Push to trigger deployment
git push origin main
```

## 4. Rollback Appwrite Functions 🔙
If a specific Appwrite Function is broken:

1.  Go to Appwrite Console > Functions.
2.  Select the broken function.
3.  Go to the **Deployments** tab.
4.  Find the previous "Active" deployment.
5.  Click **Activate**.
6.  **Result:** Appwrite immediately switches traffic to the old version.

## 5. Post-Rollback Checklist ✅
- [ ] Verify `landsale.lk` is back online.
- [ ] Check Discord for "Deployment Success" notification.
- [ ] Investigate the root cause of the failure in a sterile environment (e.g., local or staging).
