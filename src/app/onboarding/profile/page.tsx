"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  User,
  Users,
  Building,
  Zap,
  Target,
  Heart,
} from "lucide-react";

interface ProfileData {
  role: string;
  painPoints: string[];
  vipContacts: Array<{
    name: string;
    email: string;
    relationship: string;
  }>;
}

const roles = [
  {
    id: "executive",
    label: "Executive",
    icon: Building,
    description: "C-Suite, VP, Director",
  },
  {
    id: "manager",
    label: "Manager",
    icon: Users,
    description: "Team Lead, Project Manager",
  },
  {
    id: "individual",
    label: "Individual Contributor",
    icon: User,
    description: "Specialist, Analyst",
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    icon: Zap,
    description: "Founder, Consultant",
  },
];

const painPoints = [
  { id: "overwhelm", label: "Email Overwhelm", icon: Target },
  { id: "prioritization", label: "Poor Prioritization", icon: Zap },
  { id: "response-time", label: "Slow Response Times", icon: Heart },
  { id: "context-switching", label: "Context Switching", icon: Target },
  { id: "meeting-coordination", label: "Meeting Coordination", icon: Users },
  { id: "follow-ups", label: "Follow-up Management", icon: CheckCircle },
];

export default function OnboardingProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    role: "",
    painPoints: [],
    vipContacts: [{ name: "", email: "", relationship: "" }],
  });

  const handleRoleSelect = (roleId: string) => {
    setProfileData((prev) => ({ ...prev, role: roleId }));
  };

  const handlePainPointToggle = (painPointId: string) => {
    setProfileData((prev) => ({
      ...prev,
      painPoints: prev.painPoints.includes(painPointId)
        ? prev.painPoints.filter((id) => id !== painPointId)
        : [...prev.painPoints, painPointId],
    }));
  };

  const handleVipContactChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setProfileData((prev) => ({
      ...prev,
      vipContacts: prev.vipContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  };

  const addVipContact = () => {
    setProfileData((prev) => ({
      ...prev,
      vipContacts: [
        ...prev.vipContacts,
        { name: "", email: "", relationship: "" },
      ],
    }));
  };

  const removeVipContact = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      vipContacts: prev.vipContacts.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (step === 1 && profileData.role && profileData.painPoints.length > 0) {
      setStep(2);
    } else if (step === 2) {
      // Save profile data and proceed to dashboard
      localStorage.setItem("napoleon-profile", JSON.stringify(profileData));
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cartier-50 to-gold-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-brand-burgundy rounded-full flex items-center justify-center mx-auto"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-cartier-900">
              {step === 1 ? "Tell us about yourself" : "VIP Contacts"}
            </h1>
            <p className="text-cartier-600">
              {step === 1
                ? "Help Napoleon understand your role and challenges"
                : "Add your most important contacts for priority handling"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-cartier-200 rounded-full h-2">
            <motion.div
              className="bg-brand-burgundy h-2 rounded-full"
              initial={{ width: step === 1 ? "50%" : "100%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Role Selection */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-cartier-900">
                    What&apos;s your role?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <motion.button
                          key={role.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            profileData.role === role.id
                              ? "border-brand-burgundy bg-brand-burgundy bg-opacity-10"
                              : "border-cartier-200 hover:border-cartier-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-6 h-6 text-brand-burgundy" />
                            <div className="text-left">
                              <h3 className="font-semibold text-cartier-900">
                                {role.label}
                              </h3>
                              <p className="text-sm text-cartier-600">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Pain Points Selection */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-cartier-900">
                    What are your biggest challenges?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {painPoints.map((painPoint) => {
                      const Icon = painPoint.icon;
                      return (
                        <motion.button
                          key={painPoint.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePainPointToggle(painPoint.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                            profileData.painPoints.includes(painPoint.id)
                              ? "border-brand-burgundy bg-brand-burgundy bg-opacity-10"
                              : "border-cartier-200 hover:border-cartier-300"
                          }`}
                        >
                          <Icon className="w-5 h-5 text-brand-burgundy" />
                          <span className="text-sm font-medium text-cartier-900">
                            {painPoint.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* VIP Contacts */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-cartier-900">
                    VIP Contacts
                  </h2>
                  <p className="text-cartier-600">
                    Add your most important contacts. Napoleon will prioritize
                    their messages.
                  </p>

                  {profileData.vipContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 p-4 border border-cartier-200 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) =>
                            handleVipContactChange(
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="focus:ring-brand-burgundy"
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={contact.email}
                          onChange={(e) =>
                            handleVipContactChange(
                              index,
                              "email",
                              e.target.value,
                            )
                          }
                          className="focus:ring-brand-burgundy"
                        />
                        <Input
                          placeholder="Relationship"
                          value={contact.relationship}
                          onChange={(e) =>
                            handleVipContactChange(
                              index,
                              "relationship",
                              e.target.value,
                            )
                          }
                          className="focus:ring-brand-burgundy"
                        />
                      </div>
                      {profileData.vipContacts.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVipContact(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove Contact
                        </Button>
                      )}
                    </motion.div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addVipContact}
                    className="w-full"
                  >
                    + Add Another Contact
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="px-6 py-2 rounded-2xl"
            >
              Skip for now
            </Button>

            <div className="flex space-x-3">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 rounded-2xl"
                >
                  Back
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={
                  step === 1 &&
                  (!profileData.role || profileData.painPoints.length === 0)
                }
                className="px-6 py-2 rounded-2xl bg-black text-white hover:bg-brand-burgundy"
              >
                {step === 1 ? "Next" : "Complete Setup"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
