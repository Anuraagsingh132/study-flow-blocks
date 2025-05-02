
import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, BookOpen, CheckCircle, FileText, BarChart, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { icon: Calendar, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Subjects", path: "/subjects" },
    { icon: FileText, label: "Notes", path: "/notes" },
    { icon: CheckCircle, label: "Goals", path: "/goals" },
    { icon: BarChart, label: "Progress", path: "/progress" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center p-4 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-semibold text-primary flex-1">StudyFlow</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="flex-1 pt-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            S
          </div>
          {!collapsed && <span className="font-medium">Student</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
