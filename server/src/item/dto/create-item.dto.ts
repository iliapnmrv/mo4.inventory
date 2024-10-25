export class CreateItemDto {
  qr: number;
  name: string;
  month: number;
  year: number;
  serial_number: string;
  model: string;
  description: string | null;
  additional_information: string | null;
  status_id: number;
  user_id: number;
  person_id: number;
  place_id: number;
  device_id: number;
  type_id: number;
  checked_at: Date;
}
