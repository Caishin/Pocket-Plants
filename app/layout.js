import './globals.css';
import AuthGate from '../components/AuthGate';

export const metadata = {
  title: 'Plant Pokedex',
  description: 'Catalog your house plants and track watering schedules',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
