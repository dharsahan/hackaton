'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/imageUtils';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        farmName: '',
        location: '',
        bio: '',
        role: 'owner',
        image: ''
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (session?.user?.email) {
            const fetchProfile = async () => {
                try {
                    const userRef = doc(db, 'users', session.user!.email!);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setProfile({
                            name: data.name || session.user?.name || '',
                            farmName: data.farmName || '',
                            location: data.location || '',
                            bio: data.bio || '',
                            role: data.role || 'owner',
                            image: data.image || session.user?.image || ''
                        });
                    } else {
                        // Fallback to session data
                        setProfile(prev => ({
                            ...prev,
                            name: session.user?.name || '',
                            image: session.user?.image || ''
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        } else if (status === 'authenticated') {
            // If no email (unlikely), stop loading
            setLoading(false);
        }
    }, [session, status, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) return;

        setSaving(true);
        try {
            const userRef = doc(db, 'users', session.user.email);
            await setDoc(userRef, {
                ...profile,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await compressImage(file);
                setProfile(prev => ({ ...prev, image: base64 }));
            } catch (error) {
                console.error("Error compressing image:", error);
                alert("Failed to process image. It might be too large.");
            }
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const avatarUrl = profile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'Farmer')}`;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 md:pb-8 no-scrollbar">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                        <p className="text-sm text-gray-500">Manage your farm and account</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center space-y-4">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                                <Image 
                                    src={avatarUrl} 
                                    alt={profile.name} 
                                    width={96} 
                                    height={96} 
                                    className="object-cover"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-icons text-white text-xl">add_a_photo</span>
                                    <span className="text-[8px] text-white font-bold uppercase tracking-wider mt-1">Change</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name || 'Your Name'}</h2>
                            <p className="text-xs text-primary font-bold uppercase tracking-widest">{profile.role}</p>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Account Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <input
                                    required
                                    value={profile.name}
                                    onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-900 dark:text-white"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Role</label>
                                <select
                                    value={profile.role}
                                    onChange={e => setProfile({...profile, role: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-900 dark:text-white"
                                >
                                    <option value="owner">Farm Owner</option>
                                    <option value="worker">Worker / Staff</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <input
                                disabled
                                value={session?.user?.email || ''}
                                className="w-full p-3 bg-gray-100 dark:bg-gray-800/50 rounded-2xl text-sm outline-none border border-transparent text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Farm Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Farm Information</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Farm Name</label>
                            <input
                                value={profile.farmName}
                                onChange={e => setProfile({...profile, farmName: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Green Valley Estates"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Location</label>
                            <div className="relative">
                                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">location_on</span>
                                <input
                                    value={profile.location}
                                    onChange={e => setProfile({...profile, location: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-gray-900 dark:text-white"
                                    placeholder="e.g. Punjab, India"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Bio / Description</label>
                            <textarea
                                value={profile.bio}
                                onChange={e => setProfile({...profile, bio: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all min-h-[100px] resize-none text-gray-900 dark:text-white"
                                placeholder="Briefly describe your farm or role..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-icons text-sm">save</span>
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
