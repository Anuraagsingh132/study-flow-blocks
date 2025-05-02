
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Target,
  LineChart,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/",
    },
    {
      title: "Subjects",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/subjects",
    },
    {
      title: "Notes",
      icon: <FileText className="h-5 w-5" />,
      path: "/notes",
    },
    {
      title: "Goals",
      icon: <Target className="h-5 w-5" />,
      path: "/goals",
    },
    {
      title: "Progress",
      icon: <LineChart className="h-5 w-5" />,
      path: "/progress",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center h-[60px] px-4 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">StudyFlow</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", collapsed ? "mx-auto" : "ml-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex flex-col flex-1 py-4 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors",
              location.pathname === item.path
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </div>

      <div className="p-3 mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50", 
            collapsed && "justify-center"
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
