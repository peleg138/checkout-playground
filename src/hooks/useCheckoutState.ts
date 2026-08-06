import React, { useState, useCallback } from 'react'
import type {
  CheckoutState,
  Screen,
  PaymentMethod,
  CardFormData,
  CardFormErrors,
  OtherPaymentFormData,
} from '../types/checkout'
import { mockOrder } from '../data/mockData'

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return 'Enter a valid email address'
  return undefined
}

function validateCardNumber(num: string): string | undefined {
  const digits = num.replace(/\s/g, '')
  if (!digits) return 'Card number is required'
  if (digits.length < 13) return 'Enter a valid card number'
  return undefined
}

function validateExpiry(expiry: string): string | undefined {
  if (!expiry) return 'Expiry is required'
  const parts = expiry.split('/')
  if (parts.length !== 2) return 'Enter MM/YY'
  const month = parseInt(parts[0], 10)
  const year = parseInt('20' + parts[1], 10)
  if (isNaN(month) || isNaN(year)) return 'Enter MM/YY'
  if (month < 1 || month > 12) return 'Invalid month'
  const now = new Date()
  const expDate = new Date(year, month - 1, 1)
  if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) return 'Card is expired'
  return undefined
}

function validateCvc(cvc: string): string | undefined {
  if (!cvc) return 'CVC is required'
  if (cvc.length < 3) return 'Enter a valid CVC'
  return undefined
}

function validateZip(zip: string): string | undefined {
  if (!zip.trim()) return 'ZIP code is required'
  if (zip.trim().length < 3) return 'Enter a valid ZIP'
  return undefined
}

const initialState: CheckoutState = {
  screen: 'checkout',
  headerExpanded: true,
  selectedPaymentMethod: 'card',
  userMode: 'new',
  selectedSavedCardId: null,
  showAddNewCard: false,
  cardForm: {
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: '',
    saveCard: false,
  },
  cardErrors: {},
  otherForm: {
    method: 'cashapp',
    email: '',
    address: '',
    city: '',
    state: '',
  },
  promoCode: '',
  promoStatus: 'idle',
  promoDiscount: 0,
  promoLabel: '',
  hasSubmitted: false,
  hasExpressMethods: true,
  expressButtonType: 'apple' as const,
}

