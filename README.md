# PhotoPrint Service

A complete Node.js + Express service for photo printing, copying, document preparation, and printing services.

## Features

- Public website with home, services, gallery, contacts pages
- Admin dashboard with login, service management, gallery management, order management, settings
- SQLite database with Sequelize
- Secure admin auth using JWT in cookies
- File upload support for service and gallery files
- Responsive UI with EJS templates + custom CSS
- Contact form submission and dataset storage
- Seed script for demo data

## Quick start

```bash
npm install
npm run seed
npm start
```

Then open `http://localhost:3000`.

## Admin login

Use the credentials created by the seed script:

- Username: `admin`
- Password: `Admin123!`

Admin panel: `http://localhost:3000/admin/login`

## Tech stack

- Express
- Sequelize + SQLite
- EJS templating
- JWT + cookie auth
- Multer uploads
- Helmet + rate limiting
- Custom CSS and vanilla JS frontend

## Notes

- Uploaded files are stored under `public/uploads/`.
- Seed script populates demo services and gallery items.
- Configure secrets in `.env` before deployment.
