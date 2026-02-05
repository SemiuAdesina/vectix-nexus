'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_SECTIONS } from './sidebar-config';

interface SidebarNavProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ collapsed, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className={idx > 0 ? 'mt-8' : ''}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-3">
              <div className="w-0.5 h-3 rounded-full bg-primary/80" />
              <span className="text-[10px] font-bold text-muted-foreground/70 tracking-[0.2em] uppercase">
                {section.title}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/20 via-border to-transparent" />
            </div>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary))] border border-primary/20'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]" />
                  )}
                  <item.icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]' : 'group-hover:text-primary'}`} />
                  {!collapsed && (
                    <>
                      <span className="text-[13px] font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-colors
                          ${item.badge === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse shadow-[0_0_12px_-4px_rgba(52,211,153,0.4)]'
                            : 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
