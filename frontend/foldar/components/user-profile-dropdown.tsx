"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, MapPin, Package, CreditCard, Bell } from "lucide-react"
import Link from "next/link"
import { UserProfileModal } from "@/components/user-profile-modal"

// Mock user data - in real app, this would come from your auth context
const mockUser = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder.svg",
  location: { lat: 27.7172, lng: 85.324 }, // Kathmandu, Nepal
  items: ["Web Development", "UI/UX Design", "Consulting", "Training"],
  isLoggedIn: true, // Change this to false to test login state
}

export function UserProfileDropdown() {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [user] = useState(mockUser) // In real app, get from auth context

  const handleLogout = () => {
    // In real app, handle logout logic
    console.log("Logging out...")
    window.location.href = "/login"
  }

  if (!user.isLoggedIn) {
    return (
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Quick Stats */}
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Location Set</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span>{user.items.length} Items</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Your Services:</p>
              <div className="flex flex-wrap gap-1">
                {user.items.slice(0, 3).map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {user.items.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.items.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/credits">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={user} />
    </>
  )
}
