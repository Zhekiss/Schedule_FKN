from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ScheduleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    day: int
    timeSlot: int
    subject: str
    type: str
    teacher: str
    room: str
    course: str
    groups: List[str]
    subgroup: Optional[str] = None

class ScheduleDetailOut(ScheduleOut):
    teacher_id: int
    room_id: int
    course_id: int
    group_ids: List[int]

class ScheduleCreate(BaseModel):
    day: int
    time_slot: int
    subject: str
    type: str
    teacher_id: int
    room_id: int
    course_id: int
    group_ids: List[int]
    subgroup: Optional[str] = None

class ScheduleUpdate(BaseModel):
    day: int
    time_slot: int
    subject: str
    type: str
    teacher_id: int
    room_id: int
    course_id: int
    group_ids: List[int]
    subgroup: Optional[str] = None