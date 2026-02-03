// Popup script for ERU - User Extractor
document.addEventListener('DOMContentLoaded', function() {
    const extractBtn = document.getElementById('extract-btn');
    const viewResultsBtn = document.getElementById('view-results-btn');
    const statsSection = document.getElementById('stats-section');
    const totalExtracted = document.getElementById('total-extracted');
    const currentSession = document.getElementById('current-session');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const statusDescription = document.getElementById('status-description');

    // Check current tab status
    checkCurrentTab();

    // Extract button click handler
    extractBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url.includes('facebook.com/groups/') && tab.url.includes('/members')) {
            // Send message to content script to start extraction
            chrome.tabs.sendMessage(tab.id, { action: 'startExtraction' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    updateStatus('Error', 'Content script not loaded. Please refresh the page.');
                } else {
                    // Close popup and let content script handle extraction
                    window.close();
                }
            });
        } else {
            updateStatus('Wrong Page', 'Please navigate to a Facebook group members page first.');
        }
    });

    // View results button click handler
    viewResultsBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, { action: 'getResults' }, (response) => {
            if (response && response.names) {
                showResultsModal(response.names);
            }
        });
    });

    // Check current tab and update UI
    async function checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.includes('facebook.com/groups/') && tab.url.includes('/members')) {
                updateStatus('Ready', 'Facebook group members page detected');
                extractBtn.disabled = false;
                
                // Get stored results
                chrome.storage.local.get(['extractedNames'], (result) => {
                    if (result.extractedNames && result.extractedNames.length > 0) {
                        viewResultsBtn.classList.remove('hidden');
                        statsSection.classList.remove('hidden');
                        totalExtracted.textContent = result.extractedNames.length;
                        currentSession.textContent = result.extractedNames.length;
                    }
                });
                
                // Check if content script is ready
                chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
                    if (chrome.runtime.lastError) {
                        updateStatus('Reload Required', 'Please refresh the page to activate the extension');
                        extractBtn.disabled = true;
                    } else if (response) {
                        updateStatus('Active', 'Extension is ready to extract members');
                    }
                });
            } else {
                updateStatus('Not on Group Page', 'Navigate to a Facebook group members page');
                extractBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error checking tab:', error);
            updateStatus('Error', 'Unable to check current tab');
        }
    }

    function updateStatus(text, description) {
        statusText.textContent = text;
        statusDescription.textContent = description;
        
        if (text === 'Ready' || text === 'Active') {
            statusDot.classList.remove('inactive');
        } else {
            statusDot.classList.add('inactive');
        }
    }

    function showResultsModal(names) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const namesList = names.map((name, index) => 
            `${index + 1}. ${name}`
        ).join('\n');

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            ">
                <h2 style="margin: 0 0 16px 0; color: #1c1e21; font-size: 20px; font-weight: 600;">
                    Extracted Names (${names.length})
                </h2>
                
                <div style="margin-bottom: 16px;">
                    <textarea readonly style="
                        width: 100%;
                        height: 200px;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        font-family: monospace;
                        font-size: 12px;
                        resize: none;
                    ">${namesList}</textarea>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <strong style="color: #1c1e21;">Actions:</strong><br>
                    <button id="modal-excel" style="
                        flex: 1;
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 10px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        margin-right: 4px;
                    ">Excel</button>
                    <button id="modal-copy" style="
                        flex: 1;
                        background: #1877f2;
                        color: white;
                        border: none;
                        padding: 10px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        margin-right: 4px;
                    ">Copy</button>
                    <button id="modal-close" style="
                        flex: 1;
                        background: #e4e6eb;
                        color: #1c1e21;
                        border: none;
                        padding: 10px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('modal-excel').addEventListener('click', () => {
            downloadExcel(names);
        });

        document.getElementById('modal-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(namesList).then(() => {
                const btn = document.getElementById('modal-copy');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function downloadExcel(names) {
        // Create CSV content for Excel with links
        const headers = ['No.', 'Name', 'Profile Link', 'Extraction Date'];
        const currentDate = new Date().toLocaleDateString();
        
        let csvContent = headers.join(',') + '\n';
        
        names.forEach((name, index) => {
            csvContent += `${index + 1},"${name}","","${currentDate}"\n`;
        });

        // Add summary at the end
        csvContent += '\nSummary\n';
        csvContent += `Total Users Extracted,${names.length}\n`;
        csvContent += `Extraction Date,${currentDate}\n`;
        csvContent += `Source,Facebook Group Members\n`;

        // Create blob with UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted_users_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'extractionComplete') {
            // Update stats when extraction is complete
            chrome.storage.local.get(['extractedNames'], (result) => {
                if (result.extractedNames) {
                    totalExtracted.textContent = result.extractedNames.length;
                    currentSession.textContent = result.extractedNames.length;
                    viewResultsBtn.classList.remove('hidden');
                    statsSection.classList.remove('hidden');
                }
            });
        }
    });
});
