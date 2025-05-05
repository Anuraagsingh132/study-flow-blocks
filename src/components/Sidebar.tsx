import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Book,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={`bg-card border-r transition-all duration-300 h-screen ${
        collapsed ? "w-[70px]" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className={`h-8 w-auto transition-all duration-300 ${
              collapsed ? "scale-75" : "scale-100"
            }`}
          />
          {!collapsed && <span className="ml-2 font-bold">StudyApp</span>}
        </Link>
        <button onClick={toggleSidebar} className="focus:outline-none">
          {collapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="px-3 py-2">
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/subjects"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <Book className="mr-2 h-4 w-4" />
            {!collapsed && <span>Subjects</span>}
          </NavLink>

          <NavLink
            to="/notes"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <ListChecks className="mr-2 h-4 w-4" />
            {!collapsed && <span>Notes</span>}
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <Home className="mr-2 h-4 w-4" />
            {!collapsed && <span>Goals</span>}
          </NavLink>

          <NavLink
            to="/progress"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {!collapsed && <span>Progress</span>}
          </NavLink>
          
          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {!collapsed && <span>AI Assistant</span>}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>

      <div className="absolute bottom-4 left-0 w-full px-3">
        <div className="relative group">
          <div
            className="bg-secondary rounded-md p-2 transition-all duration-300"
            style={{ width: collapsed ? "calc(70px - 24px)" : "calc(100% - 24px)" }}
          >
            {!collapsed && (
              <div className="text-xs text-muted-foreground">
                Upgrade to Pro
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src="/gem.png"
                  alt="Gem"
                  className="h-5 w-5 mr-1"
                />
                {!collapsed && <span className="text-sm font-medium">Pro</span>}
              </div>
              {!collapsed && (
                <span className="text-xs text-muted-foreground">$9.99/mo</span>
              )}
            </div>
          </div>
          <button className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none">
            {/* You can add an overlay or animation here */}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
