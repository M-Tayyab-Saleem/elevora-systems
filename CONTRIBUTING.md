# Contributing to Elevora Systems

First off, thank you for considering contributing to Elevora Systems! It's people like you that make open source such a fantastic community.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) page to see if someone else has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork Elevora Systems and create a branch with a descriptive name.

## Get the test suite running

Make sure you have Node.js and MongoDB installed.
1. Clone your fork and install dependencies in both `/frontend` and `/backend`.
2. Ensure you have your `.env` configured.
3. Verify that the build works: `npm run build` in `/frontend`.

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with Elevora Systems's master branch:

```bash
git remote add upstream https://github.com/yourusername/elevora-systems.git
git fetch upstream
git merge upstream/master
```

Then update your feature branch from your local copy of master, and push it!

```bash
git checkout feature-branch
git rebase master
git push --set-upstream origin feature-branch
```

Finally, go to GitHub and make a Pull Request.

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.
