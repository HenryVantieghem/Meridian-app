"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Settings,
  LogOut,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  Palette,
} from "lucide-react";
import Image from "next/image";

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("w-full max-w-2xl mx-auto", className)}
      >
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Typography
              variant="h2"
              className="text-2xl font-bold text-gray-900"
            >
              Profile
            </Typography>
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Image
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-1 bg-brand-burgundy text-white rounded-full hover:bg-brand-burgundy-dark transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First name
                      </label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last name
                      </label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      loading={isSaving}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Typography
                    variant="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {user.fullName || "No name set"}
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    {user.primaryEmailAddress?.emailAddress}
                  </Typography>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 mt-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit profile</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <Typography
              variant="h3"
              className="text-lg font-semibold text-gray-900 mb-4"
            >
              Account Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="memberSince"
                  className="block text-sm font-medium text-gray-700"
                >
                  Member since
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      <Modal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Settings"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <Typography
                  variant="body"
                  className="font-medium text-gray-900"
                >
                  Privacy & Security
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  Manage your privacy settings and security preferences
                </Typography>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <Typography
                  variant="body"
                  className="font-medium text-gray-900"
                >
                  Notifications
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  Configure email and push notifications
                </Typography>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer">
              <Palette className="h-5 w-5 text-gray-400" />
              <div>
                <Typography
                  variant="body"
                  className="font-medium text-gray-900"
                >
                  Appearance
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  Customize your interface theme and preferences
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
