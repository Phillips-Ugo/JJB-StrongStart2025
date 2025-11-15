/**
 * Content Script - Amazon Page Integration
 * Intercepts purchase attempts and shows smart recommendations
 */

import { CartInterceptor } from './cartInterceptor'

console.log('🎯 Smart Shopping Assistant - Active!')

// Initialize cart interceptor
const interceptor = new CartInterceptor()

console.log('✅ Add to Cart interception enabled')
console.log('💡 Try adding a product to cart to see recommendations!')

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'

function extractProductData() {
  const data = {
    title: '',
    price: '',
    description: '',
    timestamp: Date.now()
  };

  const titleSelectors = [
    '#productTitle',
    '#title',
    '.product-title-word-break'
  ];
  
  for (const selector of titleSelectors) {
    const titleEl = document.querySelector(selector);
    if (titleEl) {
      data.title = titleEl.textContent.trim();
      break;
    }
  }

  const priceSelectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole',
    '#corePriceDisplay_desktop_feature_div .a-offscreen'
  ];
  
  for (const selector of priceSelectors) {
    const priceEl = document.querySelector(selector);
    if (priceEl) {
      data.price = priceEl.textContent.trim();
      break;
    }
  }

  const descSelectors = [
    '#feature-bullets ul',
    '#productDescription p',
    '.a-unordered-list.a-vertical.a-spacing-mini'
  ];
  
  for (const selector of descSelectors) {
    const descEl = document.querySelector(selector);
    if (descEl) {
      data.description = descEl.textContent.trim().substring(0, 500); // Limit length
      break;
    }
  }

  return data;
}

function isProductPage() {
  return window.location.pathname.includes('/dp/') || 
         window.location.pathname.includes('/gp/product/');
}

function sendProductData(data: any) {
  console.log('Amazon Product Data:', data);
  chrome.runtime.sendMessage({
    type: 'PRODUCT_DATA',
    data: data
  });
  
  chrome.storage.local.set({ productData: data });
}

if (isProductPage()) {
  setTimeout(() => {
    const data = extractProductData();
    sendProductData(data);
  }, 1000); // Wait for page to load
}

// Track selected configuration to detect actual changes
let lastConfig = {
  asin: new URLSearchParams(window.location.search).get('th') || '',
  selectedOptions: getSelectedOptions()
};

function getSelectedOptions() {
  const options = {};
  // Get all selected variation options
  document.querySelectorAll('#twister .selection').forEach(el => {
    const label = el.querySelector('.a-dropdown-label')?.textContent.trim();
    if (label) options[el.id] = label;
  });
  
  // Also check for button-style selectors (like color swatches)
  document.querySelectorAll('#twister [class*="selected"]').forEach(el => {
    const name = el.getAttribute('data-dp-url') || el.getAttribute('title');
    if (name) options[name] = true;
  });
  
  return options;
}

function hasConfigChanged() {
  const currentAsin = new URLSearchParams(window.location.search).get('th') || '';
  const currentOptions = getSelectedOptions();
  
  // Check if ASIN changed (actual product variant change)
  if (currentAsin !== lastConfig.asin && currentAsin !== '') {
    lastConfig.asin = currentAsin;
    lastConfig.selectedOptions = currentOptions;
    return true;
  }
  
  // Check if selected options changed (not just hovered)
  const currentKeys = Object.keys(currentOptions);
  const lastKeys = Object.keys(lastConfig.selectedOptions);
  
  if (currentKeys.length !== lastKeys.length) {
    lastConfig.selectedOptions = currentOptions;
    return true;
  }
  
  for (const key of currentKeys) {
    if (currentOptions[key] !== lastConfig.selectedOptions[key]) {
      lastConfig.selectedOptions = currentOptions;
      return true;
    }
  }
  
  return false;
}

// Monitor for configuration changes using MutationObserver
const observer = new MutationObserver((mutations) => {
  // Only check if there are significant changes, not just hover effects
  const relevantChange = mutations.some(mutation => {
    const target = mutation.target;
    // Focus on actual selection changes, not hover previews
    return (target.id?.includes('price') || 
           target.id?.includes('title') ||
           target.className?.includes('price')) &&
           mutation.addedNodes.length > 0;
  });

  if (relevantChange && isProductPage()) {
    // Debounce and verify actual config change
    clearTimeout(window.amazonExtractorTimeout);
    window.amazonExtractorTimeout = setTimeout(() => {
      if (hasConfigChanged()) {
        const data = extractProductData();
        sendProductData(data);
      }
    }, 800); // Longer delay to let hover effects settle
  }
});

// Start observing
if (isProductPage()) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id']
  });
}

// Listen for URL changes (for single-page navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isProductPage()) {
      setTimeout(() => {
        const data = extractProductData();
        sendProductData(data);
      }, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });
