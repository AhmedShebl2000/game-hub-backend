# Game Hub Backend - Information Technology Institute (ITI)

This is the backend server for the Game Hub platform, built using Node.js, Express, and MongoDB. It provides RESTful API endpoints for game discovery, user management, authentication, and order processing.

## Table of contents

- Overview
  - Features
  - API Endpoints
  - Links
- Architecture
  - Built with
  - Project Structure
- Models
- Authentication
- Validation
- Services
- Authors

## Overview

### Features

- User Management : Registration, authentication, profile management
- Game Catalog : Browse, search, and filter games
- Wishlist Management : Add/remove games from user wishlists
- Order Processing : Create and manage game orders
- Payment Integration : PayPal payment processing
- Authentication : JWT-based authentication with password reset functionality
- Admin Access : Special routes for administrative functions
- Data Validation : Schema-based validation for all data models

### API Endpoints

- Authentication

  - POST /api/auth : User login
  - POST /api/auth/forgot-password : Request password reset
  - POST /api/auth/reset-password/:token : Reset password with token
  - POST /api/auth/google : Google OAuth authentication

- Users

  - GET /api/users : Get all users (admin only)
  - GET /api/users/:id : Get user by ID
  - POST /api/users : Create new user
  - GET /api/users/wishlist : Get user's wishlist
  - PUT /api/users/wishlist : Add game to wishlist
  - DELETE /api/users/wishlist/:gameId : Remove game from wishlist

- Games

  - GET /api/games : Get games with pagination and filtering
  - GET /api/games/name : Search games by name
  - GET /api/games/:slug : Get game by slug
  - GET /api/games/game/:rawgId : Get game by RAWG ID
  - POST /api/games/add : Add new game
  - DELETE /api/games/:id : Delete game

- Orders

  - GET /api/orders : Get all orders
  - GET /api/orders/:id : Get order by ID
  - POST /api/orders : Create new order
  - PUT /api/orders/:id : Update order
  - DELETE /api/orders/:id : Cancel order

- PayPal

  - POST /api/paypal/create-order : Create PayPal order
  - POST /api/paypal/capture-order : Capture PayPal payment

### Links

- Backend Solution URL: https://github.com/AhmedShebl2000/game-hub-backend/
- Live Back-end URL: https://game-hub-backend-woad.vercel.app/api/
- Frontend Solution URL: https://github.com/YoussefSallem/game-hub-frontend/
- Live Site URL: https://game-hub-iti.netlify.app/home/

## Architecture

### Built with

- Node.js - JavaScript runtime
- Express - Web framework
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling
- JWT - JSON Web Tokens for authentication
- AJV - JSON Schema validator
- bcrypt - Password hashing
- Axios - HTTP client
- Nodemailer - Email sending
- Google Auth Library - Google authentication
- Helmet - Security middleware
- Compression - Response compression
- Serverless - Serverless deployment

### Project Structure

## Models

### User

- Personal information (first name, last name, email, phone)
- Password (hashed)
- Admin status
- Wishlist of games
- Password reset functionality

### Game

- Game details (name, slug, description, release date)
- Media (background image, screenshots, trailers)
- Ratings and reviews
- Platform information
- Store information
- Tags and ESRB ratings
- Price and purchase tracking

### Order

- User reference
- Order items (games with platform and region)
- Payment information
- Order status
- Pricing (subtotal, tax, discount, total)
- Metadata

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- Token Generation : Upon successful login, a JWT token is generated containing the user's ID and admin status
- Token Verification : Protected routes use middleware to verify the token
- Password Reset : Secure password reset flow with tokenized email links
- Google OAuth : Support for Google authentication
- Admin Access : Special middleware to restrict routes to admin users

## Validation

All data models are validated using AJV (Another JSON Validator):

- Schema Definitions : JSON schemas defined for all models
- Request Validation : Incoming requests validated against schemas
- Custom Validators : Additional validation logic for specific fields
- Error Handling : Detailed validation error messages

## Services

### Email Service

- Password reset emails
- Transactional notifications

### Data Services

- Game data seeding from RAWG API
- Game data fetching and updating

### Payment Service

- PayPal integration for payment processing
- Order creation and capture

## Authors

- Kareem Ehab

  - [GitHub](https://github.com/KareemEhab)
  - [LinkedIn](https://www.linkedin.com/in/kareem-hamouda/)

- Youssef Yasser

  - [GitHub](https://github.com/Youssef-Yasser-Mahmoud)
  - [LinkedIn](https://www.linkedin.com/in/youssef-yasser-mahmoud/)

- Mahmoud Mohamed

  - [GitHub](https://github.com/mahmoud1mandour)
  - [LinkedIn](https://www.linkedin.com/in/mahmoud1mandour/)

- Ahmed Shebl

  - [GitHub](https://github.com/AhmedShebl2000)
  - [LinkedIn](https://www.linkedin.com/in/ahmedshebl16/)

- Youssef Salem

  - [GitHub](https://github.com/YoussefSallem)
  - [LinkedIn](https://www.linkedin.com/in/yousseffsalem/)
