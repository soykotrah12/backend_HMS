# BACKEND_HMS API Endpoints

Base URL: `http://localhost:5000/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify`
- `POST /auth/forget`
- `POST /auth/reset-password`
- `POST /auth/change-password`
- `POST /auth/refresh-token`
- `POST /auth/logout`

## User
- `GET /user/profile`
- `PUT /user/profile`
- `PUT /user/password`
- `PATCH /user/block/:userId`
- `PATCH /user/unblock/:userId`
- `GET /user/all`
- `PATCH /user/role/:id`

## Admin (legacy)
- `GET /admin/users`
- `GET /admin/user/:id`
- `PUT /admin/user/:id`
- `DELETE /admin/user/:id`

## Doctor
- `POST /doctor`
- `GET /doctor`
- `GET /doctor/me`
- `GET /doctor/:id`
- `PATCH /doctor/:id/availability`

## Patient
- `POST /patient`
- `GET /patient`
- `GET /patient/me`
- `GET /patient/:id`
- `POST /patient/:id/history`

## Appointment
- `POST /appointment`
- `GET /appointment`
- `GET /appointment/:id`
- `PATCH /appointment/:id/status`

## Prescription
- `POST /prescription`
- `GET /prescription`
- `GET /prescription/:id`

## Pharmacy
- `POST /pharmacy`
- `GET /pharmacy`
- `GET /pharmacy/:id`
- `PUT /pharmacy/:id`
- `PATCH /pharmacy/:id/stock`
- `DELETE /pharmacy/:id`

## Lab
- `POST /lab`
- `GET /lab`
- `GET /lab/:id`
- `PATCH /lab/:id/status`
- `PATCH /lab/:id/report`
- `PATCH /lab/:id/report-url`

## Billing
- `POST /billing/invoice`
- `GET /billing/invoice`
- `GET /billing/invoice/:id`
- `PATCH /billing/invoice/:id/pay`

## Notification
- `POST /notification`
- `GET /notification/me`
- `PATCH /notification/me/:id/read`

## Docs
- `GET /openapi.json`
- `GET /api-docs`
