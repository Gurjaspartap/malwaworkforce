import { useState, useEffect } from 'react';
import type { PayRules } from './Settings';
import { DEFAULT_RULES } from './Settings';

export default function LogShift() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState(0);
  const [calculation, setCalculation] = useState<{ hours: number; grossPay: number } | null>(null);

  useEffect(() => {
    // Set default date to today
    const now = new Date();
    // Use local timezone formatting for the date input
    const localDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    setDate(localDate);
    
    // Set default end time to right now
    const localTime = now.toTimeString().slice(0, 5);
    setEndTime(localTime);

    // Load Rules to get default start time
    const savedRules = localStorage.getItem('payRules');
    let rules: PayRules = DEFAULT_RULES;
    if (savedRules) {
      try { rules = { ...DEFAULT_RULES, ...JSON.parse(savedRules) }; } catch (e) {}
    }
    setStartTime(rules.defaultStartTime || '09:00');
  }, []);

  const calculatePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;

    // Load Rules
    const savedRules = localStorage.getItem('payRules');
    let rules: PayRules = DEFAULT_RULES;
    if (savedRules) {
      try { rules = { ...DEFAULT_RULES, ...JSON.parse(savedRules) }; } catch (e) {}
    }

    // Date Logic
    const shiftDate = new Date(date);
    const dayOfWeek = shiftDate.getUTCDay(); // 0 is Sunday, 6 is Saturday

    // Time Logic
    const start = new Date(`${date}T${startTime}`);
    let end = new Date(`${date}T${endTime}`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    let diffMs = end.getTime() - start.getTime();
    diffMs -= unpaidBreakMinutes * 60000; // Deduct break
    
    let hoursWorked = diffMs / (1000 * 60 * 60);
    if (hoursWorked < 0) hoursWorked = 0;

    let grossPay = 0;
    
    const calcTieredPay = (hours: number, threshold15x: number, threshold2x: number) => {
      let pay = 0;
      if (hours > threshold2x) {
        const doubleHours = hours - threshold2x;
        const onePointFiveHours = threshold2x - threshold15x;
        const regularHours = threshold15x;
        pay = (doubleHours * rules.hourlyRate * 2) + 
              (onePointFiveHours > 0 ? onePointFiveHours * rules.hourlyRate * 1.5 : 0) +
              (regularHours > 0 ? regularHours * rules.hourlyRate : 0);
      } else if (hours > threshold15x) {
        const onePointFiveHours = hours - threshold15x;
        const regularHours = threshold15x;
        pay = (onePointFiveHours * rules.hourlyRate * 1.5) +
              (regularHours > 0 ? regularHours * rules.hourlyRate : 0);
      } else {
        pay = hours * rules.hourlyRate;
      }
      return pay;
    };

    if (dayOfWeek === 6) {
      // Saturday Rules
      grossPay = calcTieredPay(hoursWorked, rules.saturday15xAfterHours, rules.saturday2xAfterHours);
    } else if (dayOfWeek === 0) {
      // Sunday Rules
      grossPay = calcTieredPay(hoursWorked, rules.sunday15xAfterHours, rules.sunday2xAfterHours);
    } else {
      // Weekday Rules
      grossPay = calcTieredPay(hoursWorked, rules.overtime15xAfterHours, rules.overtime2xAfterHours);
    }

    setCalculation({ hours: hoursWorked, grossPay });
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Log a Shift</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={calculatePay}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Start Time</label>
                <input type="time" className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">End Time</label>
                <input type="time" className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Unpaid Break (Minutes)</label>
              <input type="number" className="input-field" value={unpaidBreakMinutes} onChange={(e) => setUnpaidBreakMinutes(parseInt(e.target.value) || 0)} min="0" />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
              Calculate Earnings
            </button>
          </form>
        </div>

        {calculation && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Estimated Earnings</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
              ${calculation.grossPay.toFixed(2)}
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Total Hours: {calculation.hours.toFixed(2)} hrs
            </div>
            
            <button className="btn btn-secondary w-full" style={{ marginTop: '2rem' }}>
              Save Shift to Cloud
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
