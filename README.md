# Ankit App - Node + Express + Mongoose

Quick scaffold to run a simple API using Express and Mongoose.

Setup

```bash
cd ankit-app-nodejs
npm install
cp .env.example .env
# edit .env to set MONGO_URI if needed
npm run dev
```

API Endpoints
- `GET /api/users` - list users
- `POST /api/users` - create user `{ "name": "Alice", "email": "a@x.com" }`
- `GET /api/users/:id` - get user
- `PUT /api/users/:id` - update user
- `DELETE /api/users/:id` - delete user

Example curl

```bash
curl -s http://localhost:5000/api/users
curl -X POST -H "Content-Type: application/json" -d '{"name":"Bob","email":"bob@example.com"}' http://localhost:5000/api/users
```
# ankit-app
