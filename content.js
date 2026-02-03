// ERU - Extraction & Recognition of Users - Content Script
class ERUExtractor {
  constructor() {
    this.extractedNames = [];
    this.isExtracting = false;
    this.observer = null;
    this.init();
  }

  init() {
    console.log('ERU - User Extractor loaded');
    this.createFloatingButton();
    this.setupMutationObserver();
  }

  createFloatingButton() {
    // Create floating action button
    const button = document.createElement('div');
    button.id = 'fb-extractor-btn';
    button.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: #1877f2;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7z"></path>
        </svg>
        <span>Extract Members</span>
      </div>
    `;

    // Add hover effects
    const buttonDiv = button.querySelector('div');
    buttonDiv.addEventListener('mouseenter', () => {
      buttonDiv.style.background = '#166fe5';
      buttonDiv.style.transform = 'scale(1.05)';
    });
    buttonDiv.addEventListener('mouseleave', () => {
      buttonDiv.style.background = '#1877f2';
      buttonDiv.style.transform = 'scale(1)';
    });

    // Add click handler
    buttonDiv.addEventListener('click', () => {
      this.showExtractionModal();
    });

    document.body.appendChild(button);
  }

  setupMutationObserver() {
    // Observe for new member elements as Facebook loads more content
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Check if new member elements were added
          const hasNewMembers = Array.from(mutation.addedNodes).some(node => {
            return node.nodeType === Node.ELEMENT_NODE && 
                   (node.querySelector('[role="listitem"]') || 
                    node.querySelector('a[href*="/groups/"][href*="/user/"]'));
          });
          
          if (hasNewMembers && this.isExtracting) {
            console.log('New members detected, updating extraction...');
            this.extractCurrentPageNames();
          }
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  extractNamesFromPage() {
    const names = [];
    const seenNames = new Set();
    
    // Method 1: Extract from member links (most reliable) - ONLY this method
    const memberLinks = document.querySelectorAll('a[href*="/groups/"][href*="/user/"]');
    memberLinks.forEach(link => {
      const name = link.textContent.trim();
      const lowerName = name.toLowerCase();
      
      // Very strict filtering for actual member names
      if (name && 
          name.length > 2 && 
          name.length < 50 &&
          !seenNames.has(lowerName) &&
          // Exclude Facebook UI elements
          !name.includes('Add friend') &&
          !name.includes('Join') &&
          !name.includes('Follow') &&
          !name.includes('Message') &&
          !name.includes('Share') &&
          !name.includes('Like') &&
          !name.includes('Comment') &&
          !name.includes('Home') &&
          !name.includes('Reels') &&
          !name.includes('Marketplace') &&
          !name.includes('Groups') &&
          !name.includes('Pages') &&
          !name.includes('Events') &&
          !name.includes('Memories') &&
          !name.includes('Saved') &&
          !name.includes('Settings') &&
          !name.includes('Help') &&
          !name.includes('Log Out') &&
          !name.includes('Menu') &&
          !name.includes('Search') &&
          !name.includes('Facebook') &&
          !name.includes('Exit') &&
          !name.includes('typeahead') &&
          !name.includes('points') &&
          !name.includes('Notifications') &&
          !name.includes('Messages') &&
          !name.includes('Watch') &&
          !name.includes('Gaming') &&
          !name.includes('Weather') &&
          !name.includes('News') &&
          !name.includes('Dating') &&
          !name.includes('Jobs') &&
          !name.includes('Oculus') &&
          !name.includes('Portal') &&
          !name.includes('Instagram') &&
          !name.includes('WhatsApp') &&
          !name.includes('Messenger') &&
          // Name format validation
          /^[a-zA-Z\s\.\-']+$/.test(name) && // Only letters, spaces, dots, hyphens, apostrophes
          name.split(' ').length <= 4 && // Max 4 words
          name.split(' ').length >= 2 && // At least 2 words (first + last name)
          !/\d/.test(name) && // No numbers
          !name.startsWith(' ') && // No leading spaces
          !name.endsWith(' ') && // No trailing spaces
          !name.includes('  ') // No double spaces
        ) {
        names.push(name);
        seenNames.add(lowerName);
      }
    });

    // Method 2: Only extract from member list items (very specific)
    const memberListItems = document.querySelectorAll('[role="listitem"]');
    memberListItems.forEach(item => {
      // Look for names within member list items
      const nameElements = item.querySelectorAll('span, div');
      nameElements.forEach(element => {
        const text = element.textContent.trim();
        const lowerText = text.toLowerCase();
        
        if (text && 
            text.length > 2 && 
            text.length < 50 &&
            !seenNames.has(lowerText) &&
            // Same strict filtering as above
            !text.includes('Add friend') &&
            !text.includes('Join') &&
            !text.includes('Follow') &&
            !text.includes('Message') &&
            !text.includes('Share') &&
            !text.includes('Like') &&
            !text.includes('Comment') &&
            !text.includes('Home') &&
            !text.includes('Reels') &&
            !text.includes('Marketplace') &&
            !text.includes('Groups') &&
            !text.includes('Pages') &&
            !text.includes('Events') &&
            !text.includes('Memories') &&
            !text.includes('Saved') &&
            !text.includes('Settings') &&
            !text.includes('Help') &&
            !text.includes('Log Out') &&
            !text.includes('Menu') &&
            !text.includes('Search') &&
            !text.includes('Facebook') &&
            !text.includes('Exit') &&
            !text.includes('typeahead') &&
            !text.includes('points') &&
            !text.includes('Notifications') &&
            !text.includes('Messages') &&
            !text.includes('Watch') &&
            !text.includes('Gaming') &&
            !text.includes('Weather') &&
            !text.includes('News') &&
            !text.includes('Dating') &&
            !text.includes('Jobs') &&
            !text.includes('Oculus') &&
            !text.includes('Portal') &&
            !text.includes('Instagram') &&
            !text.includes('WhatsApp') &&
            !text.includes('Messenger') &&
            !text.includes('Works at') &&
            !text.includes('Studied at') &&
            !text.includes('Lives in') &&
            !text.includes('From') &&
            !text.includes('Joined') &&
            !text.includes('Mutual') &&
            !text.includes('people') &&
            !text.includes('member') &&
            !text.includes('friends') &&
            !text.includes('followers') &&
            !text.includes('following') &&
            !text.includes('public') &&
            !text.includes('private') &&
            !text.includes('group') &&
            !text.includes('community') &&
            !text.includes('page') &&
            !text.includes('post') &&
            !text.includes('photo') &&
            !text.includes('video') &&
            !text.includes('story') &&
            !text.includes('live') &&
            !text.includes('shop') &&
            !text.includes('play') &&
            !text.includes('games') &&
            !text.includes('apps') &&
            !text.includes('ads') &&
            !text.includes('create') &&
            !text.includes('edit') &&
            !text.includes('delete') &&
            !text.includes('remove') &&
            !text.includes('block') &&
            !text.includes('report') &&
            !text.includes('mute') &&
            !text.includes('hide') &&
            !text.includes('see more') &&
            !text.includes('show more') &&
            !text.includes('see less') &&
            !text.includes('show less') &&
            !text.includes('view all') &&
            !text.includes('show all') &&
            !text.includes('view less') &&
            !text.includes('load more') &&
            !text.includes('more options') &&
            !text.includes('settings') &&
            !text.includes('privacy') &&
            !text.includes('security') &&
            !text.includes('account') &&
            !text.includes('profile') &&
            !text.includes('cover') &&
            !text.includes('picture') &&
            !text.includes('avatar') &&
            !text.includes('about') &&
            !text.includes('contact') &&
            !text.includes('basic') &&
            !text.includes('detailed') &&
            !text.includes('work') &&
            !text.includes('education') &&
            !text.includes('current') &&
            !text.includes('previous') &&
            !text.includes('city') &&
            !text.includes('hometown') &&
            !text.includes('relationship') &&
            !text.includes('family') &&
            !text.includes('details') &&
            !text.includes('life') &&
            !text.includes('events') &&
            !text.includes('check-ins') &&
            !text.includes('places') &&
            !text.includes('photos') &&
            !text.includes('videos') &&
            !text.includes('music') &&
            !text.includes('books') &&
            !text.includes('movies') &&
            !text.includes('tv') &&
            !text.includes('sports') &&
            !text.includes('teams') &&
            !text.includes('athletes') &&
            !text.includes('inspired') &&
            !text.includes('following') &&
            !text.includes('groups') &&
            !text.includes('interests') &&
            // Name format validation
            /^[a-zA-Z\s\.\-']+$/.test(text) && // Only letters, spaces, dots, hyphens, apostrophes
            text.split(' ').length <= 4 && // Max 4 words
            text.split(' ').length >= 2 && // At least 2 words
            !/\d/.test(text) && // No numbers
            !text.startsWith(' ') && // No leading spaces
            !text.endsWith(' ') && // No trailing spaces
            !text.includes('  ') // No double spaces
        ) {
          names.push(text);
          seenNames.add(lowerText);
        }
      });
    });

    return names;
  }

  extractCurrentPageNames() {
    const currentNames = this.extractNamesFromPage();
    const seenNames = new Set(this.extractedNames.map(name => name.toLowerCase()));
    
    // Only add new names that haven't been extracted before
    currentNames.forEach(name => {
      if (!seenNames.has(name.toLowerCase())) {
        this.extractedNames.push(name);
        seenNames.add(name.toLowerCase());
      }
    });

    return this.extractedNames;
  }

  async scrollAndExtract() {
    this.isExtracting = true;
    let previousHeight = 0;
    let noChangeCount = 0;
    const maxNoChange = 3; // Reduced from 5 to stop earlier
    let lastExtractedCount = 0;
    let stableCount = 0;

    // Update modal status
    this.updateModalStatus('Scrolling and extracting names...');

    while (noChangeCount < maxNoChange) {
      // Extract current page names
      this.extractCurrentPageNames();
      
      // Check if we're getting new names
      const currentCount = this.extractedNames.length;
      if (currentCount === lastExtractedCount) {
        stableCount++;
        if (stableCount >= 2) {
          // No new names for 2 consecutive scrolls, stop early
          break;
        }
      } else {
        stableCount = 0;
        lastExtractedCount = currentCount;
      }
      
      // Update progress
      this.updateModalProgress(this.extractedNames.length);

      // Stop if we have a reasonable number (to prevent infinite scrolling)
      if (this.extractedNames.length >= 4000) {
        this.updateModalStatus('Reached maximum limit (4000 names). Stopping extraction.');
        break;
      }

      // Scroll to bottom
      window.scrollTo(0, document.body.scrollHeight);
      
      // Wait for new content to load
      await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced from 2000ms

      // Check if page height has changed
      const currentHeight = document.body.scrollHeight;
      if (currentHeight === previousHeight) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
        previousHeight = currentHeight;
      }
    }

    this.isExtracting = false;
    return this.extractedNames;
  }

  showExtractionModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('fb-extractor-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'fb-extractor-modal';
    modal.innerHTML = `
      <div style="
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
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        ">
          <h2 style="margin: 0 0 16px 0; color: #1c1e21; font-size: 24px; font-weight: 600;">
            Extract Group Members
          </h2>
          
          <div id="extraction-status" style="margin-bottom: 16px; color: #65676b; font-size: 14px;">
            Ready to extract user names from this Facebook group.
          </div>
          
          <div id="extraction-progress" style="margin-bottom: 16px; display: none;">
            <div style="background: #e4e6eb; border-radius: 4px; height: 8px; overflow: hidden;">
              <div id="progress-bar" style="background: #1877f2; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <div id="progress-text" style="margin-top: 8px; color: #65676b; font-size: 12px;">0 names found</div>
          </div>
          
          <div id="extraction-results" style="display: none;">
            <div style="margin-bottom: 16px;">
              <strong style="color: #1c1e21;">Extraction Complete!</strong><br>
              <span id="total-count" style="color: #65676b;">0</span> names extracted
            </div>
            
            <div style="margin-bottom: 16px;">
              <strong style="color: #1c1e21;">Actions:</strong><br>
              <button id="download-excel" style="
                background: #10b981;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                margin-right: 8px;
                cursor: pointer;
                font-size: 14px;
              ">Download Excel</button>
              <button id="download-txt" style="
                background: #42b883;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                margin-right: 8px;
                cursor: pointer;
                font-size: 14px;
              ">Download Text</button>
              <button id="copy-users" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                margin-right: 8px;
                cursor: pointer;
                font-size: 14px;
              ">Copy Users</button>
              <button id="show-users" style="
                background: #e4e6eb;
                color: #1c1e21;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Show Users</button>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button id="start-extraction" style="
              background: #1877f2;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            ">Start Extraction</button>
            <button id="close-modal" style="
              background: #e4e6eb;
              color: #1c1e21;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            ">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('start-extraction').addEventListener('click', () => {
      this.startExtraction();
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      modal.remove();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  updateModalStatus(message) {
    const status = document.getElementById('extraction-status');
    if (status) {
      status.textContent = message;
    }
  }

  updateModalProgress(count) {
    const progressDiv = document.getElementById('extraction-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressDiv) {
      progressDiv.style.display = 'block';
    }
    if (progressBar) {
      progressBar.style.width = Math.min((count / 4000) * 100, 100) + '%';
    }
    if (progressText) {
      progressText.textContent = `${count} names found`;
    }
  }

  async startExtraction() {
    const startBtn = document.getElementById('start-extraction');
    startBtn.disabled = true;
    startBtn.textContent = 'Extracting...';

    try {
      this.extractedNames = [];
      await this.scrollAndExtract();
      
      // Show results
      this.showResults();
    } catch (error) {
      console.error('Extraction error:', error);
      this.updateModalStatus('Error during extraction: ' + error.message);
    } finally {
      startBtn.disabled = false;
      startBtn.textContent = 'Start Extraction';
    }
  }

  showResults() {
    const results = document.getElementById('extraction-results');
    const totalCount = document.getElementById('total-count');
    const progress = document.getElementById('extraction-progress');
    
    if (results) results.style.display = 'block';
    if (totalCount) totalCount.textContent = this.extractedNames.length;
    if (progress) progress.style.display = 'none';

    // Add action button listeners
    document.getElementById('download-excel').addEventListener('click', () => {
      this.downloadExcel();
    });

    document.getElementById('download-txt').addEventListener('click', () => {
      this.downloadText();
    });

    document.getElementById('copy-users').addEventListener('click', () => {
      this.copyNames();
    });

    document.getElementById('show-users').addEventListener('click', () => {
      this.showNamesList();
    });
  }

  copyNames() {
    const namesText = this.extractedNames.join('\n');
    navigator.clipboard.writeText(namesText).then(() => {
      const btn = document.getElementById('copy-users');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }

  downloadText() {
    const namesText = this.extractedNames.join('\n');
    const blob = new Blob([namesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_users_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadExcel() {
    // Create CSV content for Excel
    const headers = ['No.', 'Name', 'Extraction Date'];
    const currentDate = new Date().toLocaleDateString();
    
    let csvContent = headers.join(',') + '\n';
    
    this.extractedNames.forEach((name, index) => {
      csvContent += `${index + 1},"${name}","${currentDate}"\n`;
    });

    // Add summary at the end
    csvContent += '\nSummary\n';
    csvContent += `Total Users Extracted,${this.extractedNames.length}\n`;
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

  showNamesList() {
    const modal = document.getElementById('fb-extractor-modal');
    const namesList = this.extractedNames.map((name, index) => 
      `${index + 1}. ${name}`
    ).join('\n');
    
    alert(`Extracted Users (${this.extractedNames.length}):\n\n${namesList.substring(0, 2000)}${namesList.length > 2000 ? '...' : ''}`);
  }
}

// Initialize the extractor when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ERUExtractor();
  });
} else {
  new ERUExtractor();
}
