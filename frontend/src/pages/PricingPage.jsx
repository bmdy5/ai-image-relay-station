import React from 'react';
import MobilePricingPage from './MobilePricingPage';
import PCPricingPage from './PCPricingPage';

const PricingPage = ({ isMobile }) => {
  return isMobile ? <MobilePricingPage isMobile={isMobile} /> : <PCPricingPage isMobile={isMobile} />;
};

export default PricingPage;
