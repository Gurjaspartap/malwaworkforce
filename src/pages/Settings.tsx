import { useState, useEffect } from 'react';

export interface PayRules {
  hourlyRate: number;
  defaultStartTime: string;
  overtime15xAfterHours: number;
  overtime2xAfterHours: number;
  saturday15xAfterHours: number;
  saturday2xAfterHours: number;
  sunday15xAfterHours: number;
  sunday2xAfterHours: number;
}

export const DEFAULT_RULES: PayRules = {
  hourlyRate: 20,
  defaultStartTime: '09:00',
  overtime15xAfterHours: 8,
  overtime2xAfterHours: 12,
  saturday15xAfterHours: 0,
  saturday2xAfterHours: 8,
  sunday15xAfterHours: 0,  // 0 means starts immediately at 1.5x (unless 2x is also 0)
  sunday2xAfterHours: 0,   // 0 means starts immediately at 2.0x
};

export default function Settings() {
  const [rules, setRules] = useState<PayRules>(DEFAULT_RULES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedRules = localStorage.getItem('payRules');
    if (savedRules) {
      try {
        setRules({ ...DEFAULT_RULES, ...JSON.parse(savedRules) });
      } catch (e) {
        console.error('Failed to load rules');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setRules(prev => ({
      ...prev,
      [name]: type === 'time' ? value : (parseFloat(value) || 0)
    }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('payRules', JSON.stringify(rules));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Pay Rules Configuration</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '700px' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Standard Rates & Preferences</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Base Hourly Rate ($)</label>
              <input 
                type="number" 
                step="0.01"
                name="hourlyRate"
                className="input-field" 
                value={rules.hourlyRate}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Default Start Time</label>
              <input 
                type="time" 
                name="defaultStartTime"
                className="input-field" 
                value={rules.defaultStartTime}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1.5rem', color: 'var(--accent-primary)' }}>Weekday Overtime (Mon - Fri)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">1.5x Pay After (Hours)</label>
              <input type="number" step="0.5" name="overtime15xAfterHours" className="input-field" value={rules.overtime15xAfterHours} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">2.0x Pay After (Hours)</label>
              <input type="number" step="0.5" name="overtime2xAfterHours" className="input-field" value={rules.overtime2xAfterHours} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1.5rem', color: 'var(--accent-primary)' }}>Saturday Overtime</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">1.5x Pay After (Hours)</label>
              <input type="number" step="0.5" name="saturday15xAfterHours" className="input-field" value={rules.saturday15xAfterHours} onChange={handleChange} />
              <small style={{ color: 'var(--text-muted)' }}>0 means Saturday starts at 1.5x immediately.</small>
            </div>
            <div className="input-group">
              <label className="input-label">2.0x Pay After (Hours)</label>
              <input type="number" step="0.5" name="saturday2xAfterHours" className="input-field" value={rules.saturday2xAfterHours} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1.5rem', color: 'var(--accent-primary)' }}>Sunday Overtime</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">1.5x Pay After (Hours)</label>
              <input type="number" step="0.5" name="sunday15xAfterHours" className="input-field" value={rules.sunday15xAfterHours} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">2.0x Pay After (Hours)</label>
              <input type="number" step="0.5" name="sunday2xAfterHours" className="input-field" value={rules.sunday2xAfterHours} onChange={handleChange} />
              <small style={{ color: 'var(--text-muted)' }}>0 means Sunday starts at 2.0x immediately.</small>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              Save Pay Rules
            </button>
            {saved && <span style={{ color: 'var(--success)', fontWeight: '500' }}>✓ Saved Successfully</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
