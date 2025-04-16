# Recipe Portal

## Overview

Recipe Portal is a web application that allows users to generate recipes based on their input. Utilizing advanced AI technology, the app generates a list of ingredients and their quantities for various recipes, making meal planning easier and more efficient. The application is built using Node.js, Express, and integrates with the Gemini API for natural language processing.

## Features

- **User Authentication**: Secure user authentication using JWT tokens.
- **Recipe Generation**: Generate ingredient lists for recipes based on user input.
- **Search Functionality**: Search for existing recipes by name.
- **Ingredient Processing**: Automatically formats and sanitizes ingredient names and quantities.
- **Responsive Design**: User-friendly interface that works on various devices.

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose for object modeling)
- **Authentication**: Passport.js for Google OAuth
- **API Integration**: Gemini API for generating recipe content
- **Environment Variables**: dotenv for managing sensitive information

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recipe-portal.git
   cd recipe-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
     JWT_SECRET=your_jwt_secret
     GEMINI_API_KEY=your_gemini_api_key
     CLIENT_URL=http://localhost:3000
     ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`.

## Usage

- **Authentication**: Users can log in using their Google account.
- **Generate Recipes**: After logging in, users can input a recipe name to generate a list of ingredients.
- **View Recipes**: Users can search for and view existing recipes.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the developers of the Gemini API for providing powerful AI capabilities.
- Special thanks to the open-source community for their contributions and support.