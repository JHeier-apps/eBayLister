# Bulk eBay Comic Lister

A web application for managing comic book listings and exporting them as CSV for eBay import. Built with Next.js and Supabase.

## Features

- **User Authentication**: Sign up, log in, log out, and password reset via Supabase Auth
- **Listing Management**: Create, browse, and view detailed listings with series and issue numbers
- **Series & Publishers**: Add publishers and series with add/edit links from the listing form
- **Search**: Basic keyword search on issue number and listing text
- **CSV Export**: Export your listings for eBay import
- **Responsive Design**: Mobile-friendly UI

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel + Supabase

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Create a Supabase project**

   - Go to [supabase.com](https://supabase.com) and create a project
   - In the SQL Editor, run the schema from `supabase/migrations/001_initial_schema.sql`

3. **Environment variables**

   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key from Project Settings → API

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. **Configure auth** (for password reset)

   - In Supabase: Authentication → URL Configuration
   - Set Site URL and Redirect URLs to your app (e.g. `http://localhost:3000`)

## Database Schema

- **profiles**: User data (synced from Supabase Auth)
- **publisher**: Comic publishers
- **series**: Comic series (linked to publisher)
- **listing**: Individual listings (linked to user and series)

## Deployment

- Deploy the Next.js app to [Vercel](https://vercel.com)
- Use your Supabase project for database and auth
- Set the same env vars in Vercel
