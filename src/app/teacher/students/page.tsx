'use client';

import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function StudentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
            <h1 className="text-4xl font-black text-surface-900 tracking-tight">Quản lý Học sinh</h1>
          </div>
          <p className="text-surface-500 font-medium md:ml-15">Danh sách và thông tin chi tiết học sinh của bạn</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-brand-primary/20 group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Thêm học sinh mới
          </Button>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-surface-100 mb-8 flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300" />
          <input 
            type="text" 
            placeholder="Tìm kiếm học sinh theo tên, mã số..."
            className="w-full h-12 pl-12 pr-4 bg-surface-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/10 font-medium"
          />
        </div>
        <Button variant="outline" className="rounded-xl h-12 border-surface-100">
          <Filter className="w-4 h-4 mr-2" />
          Lọc danh sách
        </Button>
      </motion.div>

      {/* Placeholder for list */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white py-32 text-center rounded-[3rem] border-2 border-dashed border-surface-100">
          <Users className="w-20 h-20 text-surface-100 mx-auto mb-6" />
          <p className="text-surface-400 font-bold text-lg">Chưa có dữ liệu học sinh</p>
        </div>
      </div>
    </div>
  );
}
