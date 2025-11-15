/**
 * Product Review Prompt
 * Allows users to rate and review products they purchased
 */

import { useState } from 'react'
import { Product } from '@/types/onboarding'
import { SupabaseSync } from '@/services/supabaseSync'
import './ReviewPrompt.css'

interface ReviewPromptProps {
  product: Product
  onClose: () => void
  onSubmit: () => void
}

export default function ReviewPrompt({ product, onClose, onSubmit }: ReviewPromptProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    
    try {
      await SupabaseSync.saveProductReview(
        product,
        rating,
        reviewText || null,
        wouldRecommend
      )
      
      onSubmit()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-prompt-overlay" onClick={onClose}>
      <div className="review-prompt-content" onClick={(e) => e.stopPropagation()}>
        <div className="review-header">
          <h2 className="review-title">📝 How was this product?</h2>
          <button className="review-close" onClick={onClose}>✕</button>
        </div>

        <div className="review-body">
          <div className="product-summary">
            <div className="product-emoji">{product.image}</div>
            <h3 className="product-name">{product.title}</h3>
          </div>

          <div className="rating-section">
            <label className="rating-label">Your Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${
                    star <= (hoveredRating || rating) ? 'active' : ''
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="review-section">
            <label className="review-label">Your Thoughts (Optional)</label>
            <textarea
              className="review-textarea"
              placeholder="What did you like or dislike about this product?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="recommend-section">
            <label className="recommend-toggle">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                I would recommend this product to others
              </span>
            </label>
          </div>
        </div>

        <div className="review-footer">
          <button className="review-cancel" onClick={onClose}>
            Skip
          </button>
          <button
            className="review-submit"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

