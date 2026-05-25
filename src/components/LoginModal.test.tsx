import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginModal from "./LoginModal";

describe("Компонент LoginModal (Авторизация)", () => {
  it("должен показывать ошибку при вводе неверного пароля", () => {
    // Рендерим открытое модальное окно
    render(<LoginModal isOpen={true} onClose={vi.fn()} onLoginSuccess={vi.fn()} />);
    
    // Находим поля ввода по их плейсхолдерам
    const loginInput = screen.getByPlaceholderText("admin");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByText("Войти");

    // Имитируем ввод текста пользователем
    fireEvent.change(loginInput, { target: { value: "hacker" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    
    // Нажимаем кнопку входа
    fireEvent.click(submitButton);

    // Проверяем, что на экране появилось сообщение об ошибке
    expect(screen.getByText("Неверный логин или пароль")).toBeInTheDocument();
  });

  it("должен вызывать onLoginSuccess при правильных данных", () => {
    const mockOnSuccess = vi.fn();
    render(<LoginModal isOpen={true} onClose={vi.fn()} onLoginSuccess={mockOnSuccess} />);
    
    const loginInput = screen.getByPlaceholderText("admin");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByText("Войти");

    // Вводим правильные данные (те, что захардкожены у вас в компоненте)
    fireEvent.change(loginInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "admin123" } });
    fireEvent.click(submitButton);

    // Проверяем, что функция успешного входа была вызвана
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});