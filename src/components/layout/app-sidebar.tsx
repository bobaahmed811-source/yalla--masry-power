'use client';

import {
  BookOpenCheck,
  LayoutDashboard,
  BookCopy,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'All Courses', icon: BookCopy },
  { href: '#', label: 'Messages', icon: MessageSquare },
  { href: '#', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BookOpenCheck className="size-6 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline">EdTech</span>
        </div>
      </SidebarHeader>

      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      <SidebarFooter>
        <Separator className="my-2" />
        <p className="text-xs text-sidebar-foreground/60 p-2 group-data-[collapsible=icon]:hidden">
          © 2024 EdTech Inc.
        </p>
      </SidebarFooter>
    </>
  );
}
