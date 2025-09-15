import os
import re
from datetime import date
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai

# Load environment variables (your API key)
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- Configuration ---
LOGS_DIRECTORY = "daily_logs"
os.makedirs(LOGS_DIRECTORY, exist_ok=True)

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
# Allows our Electron app to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models (for request validation) ---
class DailyLog(BaseModel):
    log_date: str
    name: str
    project: str
    tasks_completed: List[str]
    tasks_planned: List[str]
    blockers: List[str]
    reflection_well: str
    reflection_improve: str

class ReportRequest(BaseModel):
    start_date: str # format: YYYY-MM-DD
    end_date: str   # format: YYYY-MM-DD

# --- Helper Functions ---
def parse_markdown_log(file_path: str) -> Optional[DailyLog]:
    """Parse a markdown log file back into DailyLog structure."""
    try:
        with open(file_path, "r") as f:
            content = f.read()
        
        # Extract date from filename
        filename = os.path.basename(file_path)
        log_date = filename.replace('.md', '')
        
        # Parse name
        name_match = re.search(r'\*\*Name:\*\* (.+)', content)
        name = name_match.group(1) if name_match else ""
        
        # Parse project
        project_match = re.search(r'\*\*Project / Sprint:\*\* (.+)', content)
        project = project_match.group(1) if project_match else ""
        
        # Parse tasks completed
        tasks_completed = []
        tasks_completed_section = re.search(r'### ✅ Tasks Completed Today\n(.*?)(?=\n### |$)', content, re.DOTALL)
        if tasks_completed_section:
            tasks_text = tasks_completed_section.group(1)
            tasks_completed = [line.strip('* ').strip() for line in tasks_text.split('\n') if line.strip() and not line.strip() == '* No tasks completed']
        
        # Parse tasks planned
        tasks_planned = []
        tasks_planned_section = re.search(r'### 📋 Tasks Planned for Tomorrow\n(.*?)(?=\n### |$)', content, re.DOTALL)
        if tasks_planned_section:
            tasks_text = tasks_planned_section.group(1)
            tasks_planned = [line.strip('* ').strip() for line in tasks_text.split('\n') if line.strip() and not line.strip() == '* No tasks planned']
        
        # Parse blockers
        blockers = []
        blockers_section = re.search(r'### 🚧 Blockers\n(.*?)(?=\n### |$)', content, re.DOTALL)
        if blockers_section:
            blockers_text = blockers_section.group(1)
            blockers = [line.strip('* ').strip() for line in blockers_text.split('\n') if line.strip() and not line.strip() == '* No blockers']
        
        # Parse reflection well
        reflection_well = ""
        reflection_well_match = re.search(r'\*\*What went well:\*\* (.+?)(?=\n\n|\*\*|$)', content, re.DOTALL)
        if reflection_well_match:
            reflection_well = reflection_well_match.group(1).strip()
        
        # Parse reflection improve
        reflection_improve = ""
        reflection_improve_match = re.search(r'\*\*What could be improved:\*\* (.+?)(?=\n|$)', content, re.DOTALL)
        if reflection_improve_match:
            reflection_improve = reflection_improve_match.group(1).strip()
        
        return DailyLog(
            log_date=log_date,
            name=name,
            project=project,
            tasks_completed=tasks_completed,
            tasks_planned=tasks_planned,
            blockers=blockers,
            reflection_well=reflection_well,
            reflection_improve=reflection_improve
        )
    except Exception as e:
        print(f"Error parsing log file {file_path}: {e}")
        return None

# --- API Endpoints ---
@app.get("/log/{log_date}")
def get_log(log_date: str):
    """Get an existing log entry for a specific date."""
    file_path = os.path.join(LOGS_DIRECTORY, f"{log_date}.md")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Log not found for this date")
    
    log_data = parse_markdown_log(file_path)
    if log_data is None:
        raise HTTPException(status_code=500, detail="Error parsing existing log")
    
    return log_data

@app.post("/log")
def save_log(log: DailyLog):
    """Saves a daily log entry to a markdown file."""
    file_path = os.path.join(LOGS_DIRECTORY, f"{log.log_date}.md")
    try:
        with open(file_path, "w") as f:
            f.write(f"# Daily Log: {log.log_date}\n")
            f.write(f"**Name:** {log.name}\n")
            f.write(f"**Project / Sprint:** {log.project}\n\n")
            
            f.write("### ✅ Tasks Completed Today\n")
            if log.tasks_completed:
                for task in log.tasks_completed: 
                    f.write(f"* {task}\n")
            else:
                f.write("* No tasks completed\n")
            
            f.write("\n### 📋 Tasks Planned for Tomorrow\n")
            if log.tasks_planned:
                for task in log.tasks_planned: 
                    f.write(f"* {task}\n")
            else:
                f.write("* No tasks planned\n")
            
            f.write("\n### 🚧 Blockers\n")
            if log.blockers:
                for blocker in log.blockers: 
                    f.write(f"* {blocker}\n")
            else:
                f.write("* No blockers\n")
            
            f.write("\n### 💭 Reflection\n")
            if log.reflection_well:
                f.write(f"**What went well:** {log.reflection_well}\n\n")
            if log.reflection_improve:
                f.write(f"**What could be improved:** {log.reflection_improve}\n")
                
        return {"message": "Log saved successfully", "file": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    """Generates a report by sending logs to an LLM."""
    # 1. Gather all logs in the date range
    all_logs_content = ""
    # (Simplified logic: in a real app, parse dates properly)
    for filename in sorted(os.listdir(LOGS_DIRECTORY)):
        if request.start_date <= filename.replace('.md', '') <= request.end_date:
            with open(os.path.join(LOGS_DIRECTORY, filename), "r") as f:
                all_logs_content += f.read() + "\n\n---\n\n"

    if not all_logs_content:
        raise HTTPException(status_code=404, detail="No logs found in the specified date range.")

    # 2. Create a powerful prompt for the LLM
    prompt = f"""
    Analyze the following daily work logs and generate a professional career development report.
    The report must have three sections: "STAR Story Seeds", "Room for Improvement", and "Learning Plan for Next Month".

    For the "STAR Story Seeds" section:
    - Identify at least 2-3 significant accomplishments from the logs.
    - For each accomplishment, create a STAR story framework (Situation, Task, Action, Result).
    - The 'Situation', 'Task', and 'Action' should be inferred from the logs.
    - The 'Result' should be a placeholder like "[Add specific metric or impact here.]" as the logs may not contain the final outcome.
    - Focus on themes like process improvement, problem-solving, collaboration, and leadership.
    - Pay special attention to the "What went well" reflections as they often contain key accomplishments.

    For the "Room for Improvement" section:
    - Analyze the 'Blockers' and 'What could be improved' sections of the logs.
    - Summarize recurring challenges or areas for growth.
    - Look for patterns in blockers and improvement reflections across multiple days.

    For the "Learning Plan for Next Month" section:
    - Based on the "Room for Improvement" analysis, suggest 2-3 concrete, actionable learning goals.
    - Consider the blockers mentioned and how they could be addressed through learning.

    Format the entire output in Markdown.

    Here are the logs:
    ---
    {all_logs_content}
    ---
    """

    # 3. Call the LLM API
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-turbo",  # Or "gpt-3.5-turbo", or your preferred model
            messages=[
                {"role": "system", "content": "You are a helpful career coaching assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
        )
        report_content = response.choices[0].message['content']
        return {"report": report_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error contacting LLM: {str(e)}")