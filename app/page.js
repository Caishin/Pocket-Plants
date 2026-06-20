'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PlantCard from '../components/PlantCard';

export default function HomePage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    setLoading(true);

    const { data: plantRows, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch most recent watering log per plant
    const { data: logs } = await supabase
      .from('watering_logs')
      .select('plant_id, watered_at')
      .order('watered_at', { ascending: false });

    const lastWateredMap = {};
    (logs || []).forEach((log) => {
      if (!lastWateredMap[log.plant_id]) {
        lastWateredMap[log.plant_id] = log.watered_at;
      }
    });

    const enriched = (plantRows || []).map((p, i) => ({
      ...p,
      short_id: String(i + 1).padStart(3, '0'),
      lastWatered: lastWateredMap[p.id] || null,
    }));

    setPlants(enriched);
    setLoading(false);
  }

  const types = ['All', ...new Set(plants.map((p) => p.type))];
  const visible = filterType === 'All' ? plants : plants.filter((p) => p.type === filterType);

  if (loading) return <p>Loading your plants...</p>;

  if (plants.length === 0) {
    return (
      <div className="empty-state">
        <h2>No plants yet 🌱</h2>
        <p>Add your first house plant to start your Pokedex.</p>
        <a href="/add"><button>+ Add Plant</button></a>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid">
        {visible.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  );
}
