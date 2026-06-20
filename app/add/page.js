'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { generateIllustration } from '../../lib/illustration';
import { typeColor } from '../../lib/utils';

export default function AddPlantPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [searching, setSearching] = useState(false);
  const [wateringInterval, setWateringInterval] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!speciesQuery || selectedSpecies?.common_name === speciesQuery) {
      setMatches([]);
      return;
    }
    setSelectedSpecies(null);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/lookup-plant?name=${encodeURIComponent(speciesQuery)}`);
      const json = await res.json();
      setMatches(json.matches || []);
      setSearching(false);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [speciesQuery]);

  function pickMatch(species) {
    setSelectedSpecies(species);
    setSpeciesQuery(species.common_name);
    setMatches([]);
    if (!nickname) setNickname(species.common_name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id || null;

    // If no species was matched from the catalog, fall back to treating
    // the typed text as the genus directly so the plant can still be saved.
    const genus = selectedSpecies?.genus || speciesQuery || 'Unknown';
    const species_epithet = selectedSpecies?.species_epithet || null;
    const species_id = selectedSpecies?.id || null;
    const illustration_seed = selectedSpecies?.common_name || speciesQuery;

    const { error: insertError } = await supabase.from('plants').insert([
      {
        nickname: nickname || speciesQuery,
        genus,
        species: species_epithet,
        species_id,
        illustration_seed,
        watering_interval_days: Number(wateringInterval),
        notes,
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

  const previewType = selectedSpecies?.type || 'Unclassified';
  const previewIllustration = generateIllustration(previewType, speciesQuery || 'plant');

  return (
    <div>
      <a href="/" className="back-link">&larr; Back to Pokedex</a>
      <h2>Add a New Plant</h2>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative' }}>
            <label>Plant name</label>
            <input
              required
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              placeholder="e.g. Snake Plant, Monstera..."
              autoComplete="off"
            />
            {searching && <p style={{ fontSize: '0.8rem', color: '#888' }}>Searching...</p>}
            {matches.length > 0 && (
              <ul style={{
                listStyle: 'none', margin: 0, padding: 0,
                border: '1px solid #d8ded0', borderRadius: 8,
                position: 'absolute', background: 'white', width: '100%', zIndex: 5,
              }}>
                {matches.map((m) => (
                  <li
                    key={m.id}
                    onClick={() => pickMatch(m)}
                    style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  >
                    <strong>{m.common_name}</strong>{' '}
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                      ({m.genus} {m.species_epithet}) &middot; #{String(m.id).padStart(3, '0')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedSpecies ? (
            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: -4 }}>
              Matched: <em>{selectedSpecies.genus} {selectedSpecies.species_epithet}</em> &middot; Type: {selectedSpecies.type} &middot; Dex #{String(selectedSpecies.id).padStart(3, '0')}
            </div>
          ) : speciesQuery ? (
            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: -4 }}>
              No catalog match yet — this will be saved as a new, unclassified entry. Pick a suggestion above if one appears.
            </div>
          ) : null}

          <div>
            <label>Nickname (optional)</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Big Monty"
            />
          </div>

          <div>
            <label>Watering interval (days)</label>
            <input
              type="number"
              min="1"
              value={wateringInterval}
              onChange={(e) => setWateringInterval(e.target.value)}
            />
          </div>

          <div>
            <label>Notes</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add to Pokedex'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewIllustration}
            alt="Preview illustration"
            style={{ width: 180, height: 180, borderRadius: 14, border: '2px solid #d8ded0' }}
          />
          <div>
            <span className="type-badge" style={{ background: typeColor(previewType), marginTop: 8 }}>
              {previewType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
