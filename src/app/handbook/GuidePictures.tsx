'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from '@/components/ui/icons';
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog';
import { getGuideImages, type GuideImage } from './images';
import styles from './handbook.module.css';

export function GuidePictures({ topic, language }: { topic: string; language: 'vi' | 'en' }) {
  const [selected, setSelected] = useState<GuideImage | null>(null);
  const [originalSize, setOriginalSize] = useState(false);
  const headingId = useId();
  const close = () => { setSelected(null); setOriginalSize(false); };
  const ref = useAccessibleDialog<HTMLDivElement>(Boolean(selected), close);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selected]);
  const copy = language === 'vi' ? {
    sample: 'Ảnh giao diện minh họa · Dữ liệu mẫu', enlarge: 'Phóng to ảnh', close: 'Đóng ảnh',
    actual: 'Xem kích thước gốc', fit: 'Thu vừa màn hình', hint: 'Ở kích thước gốc, cuộn hoặc kéo ngang để xem các khu vực. Nhấn Esc để đóng.',
  } : {
    sample: 'Interface example · Sample data', enlarge: 'Enlarge image', close: 'Close image',
    actual: 'View actual size', fit: 'Fit to screen', hint: 'At actual size, scroll or swipe sideways to explore. Press Esc to close.',
  };

  return <div className={styles.pictures}>
    {getGuideImages(topic, language).map(image => <figure key={image.src} className={styles.picture}>
      <button type="button" className={styles.pictureButton} aria-label={`${copy.enlarge}: ${image.title}`} onClick={() => setSelected(image)}>
        {/* Local, pre-compressed capture with explicit dimensions; no remote or private image source. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
        <span className={styles.enlarge}><Search aria-hidden="true" />{copy.enlarge}</span>
      </button>
      <figcaption><h3>{image.title}</h3><p className={styles.sample}>{copy.sample}</p>
        <ol className={styles.imageLegend}>{image.labels.map((label, i) => <li key={label}><span aria-hidden="true">{i + 1}</span>{label}</li>)}</ol>
      </figcaption>
    </figure>)}
    {selected && createPortal(<div className={styles.viewerBackdrop} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={headingId} data-dialog-focus-scope="true" tabIndex={-1} className={styles.viewer}>
        <header><h2 id={headingId}>{selected.title}</h2><button type="button" onClick={close} aria-label={copy.close}><X aria-hidden="true" /></button></header>
        <div className={styles.viewerToolbar}><button type="button" aria-pressed={originalSize} onClick={() => setOriginalSize(!originalSize)}><Search aria-hidden="true" />{originalSize ? copy.fit : copy.actual}</button><p>{copy.sample}</p></div>
        <div className={styles.viewerImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.src} alt={selected.alt} width={selected.width} height={selected.height}
            style={{ width: originalSize ? `${selected.width}px` : '100%', maxWidth: originalSize ? 'none' : '100%' }} />
        </div>
        <p className={styles.viewerHint}>{copy.hint}</p>
      </div>
    </div>, document.body)}
  </div>;
}