export function useCheckoutState(
  validPromoCodes?: Array<{ code: string; discount: number; label: string }>,
  /** Multi-offers starts collapsed so the offer list is opt-in; single offer stays open. */
  initialHeaderExpanded = true,
) {
  const [state, setState] = useState<CheckoutState>({ ...initialState, headerExpanded: initialHeaderExpanded })
  // Use a ref so applyPromoCode always sees the latest codes without stale closure
  const promoCodesRef = React.useRef(validPromoCodes ?? mockOrder.validPromoCodes)
  promoCodesRef.current = validPromoCodes ?? mockOrder.validPromoCodes

  const setScreen = useCallback((screen: Screen) => {
    setState(s => ({ ...s, screen }))
  }, [])

  const toggleHeader = useCallback(() => {
    setState(s => ({ ...s, headerExpanded: !s.headerExpanded }))
  }, [])

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(s => ({ ...s, selectedPaymentMethod: method }))
  }, [])

  const updateCardForm = useCallback((field: keyof CardFormData, value: string | boolean) => {
    setState(s => {
      let processed = value
      if (field === 'cardNumber' && typeof value === 'string') {
        const digits = value.replace(/\D/g, '').slice(0, 16)
        processed = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
      }
      if (field === 'expiry' && typeof value === 'string') {
        const digits = value.replace(/\D/g, '').slice(0, 4)
        if (digits.length >= 3) {
          processed = digits.slice(0, 2) + '/' + digits.slice(2)
        } else {
          processed = digits
        }
      }
      if (field === 'cvc' && typeof value === 'string') {
        processed = value.replace(/\D/g, '').slice(0, 4)
      }
      if (field === 'zip' && typeof value === 'string') {
        processed = value.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10)
      }
      const newForm = { ...s.cardForm, [field]: processed }
      let newErrors = { ...s.cardErrors }
      if (s.hasSubmitted) {
        if (field === 'email') newErrors.email = validateEmail(newForm.email)
        if (field === 'cardNumber') newErrors.cardNumber = validateCardNumber(newForm.cardNumber)
        if (field === 'expiry') newErrors.expiry = validateExpiry(newForm.expiry)
        if (field === 'cvc') newErrors.cvc = validateCvc(newForm.cvc)
        if (field === 'zip') newErrors.zip = validateZip(newForm.zip)
      }
      return { ...s, cardForm: newForm, cardErrors: newErrors }
    })
  }, [])

  const updateOtherForm = useCallback((field: keyof OtherPaymentFormData, value: string) => {
    setState(s => ({ ...s, otherForm: { ...s.otherForm, [field]: value } }))
  }, [])

  const setPromoCode = useCallback((code: string) => {
    setState(s => ({ ...s, promoCode: code }))
  }, [])

  const applyPromoCode = useCallback(() => {
    setState(s => {
      const upper = s.promoCode.trim().toUpperCase()
      const found = promoCodesRef.current.find(p => p.code === upper)
      if (found) {
        return {
          ...s,
          promoStatus: 'success',
          promoDiscount: found.discount,
          promoLabel: found.label,
        }
      }
      if (upper === 'EXPIRED') {
        return { ...s, promoStatus: 'expired', promoDiscount: 0, promoLabel: '' }
      }
      return { ...s, promoStatus: 'error', promoDiscount: 0, promoLabel: '' }
    })
  }, [])

  const clearPromo = useCallback(() => {
    setState(s => ({
      ...s,
      promoCode: '',
      promoStatus: 'idle',
      promoDiscount: 0,
      promoLabel: '',
    }))
  }, [])

  const setHasExpressMethods = useCallback((has: boolean) => {
    setState(s => ({ ...s, hasExpressMethods: has }))
  }, [])

  const setExpressButtonType = useCallback((type: 'apple' | 'google' | 'paypal') => {
    setState(s => ({ ...s, expressButtonType: type }))
  }, [])

  const setUserMode = useCallback((mode: 'new' | 'saved') => {
    setState(s => ({
      ...s,
      userMode: mode,
      selectedSavedCardId: mode === 'saved' ? (mockOrder.savedCards[0]?.id ?? null) : null,
    }))
  }, [])

  const selectSavedCard = useCallback((id: string) => {
    setState(s => ({ ...s, selectedSavedCardId: id }))
  }, [])

  const submitPayment = useCallback(async () => {
    setState(s => {
      const errors = {
        email: validateEmail(s.cardForm.email),
        cardNumber: validateCardNumber(s.cardForm.cardNumber),
        expiry: validateExpiry(s.cardForm.expiry),
        cvc: validateCvc(s.cardForm.cvc),
        zip: validateZip(s.cardForm.zip),
      }
      const hasErrors = Object.values(errors).some(Boolean)
      if (hasErrors) {
        return { ...s, cardErrors: errors, hasSubmitted: true }
      }
      return { ...s, cardErrors: errors, hasSubmitted: true }
    })

    setState(s => {
      const errors = {
        email: validateEmail(s.cardForm.email),
        cardNumber: validateCardNumber(s.cardForm.cardNumber),
        expiry: validateExpiry(s.cardForm.expiry),
        cvc: validateCvc(s.cardForm.cvc),
        zip: validateZip(s.cardForm.zip),
      }
      const hasErrors = Object.values(errors).some(Boolean)
      if (hasErrors) return s
      return { ...s, screen: 'processing' }
    })
  }, [])

  const processPayment = useCallback((onDone: (result: 'success' | 'declined') => void) => {
    const timer = setTimeout(() => {
      const rand = Math.random()
      onDone(rand < 0.8 ? 'success' : 'declined')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const effectiveTotal = mockOrder.pricing.total - state.promoDiscount

  return {
    state,
    effectiveTotal,
    setScreen,
    toggleHeader,
    setPaymentMethod,
    updateCardForm,
    updateOtherForm,
    setPromoCode,
    applyPromoCode,
    clearPromo,
    setHasExpressMethods,
    setExpressButtonType,
    setUserMode,
    selectSavedCard,
    submitPayment,
    processPayment,
    reset,
  }
}
