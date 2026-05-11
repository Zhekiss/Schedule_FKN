from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal, engine
from models import Base, Schedule, Group, Course, Teacher, Room
from schemas import ScheduleOut

# Tạo bảng nếu chưa tồn tại (an toàn)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Расписание API")

# CORS cho phép frontend React gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Có thể thêm domain khác nếu cần
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/schedule", response_model=List[ScheduleOut])
def get_schedule(
    course: str = Query(..., description="Название курса, например '1 курс'"),
    group: str = Query(..., description="Название группы, например 'ПИ-101'"),
    subgroup: Optional[str] = Query(None, description="Подгруппа: '1 подгруппа', '2 подгруппа', 'Общая'"),
    db: Session = Depends(get_db)
):
    # Tìm khóa học và nhóm dựa trên tên
    course_obj = db.query(Course).filter(Course.name == course).first()
    if not course_obj:
        return []

    group_obj = db.query(Group).filter(
        Group.name == group,
        Group.course_id == course_obj.id
    ).first()
    if not group_obj:
        return []

    # Lấy tất cả schedule của nhóm này
    query = db.query(Schedule).filter(
        Schedule.course_id == course_obj.id,
        Schedule.groups.any(id=group_obj.id)
    )

    # Lọc subgroup nếu có
    if subgroup and subgroup != "Общая":
        # Nếu chọn "Общая" thì lấy cả những môn không có subgroup (subgroup = None)
        # và những môn có subgroup bằng với lựa chọn của người dùng
        query = query.filter(
            (Schedule.subgroup == None) | (Schedule.subgroup == subgroup)
        )
    else:
        # Nếu không truyền subgroup hoặc là "Общая", chỉ lấy môn chung (không có subgroup)
        # Hoặc tuỳ logic của bạn: hiện tại mock chỉ hiện những môn chung + môn đúng subgroup,
        # nên ở trên đã xử lý nhánh subgroup != Общая rồi, ta có thể lấy cả môn chung
        if subgroup == "Общая":
            query = query.filter(Schedule.subgroup == None)
        else:
            # Khi không truyền subgroup, trả về tất cả môn chung và môn thuộc mọi subgroup?
            # Theo logic mock cũ, nếu subgroup là "1 подгруппа" thì lọc, còn "Общая" lấy chung.
            # Tạm thời mặc định không truyền subgroup thì lấy tất cả lịch của nhóm đó (cả chung lẫn phân nhóm)
            pass

    schedule_items = query.order_by(Schedule.day, Schedule.time_slot).all()

    # Chuyển đổi sang định dạng trả về
    result = []
    for s in schedule_items:
        result.append(ScheduleOut(
            id=s.id,
            day=s.day,
            timeSlot=s.time_slot,
            subject=s.subject,
            type=s.type,
            teacher=s.teacher.name,
            room=s.room.name,
            course=s.course.name,
            groups=[g.name for g in s.groups],
            subgroup=s.subgroup
        ))
    return result

@app.get("/api/rooms/empty")
def get_empty_rooms(day: int, timeSlot: int, db: Session = Depends(get_db)):
    all_rooms = db.query(Room).all()
    occupied_ids = {
        r[0] for r in db.query(Schedule.room_id).filter(
            Schedule.day == day,
            Schedule.time_slot == timeSlot
        ).all()
    }
    empty_rooms = [room.name for room in all_rooms if room.id not in occupied_ids]
    return empty_rooms

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI đang hoạt động ngon lành!"}