# Security Policy

## Supported Versions

Currently, only the `master` branch is supported with security updates. 

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please **do not** disclose it publicly. 

Instead, please send an email to the repository owner directly. Security vulnerabilities will be promptly addressed.

We will endeavor to respond to your report within 48 hours. If the vulnerability is confirmed, we will release a patch as soon as possible and notify the reporter.

## Best Practices
- Never commit `.env` files.
- Always use strong, securely generated strings for `JWT_SECRET`.
- Ensure `DEMO_MODE` is disabled if deploying this software for real-world usage, as Demo Mode explicitly bypasses standard authentication flows for portfolio showcase purposes.
