import React from 'react'
import footerSrc from '../../assets/icons/footer.png'

interface CheckoutFooterProps {
  className?: string
  style?: React.CSSProperties
}

export function CheckoutFooter({ className = '', style }: CheckoutFooterProps) {
  return (
    <div className={`bg-white ${className}`} style={style}>
      <img src={footerSrc} alt="Footer" className="w-full block" draggable={false} />
    </div>
  )
}
