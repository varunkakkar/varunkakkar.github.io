# Automating GitHub Authentication with GitHub Actions

In this guide, we'll walk through the process of setting up GitHub Actions to handle authentication issues, especially when dealing with SSH key management and repository access.

## Prerequisites

- A GitHub repository.
- Access to the GitHub Actions feature.
- SSH key pair generated.

## Step 1: Generate SSH Key

If you haven't already generated an SSH key, run the following command:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

This generates a private key and a public key. The private key will be used by GitHub Actions, and the public key will be added to GitHub.

## Step 2: Add the Public Key to GitHub

1. Go to **Settings > SSH and GPG Keys**.
2. Click **New SSH Key**.
3. Paste the contents of your `id_ed25519.pub` file.
4. Save the key.

## Step 3: Add the Private Key as a GitHub Secret

1. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Name it `SSH_PRIVATE_KEY`.
4. Paste the contents of your `id_ed25519` file.

## Step 4: Create GitHub Actions Workflow

In your repository, create the following directory structure:

```plaintext
.github/
└── workflows/
    └── deploy.yml
```

Add the following content to `deploy.yml`:

```yaml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan github.com >> ~/.ssh/known_hosts

      - name: Test SSH Connection
        run: |
          ssh -T git@github.com

      - name: Push to Repository
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git push
```

## Step 5: Commit and Push

Commit the workflow file and push to your repository:

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push
```

## Step 6: Verify the Workflow

Go to **Actions** in your GitHub repository and check if the workflow runs successfully.

## Conclusion

With this setup, GitHub Actions can authenticate with your repository securely using SSH. This approach is useful for automating deployments or other CI/CD tasks that require repository access.
