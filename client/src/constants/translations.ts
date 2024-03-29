import { ICatalogs } from "redux/catalog/catalog.api";

export const ItemNames = {
  id: "",
  qr: "QR",
  name: "Наименование по бухгалтерии",
  month: "Месяц",
  year: "Год",
  serial_number: "Серийный номер",
  model: "Модель",
  description: "Описание",
  additional_information: "Дополнительная информация",
  instruction: "Инструкция",
  status: "Статус",
  user: "Пользователь",
  person: "МОЛ",
  place: "Местоположение",
  device: "Тип устройства",
  type: "Средство",
  updatedAt: "",
};

export const CatalogNames: Record<ICatalogs, string> = {
  person: "МОЛ",
  status: "Статус",
  user: "Пользователь",
  place: "Местоположение",
  device: "Устройства",
  type: "Тип",
  stock_device: "Устройства (Склад)",
};
