import { ReactNode, useState, useEffect } from "react";
import {
  FileText,
  SwatchBook,
  Settings,
  Bot,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "@/components/shared/Logo";
import { useTranslations } from "@/i18n";

interface MenuItem {
  title: string;
  url?: string;
  href?: string;
  icon: any;
  items?: { title: string; href: string }[];
}

export default function DashboardClient({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("dashboard");
  const sidebarItems: MenuItem[] = [
    {
      title: t("sidebar.resumes"),
      url: "/app/dashboard/resumes",
      icon: FileText,
    },
    {
      title: t("sidebar.templates"),
      url: "/app/dashboard/templates",
      icon: SwatchBook,
    },
    {
      title: t("sidebar.settings"),
      url: "/app/dashboard/settings",
      icon: Settings,
    },
    {
      title: t("sidebar.ai"),
      url: "/app/dashboard/ai",
      icon: Bot,
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [collapsible] = useState<"offcanvas" | "icon" | "none">("icon");

  useEffect(() => {
    if (location.pathname.includes("/workbench")) {
      setOpen(false);
    }
  }, [location.pathname]);

  const handleItemClick = (item: MenuItem) => {
    navigate(item.url || item.href || "/");
  };

  const isItemActive = (item: MenuItem) => {
    if (item.items) {
      return item.items.some((subItem) => location.pathname === subItem.href);
    }
    return item.url === location.pathname || item.href === location.pathname;
  };

  return (
    <div className="flex min-h-dvh w-full min-w-0 overflow-hidden bg-muted/20">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar collapsible={collapsible}>
          <SidebarHeader>
            <div className="w-full justify-center flex">
              <Logo
                className="cursor-pointer"
                size={40}
                onClick={() => navigate("/")}
              />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <TooltipProvider delayDuration={300} key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuItem key={item.title} title={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isItemActive(item)}
                            >
                              <div
                                className="flex items-center gap-2 p-[8px]"
                                onClick={() => handleItemClick(item)}
                              >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {open && (
                                  <span className="flex-1">{item.title}</span>
                                )}
                              </div>
                            </SidebarMenuButton>
                            {item.items && open && (
                              <div className="ml-6 mt-1 space-y-1">
                                {item.items.map((subItem) => (
                                  <div
                                    key={subItem.href}
                                    className={`cursor-pointer px-2 py-1 rounded-md text-sm ${location.pathname === subItem.href
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50"
                                      }`}
                                    onClick={() => navigate(subItem.href)}
                                  >
                                    {subItem.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </SidebarMenuItem>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent side="right">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-14 shrink-0 items-center border-b bg-background/80 px-2 backdrop-blur md:hidden">
            <SidebarTrigger />
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto overflow-x-clip">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
