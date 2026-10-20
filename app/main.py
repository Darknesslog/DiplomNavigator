from fastapi import FastAPI

app = FastAPI(title="DiplomNavigator API")

@app.get("/health")
def health():
    return {"status": "ok"}