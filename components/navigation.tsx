"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BubbleButton } from "@/components/bubble-button"
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [avatar, setAvatar] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const { user: userData, logout } = useAuth()

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/cnn", label: "CNN", icon: "🧠", external: false },
    { href: "/detection", label: "Detection", icon: "🎯", external: false },
    { href: "/command-center", label: "Command Center", icon: "⚡", external: false },
    { href: "/analytics", label: "Analytics", icon: "📊" },
  ]

  // Set avatar when userData changes
  useEffect(() => {
    if (userData?.avatar) {
      setAvatar(userData.avatar)
    }
  }, [userData])

  const goToContact = () => {
    console.log("Contact button clicked, navigating to /contact")
    router.push("/contact")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/try")
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-2xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative w-full">
            {/* Logo and Brand */}
            <div className="flex items-center flex-shrink-0">
              <div className="hidden lg:flex items-center space-x-3">
                <img src="/logos/mareye-logo.png" alt="MarEye Logo" className="w-10 h-10 drop-shadow-lg" />
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-orbitron font-black tracking-wider text-cyan-400 drop-shadow-lg">
                    MAREYE
                  </span>
                  <span className="text-[10px] font-space-mono text-cyan-300/60 font-bold tracking-widest uppercase">
                    TACTICAL COMMAND
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center ml-8 flex-1 justify-center">
              <div className="flex items-center gap-1 bg-slate-900/40 backdrop-blur-xl rounded-full p-1.5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  if (item.external) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-space-mono font-bold uppercase tracking-wider transition-all duration-300 group text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20"
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    )
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-space-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? "text-cyan-100 bg-cyan-500/20 shadow-lg shadow-cyan-500/20 border border-cyan-400/50"
                          : "text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/10"
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Profile and Contact */}
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-md overflow-hidden border-2 border-cyan-400/40 group-hover:border-cyan-300/60 transition-colors duration-300">
                      {avatar ? (
                        <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                          <User className="w-3 h-3 text-cyan-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-[10px] font-space-mono font-bold text-cyan-100 uppercase tracking-wider">
                      {userData?.firstName || "OPERATOR"}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-cyan-400 transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-950/80 backdrop-blur-2xl rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 py-3 z-50">
                    <div className="px-4 py-3 border-b border-cyan-500/20">
                      <div className="text-sm font-orbitron font-bold text-cyan-100 tracking-wide">
                        {userData?.firstName} {userData?.lastName}
                      </div>
                      <div className="text-xs font-space-mono text-cyan-300/60">{userData?.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-space-mono text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/20 transition-colors duration-200 uppercase tracking-wider font-bold"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <div className="border-t border-cyan-500/20 my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-space-mono text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors duration-200 w-full text-left uppercase tracking-wider font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Button */}
              <Link href="/contact" className="hidden sm:block">
                <BubbleButton className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 hover:shadow-lg hover:shadow-emerald-400/30 transition-all duration-300 px-3 py-1.5 text-[10px] font-space-mono font-bold uppercase tracking-wider">
                  CONTACT
                </BubbleButton>
              </Link>
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="lg:hidden ml-4">
              <BubbleButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100 transition-all duration-300 border border-cyan-500/20"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </BubbleButton>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-slate-950/60 backdrop-blur-2xl border-t border-cyan-500/20 rounded-b-2xl shadow-2xl shadow-cyan-500/10">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  if (item.external) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 px-4 py-3 text-xs font-space-mono font-bold rounded-lg transition-all duration-300 text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/20 uppercase tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    )
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 text-xs font-space-mono font-bold rounded-lg transition-all duration-300 uppercase tracking-wider ${
                        isActive
                          ? "text-cyan-100 bg-cyan-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                          : "text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/10"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                {/* Mobile Profile Section */}
                {userData && (
                  <div className="pt-4 border-t border-cyan-500/20">
                    <div className="px-4 py-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-cyan-400/40">
                          {avatar ? (
                            <img
                              src={avatar || "/placeholder.svg"}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                              <User className="w-5 h-5 text-cyan-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-space-mono font-bold text-cyan-100 uppercase tracking-wider">
                            {userData.firstName}
                          </div>
                          <div className="text-[10px] font-space-mono text-cyan-300/60">{userData.email}</div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-space-mono text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/20 rounded-lg transition-colors duration-200 mt-2 uppercase tracking-wider font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-space-mono text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors duration-200 w-full text-left mt-2 uppercase tracking-wider font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block">
                    <BubbleButton className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 font-space-mono font-bold uppercase tracking-wider">
                      Contact Us
                    </BubbleButton>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />}
    </>
  )
}
