---
layout: post
title: How I Secured This Site
subtitle: A static site still has things worth protecting
toc: true
description: "Securing a static GitHub Pages site: domain verification, security.txt, SPF, DMARC, null MX, CAA and security headers through Cloudflare."
---

This site is a handful of static pages on GitHub Pages. There's no login or database, but the domain and its email are still worth protecting. This post covers what I changed, why, and what I've left for later.

## Verifying the domain

I'd pointed sijeffrey.com at GitHub Pages but never verified the domain with GitHub. GitHub's documentation explains why that matters: verification "stops other GitHub users from taking over your custom domain" if the site is ever unlinked from it [[1]](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

It's a single TXT record. Five minutes, and the record has to stay in place so GitHub can keep checking it.

## security.txt and robots.txt

RFC 9116 defines `security.txt`, a small file that tells people how to report a security issue [[2]](https://www.rfc-editor.org/rfc/rfc9116). It lives at `/.well-known/security.txt` and must have a `Contact` and an `Expires` field. The RFC recommends the expiry is less than a year ahead, so this one needs renewing every year. Jekyll skips folders that start with a dot, so the `.well-known` folder also needed adding to `_config.yml`.

I added `robots.txt` at the same time, with a pointer to a sitemap. It isn't a security control. It's a request to well-behaved crawlers and anything else can ignore it.

## Email I don't send

The domain has never sent email, which makes it easy to spoof. Nothing told a receiving mail server that a message from @sijeffrey.com was fake. Three DNS records fix that:

- **SPF** with `v=spf1 -all`. The `all` mechanism "always matches" and the `-` makes it a fail, so no server is allowed to send for the domain [[3]](https://www.rfc-editor.org/rfc/rfc7208).
- **DMARC** with `p=reject`, which tells receivers the owner "wishes for Mail Receivers to reject email that fails" the check [[4]](https://www.rfc-editor.org/rfc/rfc7489).
- **A null MX** (`0 .`), which says the domain accepts no mail at all [[5]](https://www.rfc-editor.org/rfc/rfc7505).

## Who can issue certificates

A CAA record names the certificate authorities that may issue certificates for a domain [[6]](https://www.rfc-editor.org/rfc/rfc8659). I allowed Let's Encrypt, which GitHub Pages uses. Cloudflare added its own authorities automatically once I put it in front of the site.

## Security headers

GitHub Pages wasn't sending any security headers, and I couldn't find a way to add them on GitHub Pages itself. My DNS was already on Cloudflare so I turned on its proxy and added one rule that sets the headers on every response. The values come from OWASP's HTTP Headers Cheat Sheet [[7]](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html):

- `Strict-Transport-Security`, so browsers only ever use HTTPS
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`, so no one can frame the site
- a `Content-Security-Policy` that only allows scripts, styles and images from the site itself, and also blocks framing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`, turning off the camera, microphone and location
- `Cross-Origin-Opener-Policy: same-origin`

The SSL mode needs to be right first. With GitHub Pages behind Cloudflare it should be "Full (strict)", the "Flexible" mode can cause a redirect loop. I also added a `www` record so www.sijeffrey.com redirects to the main site rather than failing.

## What I left out

One thing isn't done yet, and that's HSTS preload. Preloading needs a max-age of at least a year and removal from the list "tends to be slow and painful" [[8]](https://hstspreload.org/). So I **did not** turn on preload, and set six months for now. I'll revisit once the setup has been stable for a while.

The full Content Security Policy came shortly after. The first version only covered framing and a few basics, as a stricter policy would have blocked the small inline script that sets the light or dark theme. Moving that script into its own file was a small change, and it let the policy drop inline scripts altogether.

## How to check your own site

None of this needs special tools.

- `curl -I https://example.com` shows the headers a site sends.
- `dig example.com TXT` and `dig _dmarc.example.com TXT` show the SPF and DMARC records.
- `dig example.com CAA` shows which authorities may issue certificates.

## How I did it

I worked from OWASP's HTTP Headers Cheat Sheet, RFC 9116 and GitHub's Pages documentation, and used my AI agent, Claude Code, to help with the setup and to check each change from outside. I reviewed every change before it went live.

## References

1. GitHub Docs, [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
2. RFC 9116, [A File Format to Aid in Security Vulnerability Disclosure](https://www.rfc-editor.org/rfc/rfc9116)
3. RFC 7208, [Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1](https://www.rfc-editor.org/rfc/rfc7208)
4. RFC 7489, [Domain-based Message Authentication, Reporting, and Conformance (DMARC)](https://www.rfc-editor.org/rfc/rfc7489)
5. RFC 7505, [A "Null MX" No Service Resource Record for Domains That Accept No Mail](https://www.rfc-editor.org/rfc/rfc7505)
6. RFC 8659, [DNS Certification Authority Authorization (CAA) Resource Record](https://www.rfc-editor.org/rfc/rfc8659)
7. OWASP Cheat Sheet Series, [HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
8. [HSTS Preload List Submission](https://hstspreload.org/)
