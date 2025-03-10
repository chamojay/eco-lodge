# sdp-backend/README.md

# SDP Hotel Backend

Welcome to the backend of the SDP Hotel application. This backend is built using Next.js API routes, Prisma ORM, and MySQL to provide a robust and scalable solution for managing hotel bookings and user authentication.

## Project Structure

- **prisma/**: Contains the Prisma schema and migration files.
- **app/api/**: API routes for handling authentication, bookings, and user management.
- **middleware/**: Middleware for JWT authentication and role-based access control.
- **services/**: Contains service files for handling business logic related to authentication, bookings, and users.

## Features

- **Authentication**: Secure login and registration using JWT.
- **Role-based Access Control**: Different access levels for Admin, Receptionist, and POS staff.
- **Booking Management**: Create, cancel, and view bookings through API routes.
- **User Management**: Manage staff and customer information.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sdp-hotel.git
   cd sdp-hotel/sdp-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in the `.env` file:
   ```plaintext
   DATABASE_URL="your_database_connection_string"
   JWT_SECRET="your_jwt_secret"
   ```

4. Run the Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Authentication**
  - `POST /api/auth/login`: Log in a user.
  - `POST /api/auth/logout`: Log out a user.
  - `POST /api/auth/register`: Register a new user.

- **Bookings**
  - `POST /api/bookings`: Create a new booking.
  - `GET /api/bookings`: View all bookings.
  - `DELETE /api/bookings/:id`: Cancel a booking.

- **Users**
  - `GET /api/users`: Get all users.
  - `GET /api/users/:id`: Get a specific user.
  - `PUT /api/users/:id`: Update user information.

## License

This project is licensed under the MIT License. See the LICENSE file for details.