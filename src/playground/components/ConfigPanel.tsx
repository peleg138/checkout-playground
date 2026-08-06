import React, { useState } from 'react'
import type { PlaygroundConfig } from '../types'
import { PaymentMethodsSection } from '../sections/PaymentMethodsSection'
import { ProductsSection } from '../sections/ProductsSection'
import { PromoSection } from '../sections/PromoSection'
import { AppearanceSection } from '../sections/AppearanceSection'

interface Props {
  config: PlaygroundConfig
  onChange: (c: PlaygroundConfig) => void
  activeTab: 'config' | 'multi-offers'
  onTabChange: (tab: 'config' | 'multi-offers') => void
}

type Section = 'payments' | 'products' | 'appearance' | 'promo'

export function ConfigPanel({ config, onChange, activeTab, onTabChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>(null)
  const toggle = (s: Section) => setOpenSection(prev => prev === s ? null : s)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
      {/* Sidebar head */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: 'auto',
        padding: '16px 14px 16px 16px',
        borderBottom: '1px solid #e4e4e7',
        flexShrink: 0,
        gap: 2,
      }}>
        {(['config', 'multi-offers'] as PanelTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              height: 30,
              padding: '0 10px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.07em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background .12s, color .12s',
              background: activeTab === tab ? '#f4f4f5' : 'transparent',
              color: activeTab === tab ? '#18181b' : '#71717a',
            }}
          >
            {tab === 'config' ? 'Single Offer' : 'Multi Offers'}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
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
      )}

      {activeTab === 'multi-offers' && (
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
            isMultiOffers
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
      )}
    </div>
  )
}
