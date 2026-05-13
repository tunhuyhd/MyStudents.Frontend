'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Zap, Users, Leaf, Trees } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen relative overflow-hidden bg-transparent text-surface-900">
      {/* Nature-inspired Orbs */}
      <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-brand-primary/10 rounded-full filter blur-[120px] animate-blob" />
      <div className="absolute -bottom-20 -right-10 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full filter blur-[150px] animate-blob animation-delay-2000" />
      
      {/* Decorative Leaf Icons */}
      <div className="absolute top-40 right-[10%] opacity-20 animate-sway">
        <Leaf className="w-12 h-12 text-brand-primary" />
      </div>
      <div className="absolute bottom-40 left-[5%] opacity-10 animate-sway animation-delay-3000">
        <Trees className="w-20 h-20 text-brand-primary" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8 bg-brand-primary/10 rounded-full border border-brand-primary/20">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            <span className="text-xs font-black text-brand-primary uppercase tracking-widest">
              {t('home.badge')}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-surface-900 leading-[1.1]">
            {t('home.heroTitle')} <br />
            <span className="gradient-text-nature">{t('home.heroSubTitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {t('home.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-3xl text-lg shadow-2xl shadow-brand-primary/40">
                {t('common.getStarted')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-12 rounded-3xl text-lg border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 bg-white">
                {t('common.login')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: t('home.features.flex'), desc: t('home.features.flexDesc'), color: "bg-emerald-50 text-emerald-600" },
            { icon: ShieldCheck, title: t('home.features.secure'), desc: t('home.features.secureDesc'), color: "bg-teal-50 text-teal-600" },
            { icon: Users, title: t('home.features.connect'), desc: t('home.features.connectDesc'), color: "bg-sky-50 text-sky-600" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.01 }}
              className="bg-white/70 backdrop-blur-sm p-10 rounded-[3rem] border border-brand-primary/10 shadow-xl shadow-brand-primary/5"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-surface-900">{feature.title}</h3>
              <p className="text-surface-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 py-20 text-center border-t border-brand-primary/5">
        <div className="flex items-center justify-center space-x-3 mb-4 opacity-50">
          <Trees className="w-6 h-6 text-brand-primary" />
          <span className="font-black text-surface-900 tracking-tighter">MyStudents 2026</span>
        </div>
        <p className="text-surface-400 text-xs font-bold uppercase tracking-widest">
          {language === 'vi' ? 'Sức sống Dương Liễu - Tương lai vươn xa' : 'Willow Vitality - Reaching the Future'}
        </p>
      </footer>
    </main>
  );
}
