from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Bảng liên kết nhiều-nhiều giữa schedule và group
schedule_group = Table(
    "schedule_group",
    Base.metadata,
    Column("schedule_id", Integer, ForeignKey("schedule.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True),
)

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    course = relationship("Course", backref="groups")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    # Có thể thêm capacity sau nếu cần

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Schedule(Base):
    __tablename__ = "schedule"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(Integer, nullable=False)            # 0-5 (Thứ 2 - Thứ 7)
    time_slot = Column(Integer, nullable=False)      # 0-7 (cặp tiết)
    subject = Column(String, nullable=False)
    type = Column(String, nullable=False)            # "Лекция", "Практика", "Лабораторная"
    subgroup = Column(String, nullable=True)         # "1 подгруппа", "2 подгруппа", None (Общая)

    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))

    teacher = relationship("Teacher")
    room = relationship("Room")
    course = relationship("Course")
    groups = relationship("Group", secondary=schedule_group, backref="schedules")