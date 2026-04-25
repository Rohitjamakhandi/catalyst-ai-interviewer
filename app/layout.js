import './globals.css';

export const metadata = {
  title: 'Catalyst — AI Skill Assessment & Learning Plan',
  description: 'AI-powered agent that assesses your real skills against a job description, identifies gaps, and builds a personalized learning roadmap.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
