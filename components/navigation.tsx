"use client"

import { useState } from "react"
import Link from "next/link"
import { RefreshCw, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Leaf from "@/components/ui/leaf"


interface NavigationProps {
  user: any
  refreshing: boolean
  refreshData: () => void
  handleSignOut: () => void
}

export default function Navigation({ user, refreshing, refreshData, handleSignOut }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Plants", href: "/plants" },
    { name: "Analytics", href: "/analytics" },
    { name: "Settings", href: "/settings" },
  ]

  return (
    <>
      {/* Header */}
    <header className="bg-white dark:bg-gray-900 border-b border-emerald-200 shadow-sm px-4 py-3 flex justify-between items-center lg:hidden">
      <div className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-emerald-600" />
        <h1 className="text-xl font-bold text-emerald-800 dark:text-white">MangroveID</h1>
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-2 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-800"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </header>

    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0`}
    >
      <div className="flex flex-col h-full p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Leaf className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-white">MangroveID</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-md text-emerald-800 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Footer / Actions */}
        <div className="mt-auto flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center justify-start gap-2 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <div className="text-sm font-medium text-emerald-800 dark:text-white truncate">
            {user.user_metadata?.display_name || user.email}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-gray-700 dark:text-white dark:hover:bg-emerald-800 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>

    </>
  )
}
