import './globals.css';

export const metadata = {
  title: 'Plant Pokedex',
  description: 'Catalog your house plants and track watering schedules',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a href="/" className="logo">🌿 Plant Pokedex</a>
          <a href="/add" className="add-btn">+ Add Plant</a>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
