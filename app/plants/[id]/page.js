'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { typeColor, daysSince } from '../../../lib/utils';
import { generateIllustration } from '../../../lib/illustration';

export default function PlantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const { data: plantData, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { data: logData } = await supabase
      .from('watering_logs')
      .select('*')
      .eq('plant_id', id)
      .order('watered_at', { ascending: false });

    setPlant(plantData);
    setLogs(logData || []);
    setLoading(false);
  }

  async function logWatering() {
    await supabase.from('watering_logs').insert([{ plant_id: id }]);
    load();
  }

  async function deletePlant() {
    if (!confirm(`Remove ${plant.nickname} from your Pokedex?`)) return;
    await supabase.from('plants').delete().eq('id', id);
    router.push('/');
  }

  if (loading) return <p>Loading...</p>;
  if (!plant) return <p>Plant not found.</p>;

  const lastWatered = logs[0]?.watered_at || null;
  const daysAgo = lastWatered ? daysSince(lastWatered) : null;
  const overdue = daysAgo !== null && daysAgo >= (plant.watering_interval_days || 7);

  const illustration = plant.photo_url
    || generateIllustration(plant.type, plant.illustration_seed || plant.genus);

  const dexNumber = plant.species_id
    ? String(plant.species_id).padStart(3, '0')
    : '???';

  return (
    <div>
      <a href="/" className="back-link">&larr; Back to Pokedex</a>

      <div className="detail-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="detail-photo"
          src={illustration}
          alt={plant.nickname}
        />
        <div>
          <div className="card-id">#{dexNumber}</div>
          <h1 style={{ margin: '0 0 4px' }}>{plant.nickname}</h1>
          <p style={{ margin: '0 0 8px', color: '#666' }}>
            <em>{plant.genus} {plant.species}</em>
          </p>
          <span className="type-badge" style={{ background: typeColor(plant.type) }}>
            {plant.type}
          </span>

          <p className={`watering-status ${overdue ? 'overdue' : ''}`} style={{ marginTop: 14 }}>
            {daysAgo === null
              ? 'Never watered yet'
              : overdue
              ? `Overdue for watering — last watered ${daysAgo} day(s) ago`
              : `Last watered ${daysAgo} day(s) ago`}
            <br />
            Watering interval: every {plant.watering_interval_days} day(s)
          </p>

          {plant.notes && <p>{plant.notes}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={logWatering}>💧 Log Watering</button>
            <button className="secondary" onClick={deletePlant}>Remove Plant</button>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 30 }}>Watering History</h3>
      {logs.length === 0 ? (
        <p>No watering events logged yet.</p>
      ) : (
        <ul className="log-list">
          {logs.map((log) => (
            <li key={log.id}>
              💧 {new Date(log.watered_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
