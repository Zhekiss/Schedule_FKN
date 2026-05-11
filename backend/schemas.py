from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ScheduleOut(BaseModel):
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
    model_config = ConfigDict(from_attributes=True)