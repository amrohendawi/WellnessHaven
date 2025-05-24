# Admin Dashboard Implementation Checklist

This checklist ensures a stable, predictable implementation of the admin
dashboard using Clerk and Shadcn UI.

## 1. Authentication & Authorization (Clerk)

- [x] Sign up for Clerk and install `@clerk/clerk-sdk-node` and
      `@clerk/clerk-react`.
- [x] Configure Clerk (environment variables, `vercel.json`).
- [x] Wrap React app with `<ClerkProvider>`.
- [x] Protect admin routes with `<SignedIn>`/`<SignedOut>` or route guards.
- [x] Use Clerk hooks (`useUser`, `useAuth`) to access user info and roles.

## 2. Dashboard UI Structure

- [x] Create `client/src/admin/` folder (`pages`, `components`, `hooks`, `lib`).
- [x] Build `AdminLayout.tsx` with sidebar (Dashboard, Bookings, Availability,
      Services).
- [x] Set up `/admin/*` routes and guard with Clerk authentication.

## 3. Booking Management

- [x] Create API endpoints under `/api/admin/bookings`:
  - [x] `GET /api/admin/bookings` (list, filters, pagination).
  - [x] `GET /api/admin/bookings/:id` (details).
  - [x] `PUT /api/admin/bookings/:id` (update status/details).
- [x] Implement `BookingsPage.tsx` with a data table, filters, and actions.
- [x] Implement `BookingDetailPage.tsx` to view/edit individual bookings.
- [x] Add route `/admin/bookings/:id` in `AdminLayout.tsx` to
      `BookingDetailPage.tsx`.

## 4. Availability Management

- [x] Add `blocked_time_slots` table in `shared/schema.ts`.
- [x] Create API CRUD endpoints under `/api/admin/blocked-slots`.
- [x] Build `AvailabilityPage.tsx` with calendar view to block/unblock slots.
- [x] Update public `/api/time-slots` to respect blocked slots.

## 5. Service Management

- [x] Create API CRUD under `/api/admin/services`.
- [x] Develop `ServicesPage.tsx` for listing services.
- [x] Implement create/edit service form modals and integrations.

## 6. Dashboard Overview

- [x] Create `GET /api/admin/dashboard-summary` for key metrics.
- [x] Build `DashboardPage.tsx` showing cards: bookings count, upcoming,
      revenue.

## 7. Styling and UX

- [x] Use Shadcn UI components for consistency in Bookings page.
- [x] Style `BookingDetailPage.tsx` with Shadcn `Card`, `Typography`, `Select`,
      and `Button`.
- [x] Ensure responsive layout for Bookings pages.

## 8. Deployment & Testing

- [ ] Configure Clerk environment and roles in Vercel.
- [ ] Write smoke tests for admin API endpoints.
- [ ] Manually test admin flows: login, bookings, availability, services.

## Next Steps

- [ ] Write smoke tests for `/api/admin/bookings` endpoints.
- [ ] Develop smoke tests for `/api/admin/services` and
      `/api/admin/blocked-slots`.
- [ ] Style Services and Availability pages with Shadcn UI.
- [ ] Integrate Clerk toasts and loading indicators across admin flows.
