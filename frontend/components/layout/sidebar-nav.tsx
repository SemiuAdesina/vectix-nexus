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
    <nav className="flex-1 overflow-y-auto py-6 px-3">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className={idx > 0 ? 'mt-8' : ''}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-3">
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-[0.2em]">
                {section.title}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
          )}
          <div className="space-y-1">
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
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="text-[13px] font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md
                          ${item.badge === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-500 animate-pulse'
                            : 'bg-primary/15 text-primary'
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
