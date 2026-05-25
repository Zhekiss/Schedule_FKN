import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from database import Base
from models import Course, Group

# 1. Создаем отдельную тестовую базу данных (в файле test.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Функция, которая подменит вашу оригинальную get_db
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Заменяем зависимость в приложении
app.dependency_overrides[get_db] = override_get_db

# Создаем клиента для эмуляции запросов к API
client = TestClient(app)

# 3. Фикстура (setup/teardown)
# Этот код будет автоматически запускаться перед КАЖДЫМ тестом и очищать базу после него
@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# --- Сами тесты ---

def test_read_root():
    """Тест проверки работоспособности сервера"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend FastAPI is working good!"}

def test_get_courses_empty():
    """Тест: запрос списка курсов из пустой базы"""
    response = client.get("/api/admin/courses")
    assert response.status_code == 200
    assert response.json() == []  # Ожидаем пустой список

def test_create_and_get_courses():
    """Тест: добавление данных в базу и проверка, что API их отдает"""
    # Симулируем работу базы данных: добавляем курс напрямую
    db = TestingSessionLocal()
    new_course = Course(name="3 курс")
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Добавим сразу группу, чтобы проверить фильтрацию по курсу
    new_group = Group(name="9 группа", course_id=new_course.id)
    db.add(new_group)
    db.commit()
    db.close()

    # Делаем запрос к API курсов
    response_courses = client.get("/api/admin/courses")
    assert response_courses.status_code == 200
    courses_data = response_courses.json()
    assert len(courses_data) == 1
    assert courses_data[0]["name"] == "3 курс"

    # Делаем запрос к API групп с параметром course_id
    response_groups = client.get(f"/api/admin/groups?course_id={courses_data[0]['id']}")
    assert response_groups.status_code == 200
    groups_data = response_groups.json()
    assert len(groups_data) == 1
    assert groups_data[0]["name"] == "9 группа"