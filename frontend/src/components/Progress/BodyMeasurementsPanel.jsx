import { useCallback, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import bodyMeasurementService from '../../services/bodyMeasurementService';
import StatCard from '../stats/StatCard';
import BodyWeightChart from '../charts/BodyWeightChart';

function iconPath(name) {
  const map = {
    dumbbell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10h2m12 0h2M7 7v6m10-6v6m-7-2h4m-6 7h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    bolt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m13 2-8 11h6l-1 9 9-12h-6l0-8Z" />,
    flame: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2c1.2 3-1.5 4.6-1.5 7.3 0 1.8 1.3 3.2 3 3.2 2 0 3.5-1.7 3.5-4.2 2 2.1 3 4.4 3 7.2A8 8 0 1 1 6 9.9c0-2.3.8-4.4 2.4-6.3.3 1.8 1.5 3.2 3.6 3.2z" />
  };

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {map[name]}
    </svg>
  );
}

function getDateRangeParams(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd')
  };
}

function formatDateForInput(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

function calculateBmi(weightKg, heightCm) {
  const weight = Number.parseFloat(weightKg);
  const height = Number.parseFloat(heightCm);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return null;
  }
  return weight / ((height / 100) ** 2);
}

function getFormDataFromLatestMeasurement(measurement) {
  return {
    measuredDate: formatDateForInput(),
    weightKg: String(measurement?.weightKg ?? ''),
    heightCm: String(measurement?.heightCm ?? ''),
    notes: measurement?.notes || ''
  };
}

function BodyMeasurementsPanel({ selectedRangeDays }) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hasUserEditedForm, setHasUserEditedForm] = useState(false);
  const [formData, setFormData] = useState(() => getFormDataFromLatestMeasurement(null));

  const fetchMeasurements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      const data = await bodyMeasurementService.getMeasurements({
        ...getDateRangeParams(selectedRangeDays),
        limit: 500
      });
      const measurementList = data || [];
      setMeasurements(measurementList);
    } catch (err) {
      const denied = err.response?.status === 403;
      setAccessDenied(denied);
      setError(err.response?.data?.message || 'Failed to load body measurements');
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRangeDays]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  useEffect(() => {
    if (!editingId && !hasUserEditedForm && measurements.length > 0) {
      setFormData(getFormDataFromLatestMeasurement(measurements[0]));
    }
  }, [editingId, hasUserEditedForm, measurements]);

  const resetForm = () => {
    setEditingId(null);
    setHasUserEditedForm(false);
    setFormData(getFormDataFromLatestMeasurement(measurements[0]));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        measuredDate: formData.measuredDate,
        weightKg: Number.parseFloat(formData.weightKg),
        heightCm: Number.parseFloat(formData.heightCm),
        notes: formData.notes
      };

      if (editingId) {
        await bodyMeasurementService.updateMeasurement(editingId, payload);
      } else {
        await bodyMeasurementService.saveMeasurement(payload);
      }

      resetForm();
      await fetchMeasurements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save body measurement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (measurement) => {
    setEditingId(measurement.id);
    setHasUserEditedForm(false);
    setFormData({
      measuredDate: format(parseISO(measurement.measuredDate), 'yyyy-MM-dd'),
      weightKg: String(measurement.weightKg ?? ''),
      heightCm: String(measurement.heightCm ?? ''),
      notes: measurement.notes || ''
    });
  };

  const handleDelete = async (measurementId) => {
    if (!confirm('Delete this body measurement?')) {
      return;
    }

    try {
      setError(null);
      await bodyMeasurementService.deleteMeasurement(measurementId);
      if (editingId === measurementId) resetForm();
      await fetchMeasurements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete body measurement');
    }
  };

  const updateFormData = (changes) => {
    setHasUserEditedForm(true);
    setFormData((current) => ({ ...current, ...changes }));
  };

  const latest = measurements[0] || null;
  const oldest = measurements[measurements.length - 1] || null;
  const latestBmi = latest ? calculateBmi(latest.weightKg, latest.heightCm) : null;
  const weightChange = latest && oldest && latest.id !== oldest.id
    ? Number.parseFloat(latest.weightKg) - Number.parseFloat(oldest.weightKg)
    : 0;
  const chartData = [...measurements].reverse().map((measurement) => ({
    date: format(parseISO(measurement.measuredDate), 'MMM d'),
    weight: Number.parseFloat(measurement.weightKg) || 0
  }));

  if (accessDenied) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        {error || 'Body measurements feature is not enabled for this user'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Latest Weight" value={latest ? `${latest.weightKg} kg` : '-'} icon={iconPath('bolt')} />
        <StatCard label="Latest Height" value={latest ? `${latest.heightCm} cm` : '-'} icon={iconPath('calendar')} tone="green" />
        <StatCard label="BMI" value={latestBmi ? latestBmi.toFixed(1) : '-'} icon={iconPath('flame')} tone="amber" />
        <StatCard
          label="Weight Change"
          value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
          icon={iconPath('dumbbell')}
          tone="red"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-app-primary">{editingId ? 'Edit Measurement' : 'Record Measurement'}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="body-measured-date" className="label">Date</label>
              <input
                id="body-measured-date"
                type="date"
                className="input-field"
                value={formData.measuredDate}
                onChange={(e) => updateFormData({ measuredDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="body-weight-kg" className="label">Body Weight kg</label>
              <input
                id="body-weight-kg"
                type="number"
                min="1"
                step="0.1"
                className="input-field"
                value={formData.weightKg}
                onChange={(e) => updateFormData({ weightKg: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="body-height-cm" className="label">Height cm</label>
              <input
                id="body-height-cm"
                type="number"
                min="1"
                step="0.1"
                className="input-field"
                value={formData.heightCm}
                onChange={(e) => updateFormData({ heightCm: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="body-notes" className="label">Notes</label>
              <textarea
                id="body-notes"
                className="input-field min-h-[90px] resize-y"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-outline" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="card h-[332px] animate-pulse bg-surface" />
          ) : chartData.length === 0 ? (
            <div className="card flex h-[332px] items-center justify-center p-6 text-app-muted">
              No body weight records yet.
            </div>
          ) : (
            <BodyWeightChart data={chartData} />
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-app-primary">Recent Measurements</h2>
          <p className="text-xs text-app-muted">{measurements.length} records</p>
        </div>

        {loading ? (
          <div className="card h-40 animate-pulse bg-surface" />
        ) : measurements.length === 0 ? (
          <div className="card p-8 text-center text-app-muted">No measurements recorded yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {measurements.slice(0, 12).map((measurement) => {
              const bmi = calculateBmi(measurement.weightKg, measurement.heightCm);
              return (
                <article key={measurement.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-app-muted">{format(parseISO(measurement.measuredDate), 'EEEE, MMM d')}</p>
                      <h3 className="mt-1 text-lg font-semibold text-app-primary">{measurement.weightKg} kg</h3>
                      <p className="text-sm text-app-muted">
                        {measurement.heightCm} cm {bmi ? `- BMI ${bmi.toFixed(1)}` : ''}
                      </p>
                      {measurement.notes && <p className="mt-2 text-sm text-app-primary">{measurement.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-outline" onClick={() => handleEdit(measurement)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-outline border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                        onClick={() => handleDelete(measurement.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default BodyMeasurementsPanel;
