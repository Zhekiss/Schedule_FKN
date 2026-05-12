from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal, engine
from models import Base, Course, Group, Room, Teacher, Schedule
from schemas import ScheduleOut, ScheduleDetailOut, ScheduleCreate, ScheduleUpdate

app = FastAPI(title="Расписание API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create table if there are none
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def schedule_to_out(s: Schedule) -> ScheduleOut:
    return ScheduleOut(
        id=s.id,
        day=s.day,
        timeSlot=s.time_slot,
        subject=s.subject,
        type=s.type,
        teacher=s.teacher.name,
        room=s.room.name,
        course=s.course.name,
        groups=[g.name for g in s.groups],
        subgroup=s.subgroup,
    )

def schedule_to_detail_out(s: Schedule) -> ScheduleDetailOut:
    return ScheduleDetailOut(
        id=s.id,
        day=s.day,
        timeSlot=s.time_slot,
        subject=s.subject,
        type=s.type,
        teacher=s.teacher.name,
        room=s.room.name,
        course=s.course.name,
        groups=[g.name for g in s.groups],
        subgroup=s.subgroup,
        teacher_id=s.teacher.id,
        room_id=s.room.id,
        course_id=s.course.id,
        group_ids=[g.id for g in s.groups],
    )

def check_collision(
    db: Session,
    day: int,
    time_slot: int,
    room_id: int,
    teacher_id: int,
    group_ids: List[int],
    exclude_schedule_id: Optional[int] = None,
):
    # rooms
    room_conflict = db.query(Schedule).filter(
        Schedule.day == day,
        Schedule.time_slot == time_slot,
        Schedule.room_id == room_id,
    )
    if exclude_schedule_id:
        room_conflict = room_conflict.filter(Schedule.id != exclude_schedule_id)
    if room_conflict.first():
        return "Аудитория уже занята в это время"

    # teachers
    teacher_conflict = db.query(Schedule).filter(
        Schedule.day == day,
        Schedule.time_slot == time_slot,
        Schedule.teacher_id == teacher_id,
    )
    if exclude_schedule_id:
        teacher_conflict = teacher_conflict.filter(Schedule.id != exclude_schedule_id)
    if teacher_conflict.first():
        teacher_name = db.query(Teacher).get(teacher_id).name
        return f"Преподаватель {teacher_name} уже занят в это время"

    # groups
    for gid in group_ids:
        group_conflict = db.query(Schedule).filter(
            Schedule.day == day,
            Schedule.time_slot == time_slot,
            Schedule.groups.any(id=gid),
        )
        if exclude_schedule_id:
            group_conflict = group_conflict.filter(Schedule.id != exclude_schedule_id)
        if group_conflict.first():
            group_name = db.query(Group).get(gid).name
            return f"Группа {group_name} уже занята в это время"

    return None


# ------------------ DANH MỤC - categories------------------
@app.get("/api/admin/courses")
def get_courses(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name} for c in db.query(Course).all()]

@app.get("/api/admin/groups")
def get_groups(course_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Group)
    if course_id:
        query = query.filter(Group.course_id == course_id)
    return [{"id": g.id, "name": g.name, "course_id": g.course_id} for g in query.all()]

@app.get("/api/admin/rooms")
def get_rooms(db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.query(Room).all()]

@app.get("/api/admin/teachers")
def get_teachers(db: Session = Depends(get_db)):
    return [{"id": t.id, "name": t.name} for t in db.query(Teacher).all()]

