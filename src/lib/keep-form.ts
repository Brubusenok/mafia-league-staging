import { startTransition, type FormEvent } from "react";

/**
 * Отправка формы без сброса полей.
 *
 * Обычный <form action={...}> в React 19 после отправки возвращает все поля к
 * начальным значениям: при ошибке человек теряет введённое, а после сохранения
 * видит старые данные. Здесь мы сами собираем данные формы (вместе с нажатой
 * кнопкой) и вызываем действие, поэтому поля остаются как были.
 */
export function keepFormSubmit(action: (payload: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => action(data));
  };
}
