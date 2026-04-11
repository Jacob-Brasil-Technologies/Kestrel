"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { SidebarView } from "@/lib/instance/instance-provider"

export function NavMain({
  items,
  onNavigate,
}: {
  items: {
    title: string
    view: SidebarView
    icon?: React.ReactNode
    isActive?: boolean
  }[]
  onNavigate: (view: SidebarView) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Server</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={item.isActive}
              onClick={() => onNavigate(item.view)}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
