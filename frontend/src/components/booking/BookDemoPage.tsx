import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Bot, 
  ShieldCheck, 
  Star, 
  ChevronDown,
  Database,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';

export const BookDemoPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  // Booking Step State: 1 = Date & Time Selection, 2 = User Info & Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Dynamic Calendar State based on System Current Date
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const formatIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const detectUserTimeZone = (): string => {
    try {
      const timeZoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZoneStr) {
        if (timeZoneStr.includes('Kolkata') || timeZoneStr.includes('Calcutta') || timeZoneStr.includes('Asia/Colombo')) {
          return 'IST (UTC+5:30)';
        }
        if (timeZoneStr.includes('New_York') || timeZoneStr.includes('Toronto') || timeZoneStr.includes('America/Indiana')) {
          return 'EST (UTC-5)';
        }
        if (timeZoneStr.includes('Los_Angeles') || timeZoneStr.includes('Vancouver')) {
          return 'PST (UTC-8)';
        }
        if (timeZoneStr.includes('London') || timeZoneStr.includes('Dublin') || timeZoneStr.includes('UTC')) {
          return 'GMT (UTC+0)';
        }
        if (timeZoneStr.includes('Tokyo')) {
          return 'JST (UTC+9)';
        }
        const offsetMinutes = -new Date().getTimezoneOffset();
        const hours = Math.floor(Math.abs(offsetMinutes) / 60);
        const minutes = Math.abs(offsetMinutes) % 60;
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const formattedOffset = `UTC${sign}${hours}${minutes ? `:${minutes}` : ''}`;
        return `${timeZoneStr} (${formattedOffset})`;
      }
    } catch (_e) {}
    return 'IST (UTC+5:30)';
  };

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [rawDateInput, setRawDateInput] = useState<string>(formatIsoDate(today));
  const [dateError, setDateError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('02:30 PM');
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(() => detectUserTimeZone());

  // Form State
  const [productSelected, setProductSelected] = useState<string>('Dezoryn Technologies Sales Intelligence');
  const [teamSize, setTeamSize] = useState<string>('10-50');
  const [expectedUsers, setExpectedUsers] = useState<string>('25');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('Form submitted successfully!');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Time slots definition
  const timeSlots = [
    { time: '09:00 AM', period: 'Morning', status: 'Available' },
    { time: '10:00 AM', period: 'Morning', status: 'Popular' },
    { time: '11:30 AM', period: 'Morning', status: 'Available' },
    { time: '01:30 PM', period: 'Afternoon', status: 'Available' },
    { time: '02:30 PM', period: 'Afternoon', status: 'Recommended' },
    { time: '03:30 PM', period: 'Afternoon', status: 'Available' },
    { time: '04:30 PM', period: 'Afternoon', status: 'Limited' },
    { time: '05:30 PM', period: 'Evening', status: 'Available' },
  ];

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isPastDate = (date: Date) => {
    const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const dateReset = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return dateReset < todayReset;
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Quick Shortcuts
  const setShortcutDate = (offsetDays: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays);
    setSelectedDate(d);
    setRawDateInput(formatIsoDate(d));
    setCurrentCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1));
    if (isPastDate(d)) {
      setDateError('Please select a current or future date.');
    } else {
      setDateError(null);
    }
  };

  const handleManualDateChange = (val: string) => {
    setRawDateInput(val);
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    if (y && m && d) {
      const parsed = new Date(y, m - 1, d, 0, 0, 0, 0);
      setSelectedDate(parsed);
      setCurrentCalendarDate(new Date(y, m - 1, 1));
      if (isPastDate(parsed)) {
        setDateError('Please select a current or future date.');
      } else {
        setDateError(null);
      }
    }
  };

  const handleSelectCalendarDate = (dateObj: Date) => {
    setSelectedDate(dateObj);
    setRawDateInput(formatIsoDate(dateObj));
    if (isPastDate(dateObj)) {
      setDateError('Please select a current or future date.');
    } else {
      setDateError(null);
    }
  };

  const handleProceedToStep2 = () => {
    if (isPastDate(selectedDate)) {
      setDateError('Please select a current or future date.');
      return;
    }
    setDateError(null);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (isPastDate(selectedDate)) {
      setDateError('Please select a current or future date.');
      setCurrentStep(1);
      return;
    }

    const formattedSelectedDate = formatDateDisplay(selectedDate);
    const isoDateString = formatIsoDate(selectedDate);

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      productSelected,
      teamSize,
      expectedUsers,
      notes: formData.notes,
      bookingDate: isoDateString,
      formattedBookingDate: formattedSelectedDate,
      bookingTimeSlot: selectedTimeSlot,
      timeZone: selectedTimeZone,
      idempotencyKey,
    };

    setIsSubmitting(true);
    setDateError(null);
    setApiError(null);

    try {
      const res = await apiFetch('/demos/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload)
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch (_jsonErr) {
        result = {};
      }

      if (!res.ok || !result.success || !result.data?.id || result.data?.calendarInviteStatus === 'FAILED') {
        const msg = result.message || result.error?.message || (result.data?.calendarInviteStatus === 'FAILED' ? 'Booking saved, but calendar invitation generation failed.' : `Booking request failed (HTTP ${res.status}). Please try again.`);
        if (msg.toLowerCase().includes('date')) {
          setDateError(msg);
          setCurrentStep(1);
        } else {
          setApiError(msg);
        }
        setIsSubmitting(false);
        return;
      }

      const bookedData = result.data || payload;
      setConfirmedBooking(bookedData);

      // UI cache convenience only (backend is authoritative source of truth)
      try {
        const existing = localStorage.getItem('dezocrm_demo_bookings');
        const bookingsArray = existing ? JSON.parse(existing) : [];
        bookingsArray.unshift(bookedData);
        localStorage.setItem('dezocrm_demo_bookings', JSON.stringify(bookingsArray));
      } catch (_err) {}

      setIsSubmitted(true);
      setToastMessage('Form submitted successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err: any) {
      console.error('[BookDemo] Submission Error:', err);
      setApiError(err?.message || 'Unable to connect to the backend booking server. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How long does the product demo take?',
      a: 'A standard product demonstration takes 30 minutes. We tailor the walkthrough specifically to your organization’s workflow and requirements.'
    },
    {
      q: 'Can my engineering or security team join the call?',
      a: 'Absolutely. We encourage technical and leadership stakeholders to join so we can answer compliance, architecture, and deployment questions directly.'
    },
    {
      q: 'Is there any commitment required after booking a demo?',
      a: 'None at all. The demo is completely free. We will also provide custom trial access to your team after the walkthrough.'
    },
    {
      q: 'Will I get access to a sandbox environment?',
      a: 'Yes! Following the live demo, our solutions architect will provision a personalized trial sandbox loaded with sample data for your evaluation.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[9999] bg-slate-900/95 dark:bg-slate-900/95 border border-emerald-500/50 text-white px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3.5 max-w-md cursor-pointer"
            onClick={() => setShowToast(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Notification</h4>
              <p className="text-xs text-slate-200 font-semibold">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-cyan-500/10 dark:from-blue-600/15 dark:via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* ── HERO BANNER ── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 text-xs font-extrabold text-blue-600 dark:text-cyan-400 mb-4"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
            <span>INTERACTIVE DEMO SCHEDULER</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4"
          >
            Schedule a Live <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-500 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">1-on-1 Product Demo</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed"
          >
            Select your preferred date and time slot below for a personalized product walkthrough with our solutions team.
          </motion.p>
        </div>

        {/* ── STEPPER NAVIGATION TABS ── */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-between shadow-sm">
            
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-none ${
                currentStep === 1
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 1 ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                1
              </div>
              <CalendarIcon className="w-4 h-4" />
              <span>1. Choose Date & Time</span>
            </button>

            <div className="w-8 sm:w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-none ${
                currentStep === 2
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 2 ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                2
              </div>
              <User className="w-4 h-4" />
              <span>2. Your Details</span>
            </button>

          </div>
        </div>

        {/* ── MAIN BOOKING CONTAINER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          
          {/* Main Card (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl relative transition-colors duration-300">
            
            {/* SUCCESS OVERLAY STATE */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/98 dark:bg-slate-950/98 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center overflow-y-auto"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">
                    <Database className="w-3.5 h-3.5" /> Scheduled & Persisted in System Database
                  </span>

                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Demo Successfully Booked!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6">
                    Thank you, <span className="text-blue-600 dark:text-cyan-400 font-bold">{formData.fullName || 'Valued Guest'}</span>! A calendar invite & meeting link have been reserved for <span className="text-blue-600 dark:text-cyan-400 font-bold">{formData.email || 'your email'}</span>.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left w-full max-w-lg mb-8 space-y-3 text-xs">
                    {confirmedBooking?.id && (
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Booking Reference ID:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{confirmedBooking.id}</span>
                      </div>
                    )}

                    {confirmedBooking?.meetingLink && (
                      <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Meeting Room Link:</span>
                        <a
                          href={confirmedBooking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          {confirmedBooking.meetingLink}
                        </a>
                      </div>
                    )}

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Scheduled Date:
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">{formatDateDisplay(selectedDate)}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Scheduled Time:
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedTimeSlot} ({selectedTimeZone})</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Company:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formData.company || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Target Product:</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-bold">{productSelected}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Expected CRM Seats:</span>
                      <span className="text-violet-600 dark:text-violet-400 font-bold">{expectedUsers}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setCurrentStep(1);
                        setFormData({ fullName: '', email: '', phone: '', company: '', notes: '' });
                        setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
                      }}
                      className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition cursor-pointer border-none"
                    >
                      Book Another Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('/products')}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer border-none"
                    >
                      Explore Products
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 1: CALENDAR & TIME SELECTION */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    Select Demo Date & Available Time Slot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose a day and time that works best for your team. Walkthroughs are 30 minutes.
                  </p>
                </div>

                {dateError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{dateError}</span>
                  </div>
                )}

                {/* HTML Date Picker Input bar with min constraint */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2 whitespace-nowrap">
                    <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>Selected Date:</span>
                  </label>
                  <input
                    type="date"
                    min={formatIsoDate(today)}
                    value={rawDateInput}
                    onChange={(e) => handleManualDateChange(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* CALENDAR WIDGET (7 COLS) */}
                  <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
                    
                    {/* Month Controls Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {monthNames[month]} {year}
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextMonth}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Empty padding cells for first day of month */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}

                      {/* Actual Day Buttons */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateObj = new Date(year, month, dayNum);
                        const isSelected = isSameDay(dateObj, selectedDate);
                        const isToday = isSameDay(dateObj, today);
                        const disabled = isPastDate(dateObj);

                        return (
                          <button
                            key={dayNum}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleSelectCalendarDate(dateObj)}
                            className={`h-9 w-full rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                              disabled
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40 bg-slate-100/50 dark:bg-slate-900/30'
                                : isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 font-extrabold scale-105 z-10'
                                : isToday
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-300 dark:border-cyan-500/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{dayNum}</span>
                            {isToday && !isSelected && (
                              <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400 absolute bottom-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Date Shortcuts */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                        Quick Date Selection:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShortcutDate(0)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer transition"
                        >
                          Today ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                        </button>
                        <button
                          type="button"
                          onClick={() => setShortcutDate(1)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer transition"
                        >
                          Tomorrow ({new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                        </button>
                        <button
                          type="button"
                          onClick={() => setShortcutDate(2)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer transition"
                        >
                          {new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShortcutDate(7)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer transition"
                        >
                          Next Week
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* TIME SLOT SELECTION (5 COLS) */}
                  <div className="md:col-span-5 space-y-4">
                    
                    {/* Timezone Selector */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                          Time Zone
                        </label>
                      </div>
                      <select
                        value={selectedTimeZone}
                        onChange={(e) => setSelectedTimeZone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="IST (UTC+5:30)">IST (UTC+5:30) - India Standard Time</option>
                        <option value="EST (UTC-5)">EST (UTC-5) - Eastern Time</option>
                        <option value="PST (UTC-8)">PST (UTC-8) - Pacific Time</option>
                        <option value="GMT (UTC+0)">GMT (UTC+0) - London Time</option>
                        <option value="JST (UTC+9)">JST (UTC+9) - Tokyo Time</option>
                        {!['IST (UTC+5:30)', 'EST (UTC-5)', 'PST (UTC-8)', 'GMT (UTC+0)', 'JST (UTC+9)'].includes(selectedTimeZone) && (
                          <option value={selectedTimeZone}>{selectedTimeZone}</option>
                        )}
                      </select>
                    </div>

                    {/* Time Slots List */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                        Available Time Slots ({selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {timeSlots.map((slot) => {
                          const isSelected = selectedTimeSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-cyan-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold">{slot.time}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-[9px] font-semibold mt-1 ${
                                isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                              }`}>
                                {slot.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>

                {/* SELECTED SUMMARY BAR & NEXT BUTTON */}
                <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wide">
                        Selected Demo Slot
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatDateDisplay(selectedDate)} at {selectedTimeSlot} ({selectedTimeZone})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    disabled={isPastDate(selectedDate)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer inline-flex items-center justify-center gap-2 border-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next: Your Information</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* STEP 2: USER DETAILS & SUBMISSION */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Selected Slot Summary Banner */}
                <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-extrabold uppercase">Scheduled Demo Slot</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatDateDisplay(selectedDate)} @ {selectedTimeSlot} ({selectedTimeZone})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Change Date/Time
                  </button>
                </div>

                {dateError && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{dateError}</span>
                  </div>
                )}

                {apiError && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                      Contact & Company Details
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Fill in your details below so we can assign the right solutions architect to your demo.
                    </p>
                  </div>

                  {/* Personal & Business Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Work Email *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Company Name *</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="company"
                          required
                          placeholder="Acme Corp"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Product</label>
                      <select
                        name="productSelected"
                        value={productSelected}
                        onChange={(e) => setProductSelected(e.target.value)}
                        className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                      >
                        <option>Dezoryn Technologies Sales Intelligence</option>
                        <option>SchoolyCore ERP</option>
                        <option>Hospitality HMS</option>
                        <option>InventoryPro Suite</option>
                        <option>Entire Dezoryn Ecosystem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Company Team Size</label>
                      <select
                        name="teamSize"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                      >
                        <option>1-10 Employees</option>
                        <option>10-50 Employees</option>
                        <option>50-250 Employees</option>
                        <option>250+ Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expected Seats</label>
                      <select
                        name="expectedUsers"
                        value={expectedUsers}
                        onChange={(e) => setExpectedUsers(e.target.value)}
                        className="w-full px-3 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none"
                      >
                        <option>1 - 10 Users</option>
                        <option>10 - 50 Users</option>
                        <option>50 - 200 Users</option>
                        <option>200+ Enterprise Seats</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Additional Notes / Use Case (Optional)</label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Tell us about your current CRM workflow or specific questions for the demo..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer border-none inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Calendar</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-cyan-500/35 transition-all duration-300 cursor-pointer inline-flex items-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isSubmitting ? 'Confirming Booking...' : 'Confirm & Schedule Demo'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

          </div>

          {/* Right Column: AI Assistant Card & Benefits (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live AI Booking Assistant Card */}
            <div className="bg-gradient-to-br from-blue-900/10 via-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 border border-blue-300 dark:border-cyan-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-cyan-500/20 border border-blue-300 dark:border-cyan-400/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Calendar Scheduler</h4>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold uppercase">Real-Time Slot Lock</span>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                "Pick your date & time, submit your info, and our enterprise solutions architect will meet you on Google Meet/Zoom."
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Instant Calendar (.ics) & NDA Included</span>
              </div>
            </div>

            {/* Why Book a Demo List */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">What You'll Receive:</h4>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>Custom walkthrough tailored to your industry verticals</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>Live ROI & deal conversion calculator benchmark</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>Free 14-day pre-configured sandbox trial access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>Dedicated enterprise pricing quote with bulk license discounts</span>
                </li>
              </ul>
            </div>

            {/* Testimonial Quote */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative shadow-sm">
              <div className="flex gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-4">
                "The 30-minute demo completely redefined how our sales reps manage leads. We closed 40% more enterprise deals in Q3 alone."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  MS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Marcus Sterling</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">VP of Revenue, NexaCloud</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── DEMO FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know about our demo process</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer border-none bg-transparent"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-blue-600 dark:text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

