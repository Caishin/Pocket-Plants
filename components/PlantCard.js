'use client';

import Link from 'next/link';
import { typeColor, daysSince } from '../lib/utils';
import { generateIllustration } from '../lib/illustration';

export default function PlantCard({ plant }) {
  const last = plant.lastWatered;
  const daysAgo = last ? daysSince(last) : null;
  const interval = plant.watering_interval_days || 7;
  const overdue = daysAgo !== null && daysAgo >= interval;

  const illustration = plant.photo_url
    || generateIllustration(plant.type, plant.illustration_seed || plant.genus);

  const dexNumber = plant.species_id
    ? String(plant.species_id).padStart(3, '0')
    : '???';

  return (
    <Link href={`/plants/${plant.id}`} className="card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="card-photo"
        src={illustration}
        alt={plant.nickname}
      />
      <div className="card-id">#{dexNumber}</div>
      <div className="card-name">{plant.nickname}</div>
      <span className="type-badge" style={{ background: typeColor(plant.type) }}>
        {plant.type}
      </span>
      <div className={`watering-status ${overdue ? 'overdue' : ''}`}>
        {daysAgo === null
          ? 'Never watered'
          : overdue
          ? `Overdue! Last watered ${daysAgo}d ago`
          : `Watered ${daysAgo}d ago`}
      </div>
    </Link>
  );
}
