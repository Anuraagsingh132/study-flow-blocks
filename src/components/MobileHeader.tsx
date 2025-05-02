
import React, { useState } from "react";
import { Menu, X, Calendar, BookOpen, CheckCircle, FileText, BarChart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Calendar, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Subjects", path: "/subjects" },
    { icon: FileText, label: "Notes", path: "/notes" },
    { icon: CheckCircle, label: "Goals", path: "/goals" },
    { icon: BarChart, label: "Progress", path: "/progress" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">StudyFlow</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsOpen(false)}
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
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
