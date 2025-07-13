/**
 * Paystack configuration
 */

export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_725c1c7270a1f315c5573b0faff083b679fac119',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_live_your_secret_key_here',
  plans: {
    starter: 'PLN_knqyoasukw8mh51',
    professional: 'PLN_4h1cwvwa0urt81k',
    enterprise: 'PLN_d6372foytgaiobx'
  }
};

export default PAYSTACK_CONFIG;