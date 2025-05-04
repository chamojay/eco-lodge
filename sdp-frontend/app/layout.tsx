export const metadata = {
  title: 'Algama Ella Eco Lodge',
  description: 'Official System for Algama Ella Eco Lodge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
