import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { sidebarLinks } from '@/config/rolesConfig';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils'; // Import the cn utility

export const AppSidebar = () => {
  const { user } = useUser();
  const { open } = useSidebar();
  
  // Dr. X's Note: Added a null check for 'user' to prevent crashes on initial load.
  const userLinks = user ? sidebarLinks[user.role] || [] : [];

  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon || Icons.Circle; // Default to Circle icon if not found
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            {open ? 'Navigation' : 'Nav'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {userLinks.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {open ? 'No navigation items available' : '—'}
              </div>
            ) : (
              <SidebarMenu>
                {userLinks.map((link) => {
                  const IconComponent = getIcon(link.icon);
                  return (
                    <SidebarMenuItem key={link.path}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={link.path}
                          // Dr. X's Fix: Use `cn` to merge base styles with active styles.
                          className={({ isActive }) =>
                            cn(
                              // These are the base/inactive styles
                              "text-sidebar-foreground hover:bg-sidebar-accent/50",
                              // These styles are conditionally applied when active
                              isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )
                          }
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{link.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};