# Dubai Rose Beauty & Aesthetics Center

![Dubai Rose Logo](client/src/assets/logo.png)

A modern, multilingual website for the Dubai Rose women-only beauty center featuring service showcase, VIP membership system, appointment booking, and content management.

## 🌟 Features

### 🌐 Multilingual Support

- Full support for English, Arabic, German, and Turkish
- Right-to-left (RTL) layout for Arabic
- Language-specific fonts and styling
- Seamless language switching with content persistence

### 💅 Service Showcase

- Categorized display of beauty services (facial treatments, laser treatments, etc.)
- Service filtering by category
- Detailed service pages with benefits and procedure information
- Image galleries for each service

### 👑 VIP Membership System

- Gold and Silver membership tiers
- Membership verification and discount application
- Exclusive member benefits display
- Membership status validation

### 📅 Appointment Booking

- Multi-step booking process
- Service selection with filtering
- Date and time selection
- Confirmation notifications
- Database storage for appointment management

### 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized layouts
- Touch-friendly interface elements
- Adaptive content presentation

### 🛠️ Admin Features

- Secure authentication
- Service management (add, edit, delete)
- Appointment management (view, status updates)
- Membership management

## 🏗️ Architecture

### Component Structure

![Component Structure](diagrams/component-structure.puml)

The component structure diagram shows the high-level organization of the application, with clear separation between frontend, backend, and database layers. See the source PlantUML file in `diagrams/component-structure.puml`.

### Data Flow

![Data Flow](diagrams/data-flow.puml)

The data flow diagram illustrates how user interactions flow through the application layers, from the UI to the database and back. See the source PlantUML file in `diagrams/data-flow.puml`.

## 🛠️ Technologies Used

### Frontend

- **React** - UI library
- **TypeScript** - Type safety
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library
- **React Hook Form** - Form handling
- **TanStack Query** - Data fetching and caching
- **i18next** - Internationalization
- **date-fns** - Date manipulation
- **react-icons** - Icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **Zod** - Schema validation
- **TypeScript** - Type safety

### Development Tools

- **Vite** - Build tool and development server
- **tsx** - TypeScript execution
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📂 Project Structure

```
dubai-rose/
├── client/                    # Frontend code
│   ├── src/
│   │   ├── assets/            # Static assets (images, fonts)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Base UI components (shadcn)
│   │   │   └── ...            # Feature-specific components
│   │   ├── context/           # React context providers
│   │   ├── data/              # Static data and translations
│   │   │   └── translations/  # i18n language files
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Page components
│   │   └── main.tsx           # Application entry point
│   └── index.html             # HTML template
│
├── server/                    # Backend code
│   ├── db.ts                  # Database connection
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes
│   ├── storage.ts             # Storage interface
│   └── vite.ts                # Vite server integration
│
├── shared/                    # Shared code between client and server
│   └── schema.ts              # Database schema and types
│
├── scripts/                   # Utility scripts
│   └── seed-db.ts             # Database seeding
│
├── migrations/                # Database migrations
├── public/                    # Public static files
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 📊 Database Schema

![Database Schema](diagrams/database-schema.puml)

The database schema diagram shows the structure of the PostgreSQL database tables and their relationships. This schema is implemented using Drizzle ORM in `shared/schema.ts` and supports all the application's data storage needs. See the source PlantUML file in `diagrams/database-schema.puml`.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/dubai-rose.git
cd dubai-rose
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory and add:

```
DATABASE_URL=postgresql://username:password@localhost:5432/dubai_rose
```

4. Set up the database

```bash
npm run db:push
```

5. Seed the database with initial data

```bash
npm run seed
```

6. Start the development server

```bash
npm run dev
```

7. Open [http://localhost:5000](http://localhost:5000) in your browser

## 🧰 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run db:push` - Push schema to database
- `npm run seed` - Seed the database with initial data
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Drizzle](https://orm.drizzle.team/)
