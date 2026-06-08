// src/components/DashboardMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function DashboardMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={menuRef}>

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open menu"
        className="
          relative flex items-center gap-2 overflow-hidden
          rounded-full px-4 py-2 text-sm font-medium
          border border-orange-300/50 dark:border-orange-500/30
          bg-orange-500/10 dark:bg-orange-500/10
          backdrop-blur-md
         text-orange-950 dark:text-black
          shadow-[inset_0_1px_0_rgba(255,230,140,0.45),0_2px_8px_rgba(200,90,0,0.12)]
          hover:bg-orange-500/20
          hover:shadow-[inset_0_1px_0_rgba(255,230,140,0.55),0_4px_16px_rgba(200,90,0,0.2)]
          hover:-translate-y-px active:translate-y-0
          transition-all duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2
          before:absolute before:inset-x-0 before:top-0 before:h-1/2
          before:bg-gradient-to-b before:from-amber-100/30 before:to-transparent
          before:rounded-t-full before:pointer-events-none
        "
      >
        <span className="text-base leading-none">☰</span>
        <span className="hidden sm:inline">Menu</span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="menu"
          className="
            absolute right-0 top-[calc(100%+8px)] z-50 w-56
            rounded-2xl overflow-hidden
            border border-orange-300/35 dark:border-orange-400/20
            bg-orange-50/20 dark:bg-orange-950/20
            backdrop-blur-2xl backdrop-saturate-200
            shadow-[0_8px_32px_rgba(200,90,0,0.15),0_2px_8px_rgba(200,90,0,0.08)]
            ring-1 ring-inset ring-amber-200/40 dark:ring-amber-500/10
            animate-[dropIn_0.18s_cubic-bezier(0.22,1,0.36,1)]
          "
        >
          {/* Top sheen — fakes the curved glass highlight */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-2xl
              bg-gradient-to-b from-amber-100/30 to-transparent opacity-60
            "
          />

          {/* Account */}
          <MenuSection label="Account">
            <MenuItem
              icon="👤"
              onClick={() => {
                console.log('Sign in clicked');
                setIsOpen(false);
              }}
            >
              Sign in <span className="ml-auto opacity-40 text-xs">→</span>
            </MenuItem>
          </MenuSection>

          {/* Dashboards */}
          <MenuSection label="Dashboards">
            <MenuItem icon="📊" href="/business" onClick={() => setIsOpen(false)}>
              Business <MenuBadge active>current</MenuBadge>
            </MenuItem>
            <MenuItem icon="💻" disabled>
              Tech <MenuBadge>soon</MenuBadge>
            </MenuItem>
            <MenuItem icon="🏛️" disabled>
              Politics <MenuBadge>soon</MenuBadge>
            </MenuItem>
          </MenuSection>

          {/* About */}
          <MenuSection>
            <MenuItem
              icon="⭐"
              href="https://github.com/yourusername/mangoboard"
              external
              onClick={() => setIsOpen(false)}
            >
              About Mangoboard
              <span className="ml-auto opacity-40 text-xs">↗</span>
            </MenuItem>
          </MenuSection>

        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MenuSection({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2.5 py-2 border-b border-orange-300/15 dark:border-orange-500/10 last:border-b-0">
      {label && (
        <p className="mb-1.5 px-1.5 text-[10px] font-semibold uppercase tracking-widest text-orange-800 dark:text-orange-300">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MenuItem({
  icon,
  href,
  external,
  disabled,
  onClick,
  children,
}: {
  icon?: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const baseClass = [
    'flex items-center gap-2 w-full rounded-lg px-2 py-[5px]',
    'text-[13.5px] font-medium',
    'text-orange-950 dark:text-white',
    'transition-colors duration-100',
    disabled
      ? 'opacity-35 cursor-not-allowed'
      : 'cursor-pointer hover:bg-orange-400/10 dark:hover:bg-orange-400/10',
  ].join(' ');

  const content = (
    <>
      {icon && <span className="text-sm opacity-70" aria-hidden="true">{icon}</span>}
      {children}
    </>
  );

  const isLink = !!href && !disabled;

  return isLink ? (
  <a
    role="menuitem"
    href={href}
    className={baseClass}
    onClick={onClick}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {content}
  </a>
) : (
  <span
    role="menuitem"
    aria-disabled={disabled}
    className={baseClass}
    onClick={!disabled ? onClick : undefined}
  >
    {content}
  </span>
);
}

function MenuBadge({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`
        ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full border
        ${
          active
            ? 'bg-orange-400/20 border-orange-400/40 text-orange-950 dark:text-orange-200'
            : 'bg-orange-200/15 border-orange-300/25 text-orange-800 dark:text-orange-300'
        }
      `}
    >
      {children}
    </span>
  );
}