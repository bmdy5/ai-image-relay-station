import React from 'react';
import MobileProfilePage from './MobileProfilePage';
import PCProfilePage from './PCProfilePage';

const ProfilePage = ({ isMobile }) => {
  return isMobile ? <MobileProfilePage isMobile={isMobile} /> : <PCProfilePage isMobile={isMobile} />;
};

export default ProfilePage;
