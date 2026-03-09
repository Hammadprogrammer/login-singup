'use client'
import React, { useState } from 'react'
import KycStatusBanner from '../kyc-user/page'
import AuthWrapper from '@/component/sell_product/check-user-login/check-user-login'
import PricingPlans from '@/component/sell_product/pakages/pakages'

const Page = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Ye component khud hi API check karega aur zarurat padne par popup dikhayega */}
      <AuthWrapper isVisible={isOpen} onClose={() => setIsOpen(false)} />
      
      <KycStatusBanner />
      <PricingPlans />
    </>
  )
}

export default Page;