import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { PlaygroundConfig } from '../types'

function generateReact(config: PlaygroundConfig): string {
  const { checkoutMode, paymentMethods, appearance, background, promo } = config
  const enabledMethods = paymentMethods.filter(m => m.enabled).sort((a, b) => a.order - b.order).map(m => m.id)
  const promoCodesStr = promo.validCodes.map(c => `'${c.code}'`).join(', ')
  return `import { Checkout } from '@appcharge/checkout-react'

export function GameStore() {
  return (
    <Checkout
      express={${checkoutMode.hasExpressMethods}}
      userMode="${checkoutMode.userMode}"
      paymentMethods={[${enabledMethods.map(m => `'${m}'`).join(', ')}]}
      primaryColor="${appearance.primaryColor}"
      buttonRadius={${appearance.buttonRadius}}
      inputRadius={${appearance.inputRadius}}${background.imageUrl ? `
      backgroundImage="${background.imageUrl.startsWith('blob:') ? '[uploaded-image]' : background.imageUrl}"
      backgroundOverlay={${background.overlay}}
      backgroundBlur={${background.blur}}` : ''}${promo.enabled ? `
      promoCodes={[${promoCodesStr}]}` : ''}
    />
  )
}`
}

function generateJSON(config: PlaygroundConfig): string {
  const { checkoutMode, paymentMethods, appearance, background, promo, products } = config
  const enabledMethods = paymentMethods.filter(m => m.enabled).sort((a, b) => a.order - b.order).map(m => m.id)
  const obj = {
    express: checkoutMode.hasExpressMethods,
    userMode: checkoutMode.userMode,
    paymentMethods: enabledMethods,
    appearance: { primaryColor: appearance.primaryColor, buttonRadius: appearance.buttonRadius, inputRadius: appearance.inputRadius },
    background: background.imageUrl ? {
      imageUrl: background.imageUrl.startsWith('blob:') ? '[uploaded-image]' : background.imageUrl,
      opacity: background.opacity, overlay: background.overlay, blur: background.blur, fit: background.fit,
    } : null,
    promo: { enabled: promo.enabled, validCodes: promo.validCodes.map(c => c.code) },
    products: { title: products.offerTitle, currency: products.currency, subtotal: products.subtotal, items: products.items.map(i => ({ name: i.name, quantity: i.quantity })) },
  }
  return JSON.stringify(obj, null, 2)
}

function generateEmbed(config: PlaygroundConfig): string {
  const { checkoutMode, paymentMethods, appearance } = config
  const enabledMethods = paymentMethods.filter(m => m.enabled).sort((a, b) => a.order - b.order).map(m => m.id)
  return `<script src="https://cdn.appcharge.com/checkout.js"></script>
<script>
  AppCharge.init({
    container: '#checkout-root',
    express: ${checkoutMode.hasExpressMethods},
    userMode: '${checkoutMode.userMode}',
    paymentMethods: [${enabledMethods.map(m => `'${m}'`).join(', ')}],
    theme: {
      primaryColor: '${appearance.primaryColor}',
      buttonRadius: ${appearance.buttonRadius},
      inputRadius: ${appearance.inputRadius},
    },
  })
</script>
<div id="checkout-root"></div>`
}

type Tab = 'react' | 'json' | 'embed'

export function CodePanel({ config }: { config: PlaygroundConfig }) {
  const [tab, setTab] = useState<Tab>('react')
  const [copied, setCopied] = useState(false)

  const code = tab === 'react' ? generateReact(config) : tab === 'json' ? generateJSON(config) : generateEmbed(config)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden' }}>
      {/* rd-tabs style: gap 6px, padding 12px 16px, border-bottom */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f5',
        flexShrink: 0,
        background: '#fff',
      }}>
        {(['react', 'json', 'embed'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              height: 36,
              border: `1px solid ${tab === t ? '#d1d1e0' : '#e4e4ec'}`,
              borderRadius: 10,
              background: tab === t ? '#fff' : '#f7f7fa',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              color: tab === t ? '#18181b' : '#71717a',
              cursor: 'pointer',
              transition: 'all .15s',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)' : 'none',
            }}
          >
            {t === 'react' ? 'React' : t === 'json' ? 'JSON' : 'Script'}
          </button>
        ))}
      </div>

      {/* Section: title + copy */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#71717a' }}>
          {tab === 'react' ? 'React Component' : tab === 'json' ? 'JSON Config' : 'Script Embed'}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 28, padding: '0 10px',
            border: '1px solid #e4e4ec', borderRadius: 7,
            background: '#fff', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 500,
            color: copied ? '#16a34a' : '#3f3f46',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0 16px 16px', background: '#fafafa' }}>
        <pre style={{ fontSize: 11, fontFamily: 'monospace', color: '#3f3f46', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
