'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, Search, X } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { handbook, matchesGuideSearch, type GuideTopic } from './content';
import styles from './handbook.module.css';
import { GuidePictures } from './GuidePictures';

export function Handbook() {
  const { language } = useLanguage();
  const content = handbook[language];
  const [query, setQuery] = useState('');
  const topics: GuideTopic[] = content.topics;
  const visible = topics.filter(topic => matchesGuideSearch(
    [topic.title, topic.summary, topic.note, ...topic.steps.flatMap(step => [step.title, step.text])].join(' '), query,
  ));
  const faqs = content.faqs.filter(faq => matchesGuideSearch(`${faq.q} ${faq.a}`, query));
  const searching = Boolean(query.trim());
  const count = visible.length + (faqs.length ? 1 : 0);

  return <main id="handbook-top" className={styles.page}>
    <a className={styles.skip} href="#handbook-content">{language === 'vi' ? 'Đến nội dung hướng dẫn' : 'Skip to the guide'}</a>
    <header className={styles.intro}>
      <div className={styles.heading}>
        <BookOpen className={styles.book} aria-hidden="true" />
        <h1>{language === 'vi' ? 'Hướng dẫn sử dụng' : 'Your My Student guide'}</h1>
        <p className={styles.lead}>{content.title}</p>
        <p className={styles.description}>{content.description}</p>
      </div>
      <div className={styles.searchArea}>
        <label htmlFor="handbook-search">{content.search}</label>
        <div className={styles.searchBox}>
          <Search aria-hidden="true" />
          <input id="handbook-search" type="search" value={query} placeholder={content.placeholder}
            onChange={event => setQuery(event.target.value)} aria-controls="handbook-content" />
          {query && <button type="button" aria-label={content.clear} onClick={() => setQuery('')}><X /></button>}
        </div>
        <p className={styles.searchHint} role="status" aria-live="polite">
          {searching ? `${count} ${content.result}` : language === 'vi' ? 'Tìm theo việc bạn cần làm, có dấu hoặc không dấu.' : 'Search for the task you need, one step at a time.'}
        </p>
      </div>
    </header>

    {!searching && <section className={styles.quick} aria-labelledby="quick-heading">
      <h2 id="quick-heading">{content.quickTitle}</h2>
      <ol>{content.quick.map((step, index) => <li key={step.href}>
        <a href={step.href}><span className={styles.stepNumber}>{index + 1}</span><span><strong>{step.title}</strong><span>{step.text}</span></span><ArrowUpRight aria-hidden="true" /></a>
      </li>)}</ol>
    </section>}

    <div className={styles.layout}>
      <aside className={styles.contents}>
        <nav aria-label={content.contents}>
          <h2>{content.contents}</h2>
          <ul>{visible.map(topic => <li key={topic.id}><a href={`#${topic.id}`}>{topic.title}</a></li>)}
            {faqs.length > 0 && <li><a href="#troubleshooting">{content.faqTitle}</a></li>}
          </ul>
          <a href="#handbook-top" className={styles.topLink}>{content.backTop}<ArrowUpRight aria-hidden="true" /></a>
        </nav>
      </aside>
      <div id="handbook-content" className={styles.reading} tabIndex={-1}>
        {count === 0 && <div className={styles.empty}>
          <Search aria-hidden="true" /><h2>{content.empty}</h2><p>{content.emptyText}</p>
          <button type="button" onClick={() => setQuery('')}>{content.reset}<ArrowRight aria-hidden="true" /></button>
        </div>}
        {visible.map(topic => <section key={topic.id} id={topic.id} className={styles.topic} aria-labelledby={`${topic.id}-heading`}>
          <h2 id={`${topic.id}-heading`}>{topic.title}</h2>
          <p className={styles.summary}>{topic.summary}</p>
          <ol className={styles.steps}>{topic.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
          <GuidePictures topic={topic.id} language={language} />
          <div className={styles.note}><CheckCircle2 aria-hidden="true" /><p><strong>{content.note}. </strong>{topic.note}</p></div>
          {topic.link && <Link className={styles.action} href={topic.link.href}>{topic.link.label}<ArrowRight aria-hidden="true" /></Link>}
        </section>)}
        {faqs.length > 0 && <section id="troubleshooting" className={styles.topic} aria-labelledby="faq-heading">
          <h2 id="faq-heading">{content.faqTitle}</h2><p className={styles.summary}>{content.faqIntro}</p>
          <div className={styles.faq}>{faqs.map(faq => <details key={faq.q} open={searching || undefined}>
            <summary>{faq.q}<ChevronDown aria-hidden="true" /></summary><p>{faq.a}</p>
          </details>)}</div>
        </section>}
        <footer className={styles.footer}><BookOpen aria-hidden="true" /><p>{content.footer}</p><a href="#handbook-top">{content.backTop}<ArrowUpRight aria-hidden="true" /></a></footer>
      </div>
    </div>
  </main>;
}
