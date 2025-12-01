# 🧑‍💼 User Management System — Node.js + SQLite

This project is a RESTful API built using **Node.js**, **Express.js**, and **SQLite** for performing CRUD operations on users with validation, error handling, and logging.  
It follows a modular structure with reusable validation utilities and stores user information with UUIDs.

---

## 🚀 Features

✔ Create new users with strict validation  
✔ Retrieve single or multiple users with filters  
✔ Update user details (supports multiple user update logic)  
✔ Delete user by mobile number or user ID  
✔ Validation handled through a separate file (`validators.js`)  
✔ Error handling with meaningful responses  
✔ Uses SQLite for lightweight local storage  

---

## 📂 Project Structure

user_management_2/
│
├─ app.js # Main server file with routes
├─ validators.js # Validation logic
├─ user1.db # SQLite database
├─ app.http # Test requests file (optional)
└─ README.md

yaml
Copy code

---

## 🛠 Technologies Used

| Component | Technology |
|----------|------------|
| Backend Runtime | Node.js |
| Framework | Express.js |
| Database | SQLite |
| UUID Generation | `uuid` npm package |
| Validation | Custom middleware/functions |

---

## ⚙️ Installation & Setup

### 1️⃣ Install Dependencies
```sh
npm install
```

### 2️⃣ Start the Server

`node app.js`

If successful, you will see:

`Server started at port 3001`

* * * * *

🗄 Database Schema
------------------

### `managers` Table

| Column | Type | Description |
| --- | --- | --- |
| manager_id | TEXT (UUID) | Unique manager identifier |
| is_active | INTEGER (0/1) | Manager active status |

Example record:

`INSERT INTO managers (manager_id, is_active)
VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 1);`

* * * * *

### `users` Table

| Column | Type | Description |
| --- | --- | --- |
| user_id | TEXT (UUID) | Primary key |
| full_name | TEXT | User name |
| mob_num | TEXT | Validated mobile number |
| pan_num | TEXT | Valid PAN number |
| manager_id | TEXT | References managers table |
| created_at | DATETIME | Timestamp |
| updated_at | DATETIME | Timestamp |
| is_active | INTEGER | Active status (soft delete support) |

* * * * *

📌 API Endpoints
----------------

* * * * *

### 🔹 1. Create User

**POST** `/create_user`

#### Request Body:

`{
  "full_name": "John Doe",
  "mob_num": "+911234567890",
  "pan_num": "ABCDE1234F",
  "manager_id": "VALID_MANAGER_UUID"
}`

#### Response:

`{
  "message": "User created successfully",
  "user_id": "generated-uuid"
}`

* * * * *

### 🔹 2. Get Users

**POST** `/get_users`

#### Optional Filters:

`{
  "user_id": "uuid",
  "mob_num": "9876543210",
  "manager_id": "uuid"
}`

#### Response Example:

`{
  "users": [
    {
      "user_id": "xxxx",
      "full_name": "John Doe",
      "mob_num": "9876543210",
      "pan_num": "ABCDE1234F",
      "manager_id": "xxxx"
    }
  ]
}`

* * * * *

### 🔹 3. Delete User

**POST** `/delete_user`

Possible Request:

`{
  "user_id": "uuid"
}`

or

`{
  "mob_num": "9876543210"
}`

#### Response:

`{
  "message": "User deleted successfully"
}`

* * * * *

### 🔹 4. Update User

**POST** `/update_user`

#### Request:

`{
  "user_ids": ["uuid1", "uuid2"],
  "update_data": {
    "full_name": "Jane Doe",
    "mob_num": "9876543210",
    "pan_num": "FGHIJ6789K",
    "manager_id": "new-manager-uuid"
  }
}`

#### Response:

`{
  "message": "Users updated successfully"
}`

* * * * *

🧪 Testing
----------

You can test using:

-   `app.http` (VS Code REST Client)

-   Thunder Client

-   Postman

-   curl

Example HTTP test block:

`POST http://localhost:3001/get_users
Content-Type: application/json

{}`

* * * * *

⚠ Validation Rules
------------------

| Field | Requirement |
| --- | --- |
| full_name | Required, cannot be empty |
| mob_num | Must be a valid 10-digit number (supports +91 or 0 prefix) |
| pan_num | Must match pattern `ABCDE1234F` |
| manager_id | Must exist in the managers table and be active |

* * * * *

📍 Logging & Error Handling
---------------------------

-   All invalid requests return a JSON error message.

-   Missing values return `400 Bad Request`.

-   Manager validation ensures data consistency.

* * * * *

🎥 Screen Recording Requirement
-------------------------------

Record a short demo showing:

-   Server running

-   Example API request for each endpoint

-   DB result before/after operations

* * * * *

🏁 Conclusion
-------------

This project demonstrates:

-   Node.js REST API development

-   Database handling with SQLite

-   Modular validation and reusable code patterns

-   Real-world user data processing rules

* * * * *

### 👨‍💻 Developer

**Nitheesh**