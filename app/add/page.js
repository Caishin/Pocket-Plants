'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const COMMON_GENERA = [
  'Monstera', 'Philodendron', 'Calathea', 'Alocasia', 'Anthurium',
  'Epipremnum', 'Hoya', 'Ficus', 'Dracaena', 'Echeveria', 'Haworthia',
  'Sedum', 'Crassula', 'Aloe', 'Opuntia', 'Mammillaria', 'Echinocactus',
  'Nephrolepis', 'Adiantum', 'Platycerium', 'Sansevieria', 'Zamioculcas',
  'Spathiphyllum', 'Phalaenopsis', 'Begonia', 'Peperomia', 'Pilea',
  'Tradescantia', 'Chlorophytum',
];

export default function AddPlantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nickname: '',
    genus: 'Monstera',
    species: '',
    photo_url: '',
    watering_interval_days: 7,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id || null;

    const { error: insertError } = await supabase.from('plants').insert([
      {
        ...form,
        watering_interval_days: Number(form.watering_interval_days),
        user_id,
      },
    ]);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/');
  }

  return (
    <div>
      <a href="/" className="back-link">&larr; Back to Pokedex</a>
      <h2>Add a New Plant</h2>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nickname</label>
          <input
            required
            value={form.nickname}
            onChange={(e) => update('nickname', e.target.value)}
            placeholder="e.g. Big Monty"
          />
        </div>

        <div>
          <label>Genus (determines its Type)</label>
          <select value={form.genus} onChange={(e) => update('genus', e.target.value)}>
            {COMMON_GENERA.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="__other">Other (type below)</option>
          </select>
          {form.genus === '__other' && (
            <input
              placeholder="Enter genus name"
              onChange={(e) => update('genus', e.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        <div>
          <label>Species (optional)</label>
          <input
            value={form.species}
            onChange={(e) => update('species', e.target.value)}
            placeholder="e.g. deliciosa"
          />
        </div>

        <div>
          <label>Photo URL (optional)</label>
          <input
            value={form.photo_url}
            onChange={(e) => update('photo_url', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label>Watering interval (days)</label>
          <input
            type="number"
            min="1"
            value={form.watering_interval_days}
            onChange={(e) => update('watering_interval_days', e.target.value)}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add to Pokedex'}
        </button>
      </form>
    </div>
  );
}
