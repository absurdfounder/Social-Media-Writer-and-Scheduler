import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
  X, CheckCircle2, Check, Sparkles,
  GithubIcon, Infinity,
  UserPen,
  SquareUserRound,
  User
} from 'lucide-react';

export const ProfileManager = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfile, setEditingProfile] = useState(null);
  const [currentProfileId, setCurrentProfileId] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    loadUserProfiles();
  }, [auth.currentUser]);

  const loadUserProfiles = async () => {
    if (!auth.currentUser) return;

    try {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      const loadedProfiles = [];
      querySnapshot.forEach((doc) => {
        loadedProfiles.push({ id: doc.id, ...doc.data() });
      });

      if (loadedProfiles.length === 0) {
        // Create default profile if none exists
        const defaultProfile = {
          id: Date.now().toString(),
          name: 'Default Profile',
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        };
        await createProfileInFirebase(defaultProfile);
        loadedProfiles.push(defaultProfile);
      }

      setProfiles(loadedProfiles);

      // Set current profile
      const savedProfileId = localStorage.getItem('currentProfileId');
      const validProfile = loadedProfiles.find(p => p.id === savedProfileId) || loadedProfiles[0];
      setCurrentProfileId(validProfile.id);
      onProfileSelect(validProfile);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    }
  };

  const createProfileInFirebase = async (profileData) => {
    console.log('Starting profile creation with data:', profileData);
    
    if (!auth.currentUser) {
        console.error('No authenticated user found');
        throw new Error('User must be authenticated to create profile');
    }

    try {
        console.log('Creating profile with ID:', profileData.id);
        
        const profileRef = doc(db, 'profiles', profileData.id);
        const data = {
            name: profileData.name,
            userId: auth.currentUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Profile data to be saved:', data);
        
        await setDoc(profileRef, data);
        console.log('Profile created successfully');
        
        return data;
    } catch (error) {
        console.error('Detailed error creating profile:', {
            error,
            errorCode: error.code,
            errorMessage: error.message,
            userId: auth.currentUser?.uid,
            profileId: profileData.id
        });
        throw error;
    }
};

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    try {
      const newProfile = {
        id: Date.now().toString(),
        name: newProfileName,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      };

      await createProfileInFirebase(newProfile);

      setProfiles([...profiles, newProfile]);
      setCurrentProfileId(newProfile.id);
      onProfileSelect(newProfile);
      localStorage.setItem('currentProfileId', newProfile.id);

      setNewProfileName('');
      setIsModalOpen(false);
      toast.success('Profile created successfully');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  const handleSwitchProfile = async (profileId) => {
    const selectedProfile = profiles.find(p => p.id === profileId);
    if (selectedProfile) {
      setCurrentProfileId(profileId);
      localStorage.setItem('currentProfileId', profileId);
      onProfileSelect(selectedProfile);
      setIsModalOpen(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (profiles.length <= 1) {
      toast.error('Cannot delete the last profile');
      return;
    }

    try {
      await setDoc(doc(db, 'profiles', profileId), {
        deleted: true,
        deletedAt: new Date().toISOString()
      }, { merge: true });

      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);

      if (currentProfileId === profileId) {
        const newCurrentProfile = updatedProfiles[0];
        setCurrentProfileId(newCurrentProfile.id);
        localStorage.setItem('currentProfileId', newCurrentProfile.id);
        onProfileSelect(newCurrentProfile);
      }

      toast.success('Profile deleted successfully');
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !newProfileName.trim()) return;

    try {
      await setDoc(doc(db, 'profiles', editingProfile.id), {
        name: newProfileName,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const updatedProfiles = profiles.map(profile =>
        profile.id === editingProfile.id
          ? { ...profile, name: newProfileName }
          : profile
      );

      setProfiles(updatedProfiles);
      setEditingProfile(null);
      setNewProfileName('');
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 p-2 px-6 bg-gray-50 border rounded-md">
          <span className="items-center text-green-600 flex gap-2">
          <User className="h-4 w-4" />
            {profiles.find(p => p.id === currentProfileId)?.name || 'Select Profile'}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="items-center flex gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
        >
          <UserPen className="h-4 w-4" /> Manage Profiles
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Profile Management</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {profiles.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium">{profile.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleSwitchProfile(profile.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(profile);
                          setNewProfileName(profile.name);
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                      >
                        Edit
                      </button>
                      {profiles.length > 1 && (
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2">
                  {editingProfile ? 'Edit Profile' : 'Create New Profile'}
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter profile name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={editingProfile ? handleEditProfile : handleCreateProfile}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                  >
                    {editingProfile ? 'Save' : 'Create'}
                  </button>
                  {editingProfile && (
                    <button
                      onClick={() => {
                        setEditingProfile(null);
                        setNewProfileName('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;