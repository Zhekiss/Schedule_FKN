import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Onboarding from "./Onboarding";

describe("Компонент Onboarding (Выбор группы)", () => {
  it("должен блокировать кнопку 'Продолжить' по умолчанию", () => {
    // Рендерим компонент, передаем пустую функцию вместо onComplete
    render(<Onboarding onComplete={vi.fn()} />);
    
    // Находим кнопку и проверяем, что она отключена (disabled)
    const button = screen.getByText("Продолжить");
    expect(button).toBeDisabled();
  });

  it("должен разблокировать кнопку после выбора всех данных и передать их", () => {
    // Создаем "шпиона" (mock-функцию), чтобы проверить, какие данные в нее передадутся
    const mockOnComplete = vi.fn();
    render(<Onboarding onComplete={mockOnComplete} />);

    // 1. Студент кликает на "3 курс"
    fireEvent.click(screen.getByText("3 курс"));
    
    // 2. Студент выбирает группу в выпадающем списке
    const groupSelect = screen.getByRole("combobox");
    fireEvent.change(groupSelect, { target: { value: "ПИ-301" } });

    // 3. Студент кликает на "1 подгруппа"
    fireEvent.click(screen.getByText("1 подгруппа"));

    // 4. Проверяем, что кнопка "Продолжить" стала активной
    const button = screen.getByText("Продолжить");
    expect(button).not.toBeDisabled();

    // 5. Имитируем клик по кнопке "Продолжить"
    fireEvent.click(button);

    // 6. Проверяем, что компонент попытался сохранить правильные данные
    expect(mockOnComplete).toHaveBeenCalledWith({
      course: "3 курс",
      group: "ПИ-301",
      subgroup: "1 подгруппа",
    });
  });
});