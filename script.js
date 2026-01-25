// DNS Lookup Tool - Main JavaScript

const domainInput = document.getElementById('domain-input');
const lookupBtn = document.getElementById('lookup-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');
const recordCheckboxes = document.querySelectorAll('.record-types input[type="checkbox"]');

// DNS Record type descriptions
const recordDescriptions = {
    'A': 'IPv4 Address',
    'AAAA': 'IPv6 Address',
    'MX': 'Mail Exchange',
    'NS': 'Name Server',
    'TXT': 'Text Record',
    'CNAME': 'Canonical Name',
    'SOA': 'Start of Authority'
};

// Event listeners
lookupBtn.addEventListener('click', performLookup);
domainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performLookup();
});

async function performLookup() {
    const domain = domainInput.value.trim();

    if (!domain) {
        showError('Please enter a domain name');
        return;
    }

    // Clean the domain (remove protocol and paths)
    const cleanDomain = domain
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .toLowerCase();

    // Get selected record types
    const selectedTypes = Array.from(recordCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selectedTypes.length === 0) {
        showError('Please select at least one record type');
        return;
    }

    // Show loading
    hideError();
    hideResults();
    showLoading();

    try {
        const results = await Promise.all(
            selectedTypes.map(type => lookupDNS(cleanDomain, type))
        );

        hideLoading();
        displayResults(cleanDomain, selectedTypes, results);
    } catch (error) {
        hideLoading();
        showError('Failed to perform DNS lookup. Please try again.');
        console.error('DNS lookup error:', error);
    }
}

async function lookupDNS(domain, type) {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

function displayResults(domain, types, results) {
    resultsEl.innerHTML = `
        <div class="results-header">
            <h2>Results for <span style="color: #00d2ff;">${escapeHtml(domain)}</span></h2>
        </div>
    `;

    types.forEach((type, index) => {
        const result = results[index];
        const records = result.Answer || [];

        const sectionEl = document.createElement('div');
        sectionEl.className = 'record-section';

        sectionEl.innerHTML = `
            <div class="record-header">
                <span class="record-type-badge">${type}</span>
                <span class="record-description">${recordDescriptions[type] || ''}</span>
                <span class="record-count">${records.length} record${records.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="record-list">
                ${records.length > 0
                    ? records.map(record => `
                        <div class="record-item">
                            <span class="record-value">${formatRecordValue(type, record.data)}</span>
                            <span class="record-ttl">TTL: ${formatTTL(record.TTL)}</span>
                        </div>
                    `).join('')
                    : '<p class="no-records">No records found</p>'
                }
            </div>
        `;

        resultsEl.appendChild(sectionEl);
    });

    showResults();
}

function formatRecordValue(type, value) {
    if (!value) return 'N/A';

    // Escape HTML for security
    const escaped = escapeHtml(value);

    // Format specific record types
    if (type === 'MX') {
        // MX records have priority and mail server
        return escaped;
    }

    if (type === 'TXT') {
        // TXT records might have quotes
        return escaped.replace(/^"|"$/g, '');
    }

    return escaped;
}

function formatTTL(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    loadingEl.classList.remove('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}

function showResults() {
    resultsEl.classList.remove('hidden');
}

function hideResults() {
    resultsEl.classList.add('hidden');
}
