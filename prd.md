Project Name: Bulk eBay Comic Lister

Objective: To build a web application where users can add comic book data and create a csz export that can be imported into eBay, leveraging Next.js for the frontend and Supabase for the backend (database and authentication).

Core Features

User Authentication:
Users can sign up, log in, and log out using Supabase authentication.
Password reset functionality.

Listing Management:

Users can data enter listing information. The series will be a dropdown created from series table, add links for add/edit to dropdown.
Users can browse all uploaded listings that they have created.

Supabase database will need 4 tables:
profiles for user data and authentication. 
listing will have the following columns:  id uuid , user_id (foreign key from profiles table), series_id (foreign key from series table), issuenumber (text), listing (text,created_at, updated_at, listed_date timestamp 
series will have the following data columns: id uuid, seriesname (text), publisher_ID uuid foreign key from Publisher table, starting_year numeric,
publisher will have the following data columns: id uuid, publishername (text)

Users can view a detailed page for each listing that they have created.

Search and Filtering:

Basic keyword search functionality.

Responsive Design:
Ensure the platform is mobile-friendly and provides a seamless user experience on all devices.

Technical Stack

Frontend:
Framework: Next.js

Styling: Tailwind CSS or CSS Modules

Will provide a sample eBay csz file format that can be created later on.

2. Backend:
Database: Supabase PostgreSQL
Authentication: Supabase Auth

3. Deployment:
Vercel for hosting the Next.js application
Supabase for database and authentication hosting