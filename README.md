# Contacts Book API Documentation

## Project Description

The "Contacts Book" project is a simple API service for managing contacts. It allows you to perform CRUD (Create, Read, Update, Delete) operations on contacts stored in an address book. This API provides endpoints to list contacts, retrieve specific contacts, add new contacts, update existing contacts, update the favorite status of contacts, and delete contacts.

## Getting Started

To use the "Contacts Book" API, follow the instructions below to set up your environment and understand the available endpoints.

### Base URL

The base URL for all API endpoints is defined in your configuration file (e.g., `.env`) as the `MONGODB_URI` variable. This URL is used to connect to the MongoDB database.

### Required Libraries

Before you start using this API, make sure the following libraries and dependencies are installed:

- [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- [MongoDB](https://www.mongodb.com/) - NoSQL database used by the project.

To install project dependencies, use the following command:

```bash
npm install
```
## Endpoints

### 1. List Contacts

- **Path:** `/api/contacts`
- **Method:** `GET`
- **Description:** Get a list of all contacts in the address book.
- **Response:** 200 OK
- **Example Response:**

  ```json
  [
    {
      "_id": "60e4d52574e786001c0b992d",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+123456789",
      "favorite": true
    }
    // more contacts...
  ]
  ```

### 2. Get Contact by ID

- **Path:** `/api/contacts/{contactId}`
- **Method:** `GET`
- **Description:** Get details of a specific contact based on its ID.
- **URL Parameters:** `{contactId} - Contact ID`
- **Response:**
  200 OK - If the contact is found
  403 Forbidden - User is attempting to access a contact that does not belong to them
  404 Not Found - If the contact is not found or an invalid ID is provided

### 3. Add New Contact

- **Path:** `/api/contacts`
- **Method:** `POST`
- **Description:** Add a new contact to the address book.
- **Request Body:** JSON with contact data
- **Example Request Body:**

```json
[
  {
    "name": "Jan Slonina",
    "email": "jan.slonina@example.com",
    "phone": "+987654321"
  }
]
```

- **Response:** `201 Created`

- **Example Response:**

```json
[
  {
    "_id": "60e4d52574e786001c0b992e",
    "name": "Jan Slonina",
    "email": "jan.slonina@example.com",
    "phone": "+987654321",
    "favorite": false
  }
]
```

### 4. Update Contact

- **Path:** `/api/contacts/{contactId}`
- **Method:** `PUT`
- **Description:** Update the data of a specific contact based on its ID.
- **URL Parameters:** `{contactId} - Contact ID`
- **Request Body:** JSON with updated contact data
- **Example Request Body:**

```json
[
  {
    "name": "Jan Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "987-654-321",
    "favorite": true
  }
]
```

- **Response:**
  200 OK - If the contact is updated
  403 Forbidden - User is attempting to access a contact that does not belong to them
  404 Not Found - If the contact is not found or an invalid ID is provided

### 5. Update Favorite Status

- **Path:** `/api/contacts/{contactId}/favorite`
- **Method:** `PATCH`
- **Description:** Update the favorite status of a contact based on its ID.
- **URL Parameters:** `{contactId} - Contact ID`
- **Request Body:** JSON with the favorite field
- **Example Request Body:**

```json
[
  {
    "favorite": true
  }
]
```

- **Response:**
  200 OK - If the contact's status is updated
  403 Forbidden - User is attempting to access a contact that does not belong to them
  404 Not Found - If the contact is not found or an invalid ID is provided

### 6. Delete Contact

- **Path:** `/api/contacts/{contactId}`
- **Method:** `DELETE`
- **Description:** Delete a specific contact based on its ID.`
- **URL Parameters:** `{contactId} - Contact ID`
- **Response:**
  200 OK - If the contact is deleted
  403 Forbidden - User is attempting to access a contact that does not belong to them
  404 Not Found - If the contact is not found or an invalid ID is provided

### 7. User Registration

- **Path:** /api/users/signup
- **Method:** POST
- **Description:** Register a new user.
- **Request Body:** JSON with new user data
- **Example Request Body:**

```json
{
  "email": "jan.kowalski@example.com",
  "password": "password123"
}
```

- **Response:** 201 Created
- **Example Response:**

```json
{
  "user": {
    "email": "jan.kowalski@example.com",
    "subscription": "starter",
    "avatarURL": "https://www.gravatar.com/avatar/{GRAVATAR_HASH}"
  }
}
```

After registration, the user is automatically assigned an avatar from Gravatar based on their email address. This avatar is accessible at the following URL:

`https://www.gravatar.com/avatar/{GRAVATAR_HASH}`

The Gravatar hash is generated from the user's email address and serves as a unique identifier for the Gravatar avatar.

### 8. User Login

- **Path:** /api/users/login
- **Method:** POST
- **Description:** Log in an existing user.
- **Request Body:** JSON with login data
- **Example Request Body:**

```json
{
  "email": "jan.kowalski@example.com",
  "password": "password123"
}
```

- **Response:** 200 OK
- **Example Response:**

```json
{
  "token": "JWTToken",
  "user": {
    "email": "jan.kowalski@example.com",
    "subscription": "starter",
    "avatarURL": "https://www.gravatar.com/avatar/{GRAVATAR_HASH}"
  }
}
```

### 9. User Logout

- **Path:** /api/users/logout
- **Method:** GET
- **Description:** Log out the currently logged-in user.
- **Request Header:** Authorization: Bearer {JWTToken}
- **Response:** 204 No Content

### 10. Get Currently Logged-In User

- **Path:** /api/users/current
- **Method:** GET
- **Description:** Get information about the currently logged-in user.
- **Request Header:** Authorization: Bearer {JWTToken}
- **Response:** 200 OK
- **Example Response:**

```json
{
  "email": "jan.kowalski@example.com",
  "subscription": "starter",
  "avatarURL": "https://www.gravatar.com/avatar/{GRAVATAR_HASH}"
}
```

### 11. Update User Avatar

This endpoint allows users to change their avatar.

- **Path:** `/api/avatars`
- **Method:** `PATCH`
- **Security:** Requires authentication using a JSON Web Token (JWT). To obtain the token, the user must be logged in and provide it in the Authorization header.

#### Request Parameters:

- **avatar:** A graphic file that will be assigned as the new user avatar. The file should be sent as part of a form with the avatar field.

#### Example Request:

```h
PATCH /api/avatars
Authorization: Bearer {TOKEN_JWT}
Content-Type: multipart/form-data

Content-Disposition: form-data; name="avatar"; filename="new_avatar.jpg"
Content-Type: image/jpeg
```

{TOKEN_JWT} - User's JWT token, required for authentication.

- **Responses:**
- 200 OK: Avatar has been updated successfully. The response contains the URL of the new avatar.

- **Example Response:**

```json
{
  "avatarURL": "/avatars/{UNIQUE_FILENAME}.jpg"
}
```

- 400 Bad Request: No graphic file attached in the request. Response includes the message: "No file uploaded."

- 401 Unauthorized: The user is not authenticated, or the JWT token is invalid. Response includes the message: "Not authorized."

- 500 Internal Server Error: Occurs when there are internal server errors during request processing.

- **Notes:**

- To update the avatar, the user must be authenticated and provide a valid JWT token in the Authorization header.

- If the user already has an assigned avatar, the old file will be deleted from the server.

- The new avatar will be resized to 250x250 pixels and converted to JPEG format with a quality of 60%.

- The avatar file is publicly accessible at the URL /avatars/{UNIQUE_FILENAME}.jpg. You can use this URL to display the avatar on the user's profile page.

## Error Handling

In case of data validation errors, the API returns an HTTP 400 Bad Request along with an appropriate message.
In case of errors related to contact not found, the API returns an HTTP 404 Not Found response.

## Author

This project was created by Jan Słonina.
