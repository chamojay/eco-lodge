# sdp-frontend/README.md

# SDP Hotel Frontend

Welcome to the SDP Hotel Frontend project! This project is built using Next.js 14, Material UI, and Tailwind CSS to create a luxurious and fully responsive hotel booking website.

## Project Structure

```
sdp-frontend/
├── app/
│   ├── layout.tsx         # Main layout component including navigation and footer
│   ├── page.tsx           # Homepage entry point
│   ├── rooms/
│   │   └── page.tsx       # Rooms available for booking
│   ├── contact/
│   │   └── page.tsx       # Contact information and inquiry form
│   ├── admin/
│   │   └── page.tsx       # Admin dashboard for managing users and bookings
│   ├── reception/
│   │   └── page.tsx       # Reception dashboard for handling check-ins and reservations
│   └── restaurant-pos/
│       └── page.tsx       # Restaurant POS interface for managing orders
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Navigation bar component
│   │   └── Footer.tsx      # Footer component
│   ├── rooms/
│   │   ├── RoomCard.tsx    # Component displaying individual room details
│   │   └── BookingForm.tsx  # Component for booking a room
│   └── common/
│       ├── Button.tsx      # Reusable button component
│       └── Input.tsx       # Reusable input component
├── lib/
│   └── auth.ts             # Authentication-related functions
├── styles/
│   └── globals.css         # Global styles for the application
├── types/
│   └── index.ts            # TypeScript types used throughout the application
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript compiler options
```

## Features

- **Next.js 14 App Router** for modern routing
- **Material UI** and **Tailwind CSS** for a luxurious dark green, black, and white theme
- Fully responsive design optimized for mobile
- Navigation links for Home, Rooms, Contact, and Staff Login
- Room booking system with date selection

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd sdp-frontend
npm install
```

Then, run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to see the application in action.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.