import React from 'react'

// Exact uploaded icon assets — do not replace with recreated versions
import pmLink      from '../../assets/icons/pm-link.png'
import pmKlarna    from '../../assets/icons/pm-klarna.png'
import pmCashApp   from '../../assets/icons/pm-cashapp.png'
import pmUnionPay  from '../../assets/icons/pm-unionpay.png'
import pmVerifone  from '../../assets/icons/pm-verifone.png'
import pmStripe    from '../../assets/icons/pm-stripe.png'

export interface PaymentMethodOption {
  id: string
  name: string
  iconBg: string
  icon: React.ReactNode
  comboIcon: React.ReactNode
}

// Each icon is rendered as-is; object-contain preserves the asset's aspect ratio
function PaymentIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain"
      draggable={false}
    />
  )
}

// Stripe: no asset provided — keep brand-accurate wordmark until asset is supplied
function StripeIcon() {
  return (
    <span
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 13,
        color: '#635BFF',
        letterSpacing: -0.4,
        lineHeight: 1,
        display: 'block',
      }}
    >
      stripe
    </span>
  )
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'link',
    name: 'Link',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmLink} alt="Link" />,
    comboIcon: <PaymentIcon src={pmLink} alt="Link" />,
  },
  {
    id: 'klarna',
    name: 'Klarna',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmKlarna} alt="Klarna" />,
    comboIcon: <PaymentIcon src={pmKlarna} alt="Klarna" />,
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmCashApp} alt="Cash App" />,
    comboIcon: <PaymentIcon src={pmCashApp} alt="Cash App" />,
  },
  {
    id: 'unionpay',
    name: 'Union Pay',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmUnionPay} alt="Union Pay" />,
    comboIcon: <PaymentIcon src={pmUnionPay} alt="Union Pay" />,
  },
  {
    id: 'verifone',
    name: 'Verifone',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmVerifone} alt="Verifone" />,
    comboIcon: <PaymentIcon src={pmVerifone} alt="Verifone" />,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    iconBg: 'transparent',
    icon: <PaymentIcon src={pmStripe} alt="Stripe" />,
    comboIcon: <PaymentIcon src={pmStripe} alt="Stripe" />,
  },
]
