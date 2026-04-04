# BACKEND_HMS Setup

## 1. Install dependencies
```bash
npm install
```

## 2. Configure environment
Update `.env` (already present) with:
- `PORT`
- `MONGO_DB_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `EMAIL_USER`
- `EMAIL_PASS`
- Optional Cloudinary vars for file uploads

## 3. Run in development
```bash
npm run dev
```

## 4. Run in production
```bash
npm start
```

## 5. API docs
- Swagger UI: `http://localhost:5000/api-docs`
- OpenAPI JSON: `http://localhost:5000/openapi.json`

## 6. Postman collection
Import:
`docs/postman/BACKEND_HMS.postman_collection.json`

Set collection variables:
- `baseUrl`: `http://localhost:5000/api/v1`
- `accessToken`: auto-set after login
- `refreshToken`: auto-set after login
