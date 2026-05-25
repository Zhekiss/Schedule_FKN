import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmptyRooms from "./EmptyRooms";

// 1. "Мокаем" (подменяем) функцию запроса к API.
// Тесты фронтенда не должны реально стучаться на бэкенд, они должны быть изолированы.
vi.mock("../data/api", () => ({
  fetchEmptyRooms: vi.fn().mockResolvedValue(["Ауд. 101", "Ауд. 201"]),
}));

describe("Компонент EmptyRooms", () => {
  it("должен рендерить заголовок", () => {
    // Отрисовываем компонент в виртуальном DOM
    render(<EmptyRooms />);
    
    // Ищем текст на экране
    const title = screen.getByText(/Свободные аудитории/i);
    expect(title).toBeInTheDocument();
  });

  it("должен отображать аудитории, полученные из API", async () => {
    render(<EmptyRooms />);
    
    // Так как данные подгружаются асинхронно, используем waitFor
    await waitFor(() => {
      expect(screen.getByText("Ауд. 101")).toBeInTheDocument();
      expect(screen.getByText("Ауд. 201")).toBeInTheDocument();
    });
  });
});