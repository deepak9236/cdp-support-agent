# CDP Support Agent

A chatbot that can answer "how-to" questions related to four Customer Data Platforms (CDPs): Segment, mParticle, Lytics, and Zeotap.

## Installation and Setup

### Prerequisites
- Node.js 
- MongoDB
- npm or yarn

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/deepak9236/cdp-support-agent.git
   cd cdp-support-agent
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in backend the root directory with the following variables:
   ```
    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # MongoDB Connection
    MONGODB_URI=mongodb://localhost:27017/cdp-support-agent

    # Documentation Storage Paths
    DOCS_BASE_PATH=./data

    # Logging
    LOG_LEVEL=info

    # API Keys (if applicable for CDP APIs)
    SEGMENT_API_KEY=your_segment_api_key
    MPARTICLE_API_KEY=your_mparticle_api_key
    LYTICS_API_KEY=your_lytics_api_key
    ZEOTAP_API_KEY=your_zeotap_api_key
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install frontend dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in frontend the root directory with the following variables:
   ```
   REACT_APP_API_URL = http://localhost:5000/api
   ```
4. Start the frontend development server
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Features

- Answer "how-to" questions about CDP platforms
- Extract information from documentation
- Handle variations in questions
- Cross-CDP comparisons
- Support for advanced queries

## Tech Stack

- **Backend:** Node.js with Express
- **Frontend:** React.js with Tailwind CSS
- **Database:** MongoDB
- **Data Extraction:** Documentation processing
- **NLP Processing:** Simple keyword-based retrieval
