'use client';

import Link from 'next/link';
import { typeColor, daysSince } from '../lib/utils';

export default function PlantCard({ plant }) {
  const last = plant.lastWatered;
  const daysAgo = last ? daysSince(last) : null;
  const interval = plant.watering_interval_days || 7;
  const overdue = daysAgo !== null && daysAgo >= interval;

  return (
    <Link href={`/plants/${plant.id}`} className="card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="card-photo"
        src={plant.photo_url || '/placeholder-plant.svg'}
        alt={plant.nickname}
      />
      <div className="card-id">#{plant.short_id}</div>
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
