import React, { useState } from 'react';
import { ProfileManager } from './ProfileManager';
import { QuestionnaireManager } from './QuestionnaireManager';

const TrainingDataManager = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileManager onProfileSelect={handleProfileSelect} />
      <QuestionnaireManager currentProfile={selectedProfile} />
    </div>
  );
};

export default TrainingDataManager;