# Career Story Builder

A comprehensive daily work logging and career development report generation application built with FastAPI backend and Electron frontend. Track your daily accomplishments, reflect on your work, and generate AI-powered career development reports using OpenAI's GPT models.

## �� Features

### Daily Work Logging
- **Project Tracking**: Log work by project/sprint
- **Task Management**: Record completed tasks and plan future work
- **Blocker Documentation**: Track impediments and challenges
- **Reflection System**: Capture what went well and areas for improvement
- **Flexible Input**: Required fields for essential data, optional fields for detailed insights

### AI-Powered Report Generation
- **STAR Story Seeds**: Automatically identify accomplishments and format them using the STAR method (Situation, Task, Action, Result)
- **Growth Analysis**: Analyze blockers and improvement areas to identify development opportunities
- **Learning Plans**: Generate actionable learning goals based on your work patterns
- **Professional Formatting**: Reports generated in clean Markdown format

## 🏗️ Architecture

The application consists of two main components:

### Backend (`career-story-backend/`)
- **FastAPI** web server providing REST API endpoints
- **OpenAI Integration** for AI-powered report generation
- **File-based Storage** for daily logs (Markdown format)
- **CORS-enabled** for frontend communication

### Frontend (`career-story-frontend/`)
- **Electron** desktop application
- **HTML/CSS/JavaScript** interface
- **Responsive Design** with two-column layout
- **Real-time API Communication** with backend

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API Key

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd career-story
```

### 2. Backend Setup
```bash
cd career-story-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv openai

# Set up environment variables
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

### 3. Frontend Setup
```bash
cd ../career-story-frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### 1. Start the Backend Server
```bash
cd career-story-backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`

### 2. Start the Frontend Application
```bash
cd career-story-frontend
npm start
```

This will launch the Electron desktop application.

## 📖 Usage

### Daily Logging
1. **Fill Required Fields**:
   - Date
   - Project Name
   - Tasks Completed (one per line)

2. **Optional Fields** (provide as much detail as desired):
   - Tasks Planned for Tomorrow
   - Blockers encountered
   - What went well today
   - What could be improved

3. **Save Log**: Click "Save Log" to store your entry

### Report Generation
1. **Select Date Range**: Choose start and end dates for your report
2. **Generate Report**: Click "Generate" to create an AI-powered career development report
3. **Review Results**: The report will appear in the right panel with:
   - STAR Story Seeds (accomplishments formatted for interviews)
   - Room for Improvement (growth areas)
   - Learning Plan for Next Month (actionable goals)

## 📁 Data Storage

Daily logs are stored as individual Markdown files in the `daily_logs/` directory:
- Format: `YYYY-MM-DD.md`
- Structured with headers and bullet points
- Human-readable and version-controllable

## 🔧 API Endpoints

### POST `/log`
Save a daily work log entry.

**Request Body**:
```json
{
  "log_date": "2024-01-15",
  "name": "Your Name",
  "project": "Project Name",
  "tasks_completed": ["Task 1", "Task 2"],
  "tasks_planned": ["Future Task 1"],
  "blockers": ["Blocker 1"],
  "reflection_well": "What went well",
  "reflection_improve": "What could be improved"
}
```

### POST `/generate-report`
Generate a career development report for a date range.

**Request Body**:
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

## �� Data Model

### DailyLog
- `log_date`: Date of the log entry (YYYY-MM-DD)
- `name`: Your name
- `project`: Project or sprint name
- `tasks_completed`: List of completed tasks
- `tasks_planned`: List of planned tasks (optional)
- `blockers`: List of blockers encountered (optional)
- `reflection_well`: What went well (optional)
- `reflection_improve`: What could be improved (optional)

## 🔒 Security Notes

- **API Key**: Store your OpenAI API key securely in the `.env` file
- **CORS**: Currently configured for development (`allow_origins=["*"]`)
- **Production**: Restrict CORS origins and implement proper authentication for production use

## 🚧 Development

### Backend Development
- Uses FastAPI with automatic API documentation at `http://127.0.0.1:8000/docs`
- Hot reload enabled for development
- Structured with Pydantic models for request validation

### Frontend Development
- Electron app with developer tools enabled
- Simple HTML/CSS/JavaScript (no build process required)
- Direct API communication via fetch

## 📝 Example Log Entry

```markdown
# Daily Log: 2024-01-15
**Name:** Sonali Gupta
**Project / Sprint:** Avyott

### ✅ Tasks Completed Today
* Implemented user authentication system
* Fixed bug in payment processing
* Reviewed code for team members

### 📋 Tasks Planned for Tomorrow
* Add unit tests for authentication
* Optimize database queries

### 🚧 Blockers
* Waiting for API documentation from third-party service

### 💭 Reflection
**What went well:** Successfully debugged a complex payment issue that was blocking the team.

**What could be improved:** Should have asked for help earlier instead of spending 3 hours debugging alone.
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## �� License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**: Ensure Python virtual environment is activated and all dependencies are installed
2. **Frontend won't connect**: Verify backend is running on `http://127.0.0.1:8000`
3. **Report generation fails**: Check that your OpenAI API key is valid and has sufficient credits
4. **CORS errors**: Ensure backend CORS middleware is properly configured

### Getting Help

- Check the FastAPI documentation at `http://127.0.0.1:8000/docs` for API details
- Review the browser console for frontend errors
- Check backend logs for server-side issues

---

**Built with ❤️ for career development and professional growth**