# ------------------ Schedule - lịch học ------------------
@app.get("/api/schedule", response_model=List[ScheduleOut])
def get_schedule(
    course: str = Query(...),
    group: str = Query(...),
    subgroup: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    course_obj = db.query(Course).filter(Course.name == course).first()
    if not course_obj:
        return []

    group_obj = db.query(Group).filter(
        Group.name == group, Group.course_id == course_obj.id
    ).first()
    if not group_obj:
        return []

    query = db.query(Schedule).filter(
        Schedule.course_id == course_obj.id,
        Schedule.groups.any(id=group_obj.id),
    )

    if subgroup and subgroup != "Общая":
        query = query.filter(
            (Schedule.subgroup == None) | (Schedule.subgroup == subgroup)
        )
    elif subgroup == "Общая":
        query = query.filter(Schedule.subgroup == None)

    schedule_items = query.order_by(Schedule.day, Schedule.time_slot).all()
    return [schedule_to_out(s) for s in schedule_items]

# ------------------ Empty room - phòng trống ------------------
@app.get("/api/rooms/empty")
def get_empty_rooms(day: int, timeSlot: int, db: Session = Depends(get_db)):
    all_rooms = db.query(Room).all()
    occupied_ids = {
        r[0]
        for r in db.query(Schedule.room_id)
        .filter(Schedule.day == day, Schedule.time_slot == timeSlot)
        .all()
    }
    empty_rooms = [room.name for room in all_rooms if room.id not in occupied_ids]
    return empty_rooms

# ------------------ while editing in modal ------------------
@app.get("/api/schedule/{schedule_id}", response_model=ScheduleDetailOut)
def get_schedule_item(schedule_id: int, db: Session = Depends(get_db)):
    s = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    return schedule_to_detail_out(s)

@app.post("/api/schedule", response_model=ScheduleOut)
def create_schedule(item: ScheduleCreate, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == item.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=400, detail="Преподаватель не найден")
    room = db.query(Room).filter(Room.id == item.room_id).first()
    if not room:
        raise HTTPException(status_code=400, detail="Аудитория не найдена")
    course = db.query(Course).filter(Course.id == item.course_id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Курс не найден")
    groups = db.query(Group).filter(Group.id.in_(item.group_ids)).all()
    if len(groups) != len(item.group_ids):
        raise HTTPException(status_code=400, detail="Некоторые группы не найдены")

    collision = check_collision(
        db, item.day, item.time_slot, item.room_id, item.teacher_id, item.group_ids
    )
    if collision:
        raise HTTPException(status_code=409, detail=collision)

    new_schedule = Schedule(
        day=item.day,
        time_slot=item.time_slot,
        subject=item.subject,
        type=item.type,
        subgroup=item.subgroup,
        teacher_id=item.teacher_id,
        room_id=item.room_id,
        course_id=item.course_id,
    )
    new_schedule.groups = groups
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return schedule_to_out(new_schedule)

@app.put("/api/schedule/{schedule_id}", response_model=ScheduleOut)
def update_schedule(schedule_id: int, item: ScheduleUpdate, db: Session = Depends(get_db)):
    s = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Расписание не найдено")

    teacher = db.query(Teacher).filter(Teacher.id == item.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=400, detail="Преподаватель не найден")
    room = db.query(Room).filter(Room.id == item.room_id).first()
    if not room:
        raise HTTPException(status_code=400, detail="Аудитория не найдена")
    course = db.query(Course).filter(Course.id == item.course_id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Курс не найден")
    groups = db.query(Group).filter(Group.id.in_(item.group_ids)).all()
    if len(groups) != len(item.group_ids):
        raise HTTPException(status_code=400, detail="Некоторые группы не найдены")

    collision = check_collision(
        db,
        item.day,
        item.time_slot,
        item.room_id,
        item.teacher_id,
        item.group_ids,
        exclude_schedule_id=schedule_id,
    )
    if collision:
        raise HTTPException(status_code=409, detail=collision)

    s.day = item.day
    s.time_slot = item.time_slot
    s.subject = item.subject
    s.type = item.type
    s.subgroup = item.subgroup
    s.teacher_id = item.teacher_id
    s.room_id = item.room_id
    s.course_id = item.course_id
    s.groups = groups
    db.commit()
    db.refresh(s)
    return schedule_to_out(s)

@app.delete("/api/schedule/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    s = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    db.delete(s)
    db.commit()
    return {"message": "Занятие удалено"}

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI is working good!"}