from database import engine, SessionLocal, Base
from models import Course, Group, Room, Teacher, Schedule

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Kiểm tra xem đã có dữ liệu chưa
        if db.query(Course).count() > 0:
            print("Database already has data, skipping seed.")
            return

        # Thêm tất cả khóa học
        courses_data = ["1 курс", "2 курс", "3 курс", "4 курс", "Магистратура"]
        courses = {}
        for c_name in courses_data:
            c = Course(name=c_name)
            db.add(c)
            db.flush()
            courses[c_name] = c

        # Thêm nhóm theo khóa
        groups_map = {
            "1 курс": ["ПИ-101", "ПИ-102", "ИБ-101"],
            "2 курс": ["ПИ-201", "ПИ-202", "ИБ-201"],
            "3 курс": ["ПИ-301", "ПИ-302", "ИБ-301"],
            "4 курс": ["ПИ-401", "ПИ-402", "ИБ-401"],
            "Магистратура": ["М-ПИ-11", "М-ИБ-11"],
        }
        for course_name, group_names in groups_map.items():
            course = courses[course_name]
            for g_name in group_names:
                g = Group(name=g_name, course_id=course.id)
                db.add(g)
        db.flush()

        # Thêm phòng
        room_names = [
            "Ауд. 101",
            "Ауд. 102",
            "Ауд. 201",
            "Ауд. 202",
            "Ауд. 301",
            "Ауд. 302",
            "Ауд. 401",
        ]
        rooms = {}
        for r_name in room_names:
            r = Room(name=r_name)
            db.add(r)
            db.flush()
            rooms[r_name] = r

        # Thêm giáo viên
        teacher_names = [
            "Проф. Александров",
            "Иванов И.И.",
            "Петров П.П.",
            "Сидоров С.С.",
            "Смирнова А.А.",
        ]
        teachers = {}
        for t_name in teacher_names:
            t = Teacher(name=t_name)
            db.add(t)
            db.flush()
            teachers[t_name] = t

        # Thêm 2 tiết học mẫu
        g1 = db.query(Group).filter(Group.name == "ПИ-101", Group.course.has(name="1 курс")).first()
        g2 = db.query(Group).filter(Group.name == "ПИ-102", Group.course.has(name="1 курс")).first()
        t1 = teachers["Проф. Александров"]
        t2 = teachers["Иванов И.И."]
        r301 = rooms["Ауд. 301"]
        r201 = rooms["Ауд. 201"]
        c1 = courses["1 курс"]

        s1 = Schedule(
            day=0,
            time_slot=0,
            subject="Высшая математика",
            type="Лекция",
            teacher_id=t1.id,
            room_id=r301.id,
            course_id=c1.id,
            subgroup=None,
        )
        s1.groups = [g1, g2]

        s2 = Schedule(
            day=0,
            time_slot=1,
            subject="Программирование на Python",
            type="Лабораторная",
            teacher_id=t2.id,
            room_id=r201.id,
            course_id=c1.id,
            subgroup="1 подгруппа",
        )
        s2.groups = [g1]

        db.add_all([s1, s2])
        db.commit()
        print("Data has been seeded into the database.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()