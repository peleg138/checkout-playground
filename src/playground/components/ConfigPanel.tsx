import React, { useState } from 'react'
import type { PlaygroundConfig } from '../types'
import { PaymentMethodsSection } from '../sections/PaymentMethodsSection'
import { ProductsSection } from '../sections/ProductsSection'
import { PromoSection } from '../sections/PromoSection'
import { AppearanceSection } from '../sections/AppearanceSection'

interface Props {
  config: PlaygroundConfig
  onChange: (c: PlaygroundConfig) => void
}

type Section = 'payments' | 'products' | 'appearance' | 'promo'

export function ConfigPanel({ config, onChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>(null)
  const toggle = (s: Section) => setOpenSection(prev => prev === s ? null : s)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
      {/* Sidebar head — matches .sidebar-head: 48px, border-bottom */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        padding: '0 14px 0 16px',
        borderBottom: '1px solid #e4e4e7',
        flexShrink: 0,
      }}>
        <span style={{
          flex: 1,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.07em',
          textTransform: 'uppercase',
          color: '#71717a',
        }}>
          Configuration
        </span>
      </div>

      {/* Nav list */}
      <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PaymentMethodsSection
          methods={config.paymentMethods}
          onChange={paymentMethods => onChange({ ...config, paymentMethods })}
          checkoutMode={config.checkoutMode}
          onCheckoutModeChange={checkoutMode => onChange({ ...config, checkoutMode })}
          isOpen={openSection === 'payments'}
          onToggle={() => toggle('payments')}
        />
        <ProductsSection
          config={config.products}
          onChange={products => onChange({ ...config, products })}
          isOpen={openSection === 'products'}
          onToggle={() => toggle('products')}
        />
        <AppearanceSection
          config={config.appearance}
          onChange={appearance => onChange({ ...config, appearance })}
          background={config.background}
          onBackgroundChange={background => onChange({ ...config, background })}
          isOpen={openSection === 'appearance'}
          onToggle={() => toggle('appearance')}
        />
        <PromoSection
          config={config.promo}
          onChange={promo => onChange({ ...config, promo })}
          isOpen={openSection === 'promo'}
          onToggle={() => toggle('promo')}
        />
      </div>
    </div>
  )
}
