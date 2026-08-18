import React, { useEffect, useState } from 'react';
import { useShop } from '../../store';
import { getViewsForLastDays, subscribeToTodayViews } from '../../firebase';

interface DayViews {
  date: string;
  views: number;
}

const USD_TO_INR = 84;
const READ_PRICE_USD = 0.06 / 100000;
const WRITE_PRICE_USD = 0.18 / 100000;
const EGRESS_PRICE_USD_PER_GB = 0.12;
const STORAGE_PRICE_USD_PER_GB_MONTH = 0.026;
const FREE_READS_PER_DAY = 50000;
const FREE_WRITES_PER_DAY = 20000;
const FREE_STORAGE_GB = 1;
const AVG_MB_PER_VIEW = 0.5;
const AVG_IMG_MB = 0.15;
const IMGS_PER_PRODUCT = 3;
const CONFIG_DOCS_PER_VISIT = 6;
const VIEW_WRITES_PER_VIEW = 0.6;

const inr = (usd: number) => `₹${(usd * USD_TO_INR).toFixed(2)}`;

const formatDay = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const AnalyticsTab: React.FC = () => {
  const { products, orders } = useShop();
  const [todayViews, setTodayViews] = useState(0);
  const [history, setHistory] = useState<DayViews[]>([]);

  useEffect(() => {
    const unsub = subscribeToTodayViews(setTodayViews);
    getViewsForLastDays(7).then(setHistory);
    const interval = setInterval(() => {
      getViewsForLastDays(7).then(setHistory);
    }, 60000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const readsPerView = products.length + CONFIG_DOCS_PER_VISIT;

  const costForViews = (views: number) => {
    const reads = views * readsPerView;
    const paidReads = Math.max(0, reads - FREE_READS_PER_DAY);
    const readCost = paidReads * READ_PRICE_USD;

    const writes = views * VIEW_WRITES_PER_VIEW + Math.round(orders.length / 30);
    const paidWrites = Math.max(0, writes - FREE_WRITES_PER_DAY);
    const writeCost = paidWrites * WRITE_PRICE_USD;

    const egressGB = (views * AVG_MB_PER_VIEW) / 1024;
    const egressCost = egressGB * EGRESS_PRICE_USD_PER_GB;

    return { reads, writes, egressGB, readCost, writeCost, egressCost, total: readCost + writeCost + egressCost };
  };

  const today = costForViews(todayViews);
  const total7 = history.reduce((sum, d) => sum + d.views, 0);
  const monthProjection = (total7 / 7) * 30;

  const storageGB = Math.max(0, (products.length * IMGS_PER_PRODUCT * AVG_IMG_MB) / 1024 - FREE_STORAGE_GB);
  const storageCost = storageGB * STORAGE_PRICE_USD_PER_GB_MONTH;
  const monthTotal = costForViews(monthProjection).total + storageCost;

  const maxViews = Math.max(1, ...history.map(d => d.views));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Views Today (Live)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{todayViews.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Views Last 7 Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total7.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Est. Cost Today</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inr(today.total)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Est. Cost / Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inr(monthTotal)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Views — Last 7 Days</h2>
        <div className="space-y-3">
          {history.map(day => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 w-14">{formatDay(day.date)}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-md transition-all"
                  style={{ width: `${(day.views / maxViews) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-900 w-16 text-right">{day.views.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-1">Firebase Cost Breakdown (Today)</h2>
        <p className="text-[11px] text-gray-400 mb-4">Estimate — exact bill Firebase console → Billing me dekho. Prices: reads $0.06/100K, writes $0.18/100K, downloads $0.12/GB, storage $0.026/GB. Free daily: 50K reads, 20K writes.</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Firestore reads <span className="text-gray-400">({today.reads.toLocaleString('en-IN')} / 50K free)</span></span>
            <span className="font-semibold text-gray-900">{inr(today.readCost)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Firestore writes <span className="text-gray-400">({Math.round(today.writes).toLocaleString('en-IN')} / 20K free)</span></span>
            <span className="font-semibold text-gray-900">{inr(today.writeCost)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Image downloads <span className="text-gray-400">({today.egressGB.toFixed(2)} GB)</span></span>
            <span className="font-semibold text-gray-900">{inr(today.egressCost)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Storage space <span className="text-gray-400">({storageGB.toFixed(2)} GB over 1GB free, monthly)</span></span>
            <span className="font-semibold text-gray-900">{inr(storageCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Today Total</span>
            <span className="font-bold text-gray-900">{inr(today.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;