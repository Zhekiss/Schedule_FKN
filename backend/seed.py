from database import engine, SessionLocal, Base
from models import Course, Group, Room, Teacher, Schedule

def init_db():
    # Tạo tất cả bảng (nếu chưa có)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Kiểm tra xem đã có dữ liệu chưa, nếu có rồi thì không thêm nữa
        if db.query(Course).count() > 0:
            print("Database đã có dữ liệu, bỏ qua seed.")
            return

        # Thêm Courses
        c1 = Course(name="1 курс")
        c2 = Course(name="2 курс")
        db.add_all([c1, c2])
        db.flush()

        # Thêm Groups
        g1 = Group(name="ПИ-101", course_id=c1.id)
        g2 = Group(name="ПИ-102", course_id=c1.id)
        g3 = Group(name="ПИ-201", course_id=c2.id)
        db.add_all([g1, g2, g3])
        db.flush()

        # Thêm Rooms
        r301 = Room(name="Ауд. 301")
        r201 = Room(name="Ауд. 201")
        db.add_all([r301, r201])
        db.flush()

        # Thêm Teachers
        t1 = Teacher(name="Проф. Александров")
        t2 = Teacher(name="Иванов И.И.")
        db.add_all([t1, t2])
        db.flush()

        # Thêm Schedule mẫu (2 tiết)
        s1 = Schedule(
            day=0,                      # Thứ 2
            time_slot=0,                # 8:00
            subject="Высшая математика",
            type="Лекция",
            teacher_id=t1.id,
            room_id=r301.id,
            course_id=c1.id,
            subgroup=None,              # Cả lớp
        )
        s1.groups = [g1, g2]            # Tham gia cả 2 nhóm

        s2 = Schedule(
            day=0,
            time_slot=1,                # 9:45
            subject="Программирование на Python",
            type="Лабораторная",
            teacher_id=t2.id,
            room_id=r201.id,
            course_id=c1.id,
            subgroup="1 подгруппа",     # Chỉ phân nhóm 1
        )
        s2.groups = [g1]                # Chỉ nhóm ПИ-101

        db.add_all([s1, s2])
        db.commit()
        print("Đã seed dữ liệu mẫu vào database.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()