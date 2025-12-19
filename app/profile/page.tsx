"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Calendar, Camera, LogOut, Shield, 
  CheckCircle2, Edit, Save, X, Sparkles, Zap,
  Activity, TrendingUp, Award, Settings, Lock,
  Bell, CreditCard, Globe, Star, ArrowRight
} from "lucide-react";
import { SonarGridBackground } from "@/components/sonar-grid-background";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  avatar?: string;
  subscription?: {
    plan?: string;
    status?: string;
  };
  tokens?: {
    dailyLimit?: number;
    usedToday?: number;
    totalUsed?: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    async function fetchProfile() {
      try {
        console.log("Fetching profile...");

        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: 'no-store'
        });

        console.log("Response status:", res.status, "OK:", res.ok);

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          data = { error: "Invalid response from server" };
        }

        if (!res.ok) {
          const errorMessage = data?.error ?? data?.message ?? `Request failed (${res.status})`;
          setError(errorMessage);
          return;
        }

        if (!data.user) {
          setError("No user data received from server");
          return;
        }

        setProfile(data.user);
        setEditData(data.user);
      } catch (err) {
        console.error("Fetch profile failed:", err);
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  function logout() {
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .finally(() => {
        try {
          localStorage.removeItem("profile");
          localStorage.removeItem("user");
        } catch (e) {
          console.warn("Could not clear localStorage:", e);
        }
        router.push("/try");
      });
  }

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
        <SonarGridBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center pt-32">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/40 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <p className="text-xl text-cyan-300 font-orbitron tracking-wider">Loading Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
        <SonarGridBackground />
        <div className="relative z-10 min-h-screen flex items-start justify-center p-8 pt-32">
          <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-md border-2 border-red-500/40 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border-2 border-red-500/40">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-red-400 font-orbitron mb-1">Profile Error</h2>
                <p className="text-sm text-red-300/70 font-space-mono">{error ?? "No profile returned"}</p>
              </div>
            </div>

            {error?.includes("Invalid or expired token") || error?.includes("Authentication") || error?.includes("session") ? (
              <div className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-500/40 rounded-xl">
                <p className="text-sm text-yellow-200 mb-2 font-space-mono">
                  Your session has expired. Please log in again to continue.
                </p>
                <p className="text-xs text-yellow-300/70 font-space-mono">
                  Sessions now last 30 days. If you're seeing this frequently, please contact support.
                </p>
              </div>
            ) : null}

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-xl transition-all duration-300 hover:scale-105 font-orbitron tracking-wider shadow-lg shadow-cyan-500/30"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-800/60 backdrop-blur-md border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black rounded-xl transition-all duration-300 font-orbitron tracking-wider"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Activity, 
      label: "Daily Usage", 
      value: `${profile.tokens?.usedToday || 0}/${profile.tokens?.dailyLimit || 10}`,
      color: "cyan"
    },
    { 
      icon: TrendingUp, 
      label: "Total Processed", 
      value: profile.tokens?.totalUsed || 0,
      color: "blue"
    },
    { 
      icon: Award, 
      label: "Plan", 
      value: profile.subscription?.plan?.toUpperCase() || "BASIC",
      color: "emerald"
    },
    { 
      icon: Shield, 
      label: "Status", 
      value: profile.subscription?.status?.toUpperCase() || "ACTIVE",
      color: "purple"
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      <SonarGridBackground />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/40 rounded-2xl blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center border-2 border-cyan-500/60 backdrop-blur-md shadow-2xl shadow-cyan-500/30">
                  <User className="w-10 h-10 text-cyan-300" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent font-orbitron tracking-wider">
                  PROFILE
                </h1>
                <p className="text-lg text-cyan-200 font-space-mono tracking-wider mt-2">
                  MARINE SECURITY SYSTEM | USER ACCOUNT
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                {/* HUD Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />
                
                {/* Scan Line Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
                </div>

                <div className="relative z-10">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-cyan-500/40 rounded-full blur-2xl animate-pulse" />
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500/60 shadow-2xl shadow-cyan-500/30 bg-slate-800">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                            <User className="w-16 h-16 text-cyan-300/50" />
                          </div>
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500/80 hover:bg-cyan-400 rounded-full flex items-center justify-center border-2 border-slate-900 transition-all duration-300 hover:scale-110 shadow-lg">
                        <Camera className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <h2 className="text-2xl font-black text-white font-orbitron mb-1">
                      {profile.firstName || "User"} {profile.lastName || ""}
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-space-mono uppercase tracking-wider">Verified</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-cyan-500/20 text-center">
                      <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-black text-cyan-300 font-orbitron">{profile.tokens?.usedToday || 0}</div>
                      <div className="text-xs text-cyan-300/60 font-space-mono uppercase">Today</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-blue-500/20 text-center">
                      <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-black text-blue-300 font-orbitron">{profile.tokens?.totalUsed || 0}</div>
                      <div className="text-xs text-blue-300/60 font-space-mono uppercase">Total</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={isEditing ? handleSave : handleEdit}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-xl transition-all duration-300 hover:scale-105 font-orbitron tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-5 h-5" />
                          SAVE CHANGES
                        </>
                      ) : (
                        <>
                          <Edit className="w-5 h-5" />
                          EDIT PROFILE
                        </>
                      )}
                    </button>
                    {isEditing && (
                      <button
                        onClick={handleCancel}
                        className="w-full px-4 py-3 bg-slate-800/60 backdrop-blur-md border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black rounded-xl transition-all duration-300 font-orbitron tracking-wider flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        CANCEL
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-400 text-red-300 hover:text-red-200 font-black rounded-xl transition-all duration-300 font-orbitron tracking-wider flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      LOGOUT
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details & Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden group hover:border-cyan-400/60 transition-all duration-300 hover:scale-105"
                  >
                    {/* HUD Corner Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`w-8 h-8 group-hover:scale-110 transition-transform ${
                          stat.color === "cyan" ? "text-cyan-400" :
                          stat.color === "blue" ? "text-blue-400" :
                          stat.color === "emerald" ? "text-emerald-400" :
                          "text-purple-400"
                        }`} />
                        <div className={`px-3 py-1 rounded-lg ${
                          stat.color === "cyan" ? "bg-cyan-500/20 border border-cyan-500/40" :
                          stat.color === "blue" ? "bg-blue-500/20 border border-blue-500/40" :
                          stat.color === "emerald" ? "bg-emerald-500/20 border border-emerald-500/40" :
                          "bg-purple-500/20 border border-purple-500/40"
                        }`}>
                          <span className={`text-xs font-space-mono uppercase tracking-wider font-bold ${
                            stat.color === "cyan" ? "text-cyan-300" :
                            stat.color === "blue" ? "text-blue-300" :
                            stat.color === "emerald" ? "text-emerald-300" :
                            "text-purple-300"
                          }`}>
                            {stat.label}
                          </span>
                        </div>
                      </div>
                      <div className={`text-4xl font-black font-orbitron mb-2 ${
                        stat.color === "cyan" ? "text-cyan-300" :
                        stat.color === "blue" ? "text-blue-300" :
                        stat.color === "emerald" ? "text-emerald-300" :
                        "text-purple-300"
                      }`}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Details Card */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                {/* HUD Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />
                
                {/* Scan Line Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-cyan-300 font-orbitron tracking-wider flex items-center gap-3">
                      <Settings className="w-6 h-6" />
                      ACCOUNT DETAILS
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 rounded-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-space-mono uppercase tracking-wider">Edit</span>
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-xs text-cyan-300/60 font-space-mono uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.firstName || ""}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono focus:border-cyan-400 focus:outline-none transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono">
                          {profile.firstName || "-"}
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-xs text-cyan-300/60 font-space-mono uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.lastName || ""}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono focus:border-cyan-400 focus:outline-none transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono">
                          {profile.lastName || "-"}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs text-cyan-300/60 font-space-mono uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <div className="px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono flex items-center justify-between">
                        <span>{profile.email || "-"}</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-emerald-300 font-space-mono uppercase">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs text-cyan-300/60 font-space-mono uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.dob || ""}
                          onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono focus:border-cyan-400 focus:outline-none transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-slate-800/60 border-2 border-cyan-500/30 rounded-xl text-white font-space-mono">
                          {profile.dob || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription & Security Card */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Subscription Card */}
                <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-black text-cyan-300 font-orbitron tracking-wider">SUBSCRIPTION</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                        <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Plan</span>
                        <span className="text-sm font-black text-cyan-300 font-orbitron">
                          {profile.subscription?.plan?.toUpperCase() || "BASIC"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-emerald-500/20">
                        <span className="text-sm text-emerald-300/60 font-space-mono uppercase">Status</span>
                        <span className="text-sm font-black text-emerald-300 font-orbitron flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {profile.subscription?.status?.toUpperCase() || "ACTIVE"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-lg font-black text-cyan-300 font-orbitron tracking-wider">SECURITY</h4>
                    </div>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800/80 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 group">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-cyan-300 font-space-mono uppercase">Change Password</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800/80 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 group">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-cyan-300 font-space-mono uppercase">Notifications</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
