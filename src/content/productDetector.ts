/**
 * Amazon Product Detector
 * Extracts product information from Amazon product pages
 */

import { Product } from '@/types/onboarding'

export class ProductDetector {
  /**
   * Check if current page is an Amazon product page
   */
  static isProductPage(): boolean {
    const url = window.location.href
    return url.includes('/dp/') || url.includes('/gp/product/')
  }

  /**
   * Extract product information from the current Amazon page
   */
  static extractProduct(): Product | null {
    if (!this.isProductPage()) return null

    try {
      // Extract product ID from URL
      const productId = this.extractProductId()
      if (!productId) return null

      // Extract product details
      const title = this.extractTitle()
      const price = this.extractPrice()
      const priceNumeric = this.extractPriceNumeric(price)
      const rating = this.extractRating()
      const category = this.extractCategory()
      const image = this.extractImage()

      if (!title || !price) return null

      return {
        id: productId,
        title,
        price,
        priceNumeric,
        image: image || '📦',
        category: category || 'General',
        rating,
        features: this.extractFeatures(),
      }
    } catch (error) {
      console.error('Error extracting product:', error)
      return null
    }
  }

  private static extractProductId(): string | null {
    const match = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)
    return match ? match[1] : null
  }

  private static extractTitle(): string | null {
    // Try multiple selectors for title
    const selectors = [
      '#productTitle',
      '#title',
      'h1.product-title',
      '[data-feature-name="title"] h1',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element?.textContent) {
        return element.textContent.trim()
      }
    }

    return null
  }

  private static extractPrice(): string | null {
    // Try multiple selectors for price
    const selectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
      '[data-a-color="price"] .a-offscreen',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element?.textContent) {
        return element.textContent.trim()
      }
    }

    return null
  }

  private static extractPriceNumeric(priceString: string | null): number {
    if (!priceString) return 0

    // Remove currency symbols and extract number
    const match = priceString.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''))
    }

    return 0
  }

  private static extractRating(): number | undefined {
    // Try multiple selectors for rating
    const selectors = [
      '[data-hook="average-star-rating"] .a-icon-alt',
      '.reviewCountTextLinkedHistogram .a-icon-alt',
      '#acrPopover .a-icon-alt',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element?.textContent) {
        const match = element.textContent.match(/(\d+\.?\d*)/)
        if (match) {
          return parseFloat(match[1])
        }
      }
    }

    return undefined
  }

  private static extractCategory(): string | null {
    // Try to get category from breadcrumbs
    const breadcrumb = document.querySelector('#wayfinding-breadcrumbs_container')
    if (breadcrumb?.textContent) {
      const categories = breadcrumb.textContent.trim().split('›')
      if (categories.length > 1) {
        return categories[1].trim()
      }
    }

    return null
  }

  private static extractImage(): string | null {
    const imgElement = document.querySelector('#landingImage, #imgBlkFront') as HTMLImageElement
    return imgElement?.src || null
  }

  private static extractFeatures(): string[] {
    const features: string[] = []
    
    // Extract from feature bullets
    const featureBullets = document.querySelectorAll('#feature-bullets li, .a-unordered-list.a-vertical li')
    featureBullets.forEach((bullet) => {
      const text = bullet.textContent?.trim()
      if (text && text.length > 10) {
        features.push(text.substring(0, 50)) // Limit length
      }
    })

    return features.slice(0, 5) // Max 5 features
  }
}

