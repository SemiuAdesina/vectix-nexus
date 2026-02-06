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
    <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 mb-2">
              <div className="w-1 h-3 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
              <span className="text-[10px] font-semibold text-slate-500 tracking-[0.18em] uppercase">
                {section.title}
              </span>
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
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 shadow-[0_0_20px_-8px_rgba(20,184,166,0.25)]'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-l-2 border-transparent'
                    }
                  `}
                >
                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-teal-400' : 'group-hover:text-teal-400/90'}`}
                  />
                  {!collapsed && (
                    <>
                      <span className="text-[13px] font-medium truncate flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`
                            text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0
                            ${item.badge === 'LIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 animate-pulse'
                              : 'bg-teal-500/15 text-teal-400 border-teal-500/40'
                            }
                          `}
                        >
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
