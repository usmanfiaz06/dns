# DNS Lookup Tool

A simple, beautiful web-based DNS lookup tool that allows you to query DNS records for any domain.

## Features

- Look up multiple DNS record types: A, AAAA, MX, NS, TXT, CNAME, SOA
- Clean, modern dark UI
- Mobile-responsive design
- Real-time DNS queries using Google's DNS API
- No server required - runs entirely in the browser

## Live Demo

**[Try it here](https://usmanfiaz06.github.io/dns/)**

## Usage

1. Enter a domain name (e.g., `google.com`)
2. Select which record types you want to look up
3. Click "Lookup" or press Enter
4. View the DNS records with their TTL values

## Record Types

- **A** - IPv4 addresses
- **AAAA** - IPv6 addresses
- **MX** - Mail exchange servers
- **NS** - Name servers
- **TXT** - Text records (SPF, DKIM, etc.)
- **CNAME** - Canonical names (aliases)
- **SOA** - Start of authority

## Local Development

Simply open `index.html` in your browser - no build process required!

## Deployment

This site is deployed using GitHub Pages. Any push to the main branch automatically updates the live site.

## License

MIT
