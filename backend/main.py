from fastapi import FastAPI

app = FastAPI(title="Расписание API")

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI đang hoạt động ngon lành!"}