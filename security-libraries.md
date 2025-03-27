# Web Security Guide for Vibe Coders

## Introduction

Hey vibe coders! This guide will help you add security to your web apps without killing the vibe.

## Top Free Security Tools

### 1. OWASP ZAP (Zed Attack Proxy)

**What it is:** A free, easy-to-use web security scanner that finds vulnerabilities in your web apps.

**Why it's cool:**

- Works like a "security check" for your website
- Can run locally using Docker
- Fits into your workflow with GitHub Actions
- Completely free and open-source

**How to use it:**

- Download from [ZAP official site](https://www.zaproxy.org/getting-started/)
- Use the Automated Scan for a quick check
- Start with the "baseline scan" if you're new to security

### 2. Semgrep

**What it is:** A code scanner that finds security issues in your code before you deploy.

**Why it's cool:**

- Works with many programming languages
- Easy to use in your terminal
- Free for small teams and open source projects
- Finds bugs based on patterns, not complicated rules

**How to use it:**

- Install with `pip install semgrep`
- Run with `semgrep --config=auto .` in your project folder
- Check out [Semgrep's OWASP Top 10 rules](https://semgrep.dev/solutions/owasp-top-ten/)

### 3. GitGuardian

**What it is:** A tool that catches secrets (like API keys and passwords) before they get published in your code.

**Why it's cool:**

- Free starter tier for up to 25 developers
- Sends alerts when it finds secrets in your code
- Helps you fix issues with step-by-step guidance
- Prevents one of the most common security problems

**How to use it:**

- Sign up at [GitGuardian](https://www.gitguardian.com/)
- Install their GitHub app or use their CLI tool (`pip install ggshield`)
- Run `ggshield scan` to check your code

### 4. Gitleaks

**What it is:** An open-source alternative to GitGuardian that looks for secrets in your code.

**Why it's cool:**

- Completely free and open source
- Over 140 types of secrets it can detect
- Works great in CI/CD pipelines
- Easy to integrate into your workflow

**How to use it:**

- Install with `brew install gitleaks` or download from GitHub
- Run with `gitleaks detect --source .` in your project
- Add to your CI/CD with their GitHub Actions integration

### 5. OSV-Scanner (by Google)

**What it is:** A tool that checks your project dependencies for known security vulnerabilities.

**Why it's cool:**

- Created by Google's security team
- Simple to use and understand
- Helps you avoid using buggy libraries
- Works with Python, PHP, and other languages

**How to use it:**

- Install with `pip install osv-scanner` or similar
- Run in your project folder to scan dependencies
- Fix issues by updating to newer versions

## Security Basics for Every Project

### 1. Input Validation

**What to do:**

- Never trust user input (forms, URLs, cookies, etc.)
- Check that data looks right before using it
- Use whitelists (allow what you expect) instead of blacklists

**Example (JavaScript):**

```javascript
// BAD
function processUserInput(input) {
  database.query("SELECT * FROM users WHERE name = '" + input + "'");
}

// GOOD
function processUserInput(input) {
  // Validate format
  if (!/^[a-zA-Z0-9_]+$/.test(input)) {
    throw new Error("Invalid input");
  }

  // Use parameterized query
  database.query("SELECT * FROM users WHERE name = ?", [input]);
}
```

### 2. Authentication & Passwords

**What to do:**

- Never store passwords as plain text
- Use strong password hashing (bcrypt, Argon2)
- Add two-factor authentication if possible
- Set timeouts for login sessions

**Example (Node.js with bcrypt):**

```javascript
// Install bcrypt: npm install bcrypt

const bcrypt = require("bcrypt");
const saltRounds = 10;

// Storing a password
async function storePassword(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Save hashedPassword to database
}

// Checking a password
async function checkPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

### 3. Protect Against Common Attacks

**XSS (Cross-Site Scripting):**

- Always escape output shown to users
- Use frameworks that do this automatically
- Use Content-Security-Policy headers

**CSRF (Cross-Site Request Forgery):**

- Use anti-CSRF tokens in forms
- Check the origin of requests

**Example (CSRF Protection in Express):**

```javascript
// Install: npm install csurf

const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

app.get("/form", csrfProtection, function (req, res) {
  // Generate and pass the CSRF token to your template
  res.render("form", { csrfToken: req.csrfToken() });
});

// In your form template:
// <input type="hidden" name="_csrf" value="{{csrfToken}}">
```

## OWASP Top 10 Checklist

The [OWASP Top 10](https://owasp.org/www-project-top-ten/) is a list of the most critical web app security risks. Here's a simple checklist:

1. **Broken Access Control** - Make sure users can only access what they should
2. **Cryptographic Failures** - Use HTTPS, encrypt sensitive data
3. **Injection** - Validate inputs, use parameterized queries
4. **Insecure Design** - Think about security from the start
5. **Security Misconfiguration** - Remove default accounts, keep software updated
6. **Vulnerable Components** - Keep libraries and dependencies updated
7. **Authentication Failures** - Use strong passwords, prevent brute force
8. **Software and Data Integrity Failures** - Verify the integrity of updates and data
9. **Security Logging & Monitoring Failures** - Know when you're being attacked
10. **Server-Side Request Forgery** - Validate URLs before sending requests

## Quick Start Security for New Projects

1. **Use well-tested frameworks** that handle security basics
2. **Run ZAP scans** regularly to find issues
3. **Check dependencies** with OSV-Scanner or similar tools
4. **Use Semgrep or Gitleaks** in your workflow to catch issues early
5. **Follow OWASP checklists** (simplified versions in this guide)

## Resources for Learning More

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Practices Quick Reference Guide](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [OWASP ZAP Getting Started](https://www.zaproxy.org/getting-started/)
- [Semgrep Tutorial](https://semgrep.dev/learn)

---

Remember, good security is about taking small steps consistently. You don't need to implement everything at once. Start with the basics, scan your code regularly, and keep learning!

Happy secure vibe coding! ✌️
