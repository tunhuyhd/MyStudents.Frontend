'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from './icons';

type Option = { value: string; label: string; disabled?: boolean };
type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  label: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
};

/** Select-only combobox: focus stays on the trigger, including inside modal focus scopes. */
export function Select({ value, onChange, options, label, disabled, className = '', icon }: SelectProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 180, maxHeight: 280 });
  const search = useRef({ text: '', time: 0 });
  const selected = options.find(option => option.value === value);
  const unavailable = disabled || !options.some(option => !option.disabled);

  function place() {
    const box = trigger.current?.getBoundingClientRect();
    if (!box) return;
    const below = window.innerHeight - box.bottom - 12;
    const above = box.top - 12;
    const expected = Math.min(options.length * 44 + 12, 280);
    const upward = below < expected && above > below;
    const height = Math.max(44, Math.min(expected, upward ? above : below));
    const width = Math.min(Math.max(box.width, 180), window.innerWidth - 16);
    setPosition({ top: upward ? Math.max(8, box.top - height - 6) : box.bottom + 6,
      left: Math.max(8, Math.min(box.left, window.innerWidth - width - 8)), width, maxHeight: height });
  }
  function show(index = options.findIndex(option => option.value === value)) {
    if (unavailable) return;
    place();
    setActive(index >= 0 && !options[index]?.disabled ? index : Math.max(0, options.findIndex(option => !option.disabled)));
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled || unavailable) return;
    setOpen(false);
    trigger.current?.focus();
    if (option.value !== value) onChange(option.value);
  }
  function move(direction: number) {
    for (let offset = 1; offset <= options.length; offset++) {
      const next = (active + direction * offset + options.length) % options.length;
      if (!options[next].disabled) { setActive(next); break; }
    }
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (unavailable) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') {
      if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Enter' || event.key === ' ') { if (open) choose(active); else show(); }
      else if (event.key === 'Home' || event.key === 'End') {
        const index = event.key === 'Home' ? options.findIndex(option => !option.disabled) : options.findLastIndex(option => !option.disabled);
        if (!open) show(index); else setActive(index);
      } else if (!open) show(); else move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      search.current = { text: now - search.current.time < 800 ? search.current.text + event.key : event.key, time: now };
      const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      const match = (text: string) => options.findIndex(option => !option.disabled && normalize(option.label).startsWith(normalize(text)));
      let index = match(search.current.text);
      if (index < 0) { search.current.text = event.key; index = match(event.key); }
      if (index >= 0) { if (!open) show(index); else setActive(index); }
    }
  }

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) setOpen(false);
    };
    // Portalled options avoid clipping in table scroll regions and modal bodies.
    const reposition = () => place();
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  // Geometry is measured on open and on viewport/scroll events, never from the render path.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options.length]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, id]);

  return <>
    <button ref={trigger} type="button" role="combobox" aria-label={label} aria-haspopup="listbox"
      aria-expanded={open && !unavailable} aria-controls={open && !unavailable ? `${id}-list` : undefined}
      aria-activedescendant={open && !unavailable ? `${id}-option-${active}` : undefined}
      disabled={unavailable} className={`club-select ${className}`} onKeyDown={keyDown}
      onClick={() => open ? setOpen(false) : show()}
      onBlur={event => { if (!popup.current?.contains(event.relatedTarget as Node)) setOpen(false); }}>
      {icon && <span className="club-select-icon" aria-hidden="true">{icon}</span>}
      <span className="club-select-value">{selected?.label || label}</span><ChevronDown className="club-select-caret" />
    </button>
    {open && !unavailable && createPortal(<div ref={popup} id={`${id}-list`} role="listbox" aria-label={label}
      className="club-select-list" style={position} onPointerDown={event => event.preventDefault()}>
      {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option"
        aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
        data-active={index === active || undefined} className="club-select-option"
        onPointerMove={() => { if (!option.disabled) setActive(index); }} onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Check />}
      </div>)}
    </div>, document.body)}
  </>;
}
