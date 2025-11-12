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
