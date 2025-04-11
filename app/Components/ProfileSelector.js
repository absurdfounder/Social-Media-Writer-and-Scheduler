import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Blocks } from 'lucide-react';

const ProfileSelector = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    // Load selected profile from localStorage
    const savedProfile = localStorage.getItem('selectedTweetProfile');
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    }

    // Load all profiles from localStorage
    const savedProfiles = localStorage.getItem('tweetgendata');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
  }, []);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    localStorage.setItem('selectedTweetProfile', JSON.stringify(profile));
    onProfileSelect(profile);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-2">
          <Blocks size={16} />
          <span>{selectedProfile ? selectedProfile.name : 'Select Profile'}</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Select Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a profile to use for tweet generation
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          {profiles.map((profile, index) => (
            <button
              key={index}
              onClick={() => handleProfileSelect(profile)}
              className={`p-4 rounded-lg border transition-all ${
                selectedProfile?.name === profile.name
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-gray-200 hover:border-slate-300'
              }`}
            >
              <h3 className="font-semibold">{profile.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
            </button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProfileSelector;