/**
 * Recommendation Widget
 * Displays product recommendations on Amazon pages
 */

import { Product, ProductRecommendation } from '@/types/onboarding'

export class RecommendationWidget {
  private container: HTMLDivElement | null = null

  /**
   * Show recommendation widget on the page
   */
  show(
    currentProduct: Product,
    recommendation: { recommendation: string; reasons: string[]; score: number },
    alternatives: ProductRecommendation[]
  ): void {
    this.remove() // Remove existing widget

    this.container = this.createContainer()
    document.body.appendChild(this.container)

    // Build widget content
    this.container.innerHTML = this.buildWidgetHTML(
      currentProduct,
      recommendation,
      alternatives
    )

    // Add event listeners
    this.attachEventListeners()

    // Animate in
    setTimeout(() => {
      this.container?.classList.add('visible')
    }, 100)
  }

  /**
   * Remove widget from page
   */
  remove(): void {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.id = 'smart-shopping-widget'
    container.className = 'smart-shopping-widget'
    return container
  }

  private buildWidgetHTML(
    product: Product,
    recommendation: { recommendation: string; reasons: string[]; score: number },
    alternatives: ProductRecommendation[]
  ): string {
    const { recommendation: rec, reasons, score } = recommendation

    const badgeColor = 
      rec === 'buy' ? '#10b981' : 
      rec === 'consider' ? '#f59e0b' : 
      '#ef4444'

    const badgeText = 
      rec === 'buy' ? '✓ BUY' : 
      rec === 'consider' ? '🤔 CONSIDER' : 
      '✕ SKIP'

    return `
      <style>
        .smart-shopping-widget {
          position: fixed;
          top: 100px;
          right: -400px;
          width: 380px;
          max-height: 80vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px 0 0 16px;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          z-index: 999999;
          transition: right 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .smart-shopping-widget.visible {
          right: 0;
        }

        .widget-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .widget-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .widget-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .widget-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .widget-content {
          padding: 1rem;
        }

        .recommendation-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: ${badgeColor};
          color: white;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .score-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .score-fill {
          height: 100%;
          background: ${badgeColor};
          width: ${score * 100}%;
          transition: width 0.5s ease;
        }

        .reasons-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .reasons-list li {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .alternatives-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1a1a1a;
        }

        .alternative-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .alternative-card:hover {
          background: #e9ecef;
          transform: translateX(-4px);
        }

        .alt-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .alt-price {
          font-size: 1rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.25rem;
        }

        .alt-reasons {
          font-size: 0.75rem;
          color: #666;
        }

        .toggle-button {
          position: fixed;
          top: 150px;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px 0 0 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 999998;
          transition: transform 0.2s ease;
        }

        .toggle-button:hover {
          transform: translateX(-4px);
        }
      </style>

      <div class="widget-header">
        <h3 class="widget-title">🎯 Smart Shopping Assistant</h3>
        <button class="widget-close" data-action="close">✕</button>
      </div>

      <div class="widget-content">
        <div class="recommendation-badge">${badgeText}</div>
        
        <div class="score-bar">
          <div class="score-fill"></div>
        </div>

        <ul class="reasons-list">
          ${reasons.map(reason => `<li>${reason}</li>`).join('')}
        </ul>

        ${alternatives.length > 0 ? `
          <div class="alternatives-section">
            <h4 class="section-title">💡 Better Alternatives</h4>
            ${alternatives.map(alt => `
              <div class="alternative-card" data-product-id="${alt.product.id}">
                <div class="alt-title">${alt.product.title}</div>
                <div class="alt-price">${alt.product.price}</div>
                <div class="alt-reasons">${alt.reasons.slice(0, 2).join(' • ')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  private attachEventListeners(): void {
    if (!this.container) return

    // Close button
    const closeBtn = this.container.querySelector('[data-action="close"]')
    closeBtn?.addEventListener('click', () => {
      this.remove()
    })

    // Alternative product cards (would open in new tab)
    const altCards = this.container.querySelectorAll('.alternative-card')
    altCards.forEach(card => {
      card.addEventListener('click', () => {
        const productId = card.getAttribute('data-product-id')
        if (productId) {
          console.log('Would navigate to alternative product:', productId)
          // In real implementation: window.open(`https://amazon.com/dp/${productId}`)
        }
      })
    })
  }

  /**
   * Create toggle button to show/hide widget
   */
  createToggleButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'toggle-button'
    button.textContent = '🎯 Show Recommendations'
    button.onclick = () => {
      if (this.container) {
        if (this.container.classList.contains('visible')) {
          this.container.classList.remove('visible')
          button.textContent = '🎯 Show Recommendations'
        } else {
          this.container.classList.add('visible')
          button.textContent = '✕ Hide'
        }
      }
    }
    return button
  }
}

