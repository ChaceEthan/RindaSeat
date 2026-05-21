# RindaSeat Frontend

A modern, premium bus booking platform for Rwanda built with React + Vite.

## Overview

RindaSeat is a smart bus transport reservation platform that allows users to:
- Search and filter bus trips by destination, date, and price
- Select seats visually with real-time locking via Socket.IO
- Book tickets securely with multiple payment methods (MTN MoMo, Card)
- Receive digital QR code tickets instantly
- Manage their booking history and upcoming trips
- Enjoy a premium, handcrafted UI/UX experience

## Tech Stack

### Frontend Framework
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **React Router DOM** - Client-side routing

### Styling & Animation
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Icon library

### State Management & APIs
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **Socket.IO Client** - Real-time features

### Additional Libraries
- **React Hot Toast** - Elegant notifications
- **QRCode.react** - QR code generation
- **date-fns** - Date manipulation

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                   # API configuration & axios setup
│   ├── assets/                # Images, fonts, etc
│   ├── components/            # Reusable UI components
│   │   ├── buttons/           # Button components
│   │   ├── cards/             # Card & trip card components
│   │   ├── forms/             # Form inputs & validation
│   │   ├── loaders/           # Loading spinners & skeletons
│   │   ├── modals/            # Modal dialogs
│   │   ├── navbar/            # Navigation bar
│   │   ├── footer/            # Footer component
│   │   ├── seatmap/           # Interactive seat map
│   │   └── qr/                # QR code ticket display
│   ├── context/               # React context providers
│   │   ├── ThemeContext.jsx   # Dark/light mode
│   │   └── ToastProvider.jsx  # Toast notifications
│   ├── hooks/                 # Custom React hooks
│   ├── layouts/               # Layout components
│   ├── pages/                 # Page components
│   │   ├── home/              # Landing page
│   │   ├── auth/              # Login & signup
│   │   ├── trips/             # Trip search
│   │   ├── booking/           # Seat selection
│   │   ├── payments/          # Payment processing
│   │   ├── tickets/           # Digital tickets
│   │   ├── dashboard/         # User dashboard
│   │   └── admin/             # Admin dashboard
│   ├── routes/                # Route definitions
│   ├── services/              # API services
│   ├── store/                 # Zustand stores
│   │   ├── authStore.js       # Authentication state
│   │   ├── bookingStore.js    # Booking state
│   │   └── uiStore.js         # UI state (theme, sidebar)
│   ├── styles/                # Global CSS
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies & scripts
└── .env                       # Environment variables
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API origin configured with `VITE_API_URL`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```bash
VITE_API_URL=https://rindaseat.onrender.com
VITE_SOCKET_URL=https://rindaseat.onrender.com
```

### Development

Start the development server:
```bash
npm run dev
```

Vite will print the local dev URL in the terminal.

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features

### 🎫 Trip Booking
- Search trips by destination, date, and price
- Filter by company and amenities
- Real-time seat availability
- Interactive seat selection with visual feedback

### 💳 Payments
- MTN MoMo integration for local payments
- Credit/debit card support
- Secure payment processing
- Payment status tracking

### 🎟️ Digital Tickets
- Instant QR code generation
- Download and print functionality
- Share ticket via SMS/Email
- Booking history management

### 👤 User Dashboard
- View upcoming trips
- Booking history
- Profile management
- Notification center
- Support tickets

### 🌓 Dark Mode
- System theme detection
- Manual toggle
- Persistent preference storage
- Smooth transitions

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop experience
- Touch-friendly interactions

### ⚡ Performance
- Code splitting & lazy loading
- Image optimization
- Efficient bundling with Vite
- Smooth 60fps animations

### ♿ Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## API Integration

The frontend connects to the backend API with:

- **Base URL**: `${VITE_API_URL}/api`
- **Authentication**: JWT tokens in localStorage
- **Auto-refresh**: Token refresh on 401 responses
- **Request interceptors**: Automatic token injection
- **Error handling**: Centralized error management

### Available Endpoints

```
// Auth
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/verify-otp
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/profile

// Trips
GET    /trips/search
GET    /trips/:id
GET    /trips/:id/seats

// Bookings
POST   /bookings
GET    /bookings/:id
GET    /bookings/my-bookings
POST   /bookings/:id/cancel

// Payments
POST   /payments/initiate
GET    /payments/verify/:id
GET    /payments/status/:id

// Companies
GET    /companies
GET    /companies/:id
```

## State Management

### Zustand Stores

**authStore.js**
- User authentication state
- Token management
- Login/logout actions

**bookingStore.js**
- Selected trip details
- Selected seats
- Passenger information
- Booking data

**uiStore.js**
- Dark/light mode toggle
- Sidebar state
- UI preferences

## Components

### Reusable Components

**Button.jsx**
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Disabled & loading states
- Smooth animations

**Card.jsx**
- Base card component
- Trip card with transit details
- Hover animations
- Dark mode support

**FormInputs.jsx**
- TextInput with error handling
- Checkbox component
- Select dropdown
- Form validation

**SeatMap.jsx**
- Interactive seat grid
- Real-time seat locking
- Visual feedback
- Legend & status indicators

**Modal.jsx**
- Customizable dialogs
- Smooth animations
- Overlay with click outside to close

**Loaders.jsx**
- Loading spinner
- Skeleton loaders
- Page loader

## Pages

### Home Page
- Hero section
- Trip search widget
- Features showcase
- Popular routes
- Call-to-action

### Auth Pages
- Login with email/password
- Signup with validation
- Social login ready
- Password reset flow

### Trips Search
- Advanced filtering
- Company filter
- Price range
- Date selection
- Dynamic results

### Seat Selection
- Interactive seat map
- Real-time availability
- Booking summary
- Price calculation

### Payments
- MTN MoMo payment
- Card payment option
- Payment status
- Error handling

### Digital Tickets
- QR code display
- Ticket details
- Download functionality
- Print option

### User Dashboard
- Booking statistics
- Recent bookings
- Upcoming trips
- Profile settings

### Admin Dashboard
- Revenue analytics
- Booking activity
- Trip management
- Quick actions

## Styling

### Theme System
- Primary: Deep Blue (#4f94f7)
- Secondary: Rich Purple (#a855f7)
- Accent: Modern Cyan (#10b981)
- Dark mode with gray palette

### Design Tokens
- Custom shadows with premium feel
- Smooth transitions & animations
- Consistent spacing system
- Modern typography

### Tailwind Extensions
- Custom color palette
- Premium box shadows
- Animation utilities
- Responsive grid system

## Performance Optimizations

- Lazy loading for route components
- Image optimization
- Code splitting by routes
- Efficient re-renders with React.memo
- Debounced API calls
- CSS optimization with Tailwind

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Traditional Hosting
```bash
npm run build
# Upload 'dist' folder to your server
```

## Environment Variables

```
VITE_API_URL=https://rindaseat.onrender.com
VITE_SOCKET_URL=https://rindaseat.onrender.com
```

## Development Tools

- ESLint for code quality
- Vite HMR for fast refresh
- React DevTools extension
- Tailwind CSS IntelliSense

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Submit pull request

## License

MIT License

## Support

For issues or questions:
- GitHub Issues
- Email: support@rindaseat.rw
- Twitter: @RindaSeat

## Credits

Built with ❤️ for Rwanda's transportation future
